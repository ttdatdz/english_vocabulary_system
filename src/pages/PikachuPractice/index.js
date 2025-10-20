import React, { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, Card, Typography, Space, Button, Tag, message, Skeleton, Modal } from "antd";
import { ReloadOutlined, SoundOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "./PikachuPractice.scss";
import { get } from "../../utils/request";

const { Title, Text } = Typography;

/** @typedef {Object} BackendCard
 *  @property {number} id
 *  @property {string} terminology // English
 *  @property {string} definition  // Vietnamese
 *  @property {string=} image
 *  @property {string=} audio
 *  @property {string=} pronounce
 *  @property {number=} level
 *  @property {number=} isRemember
 *  @property {string=} partOfSpeech
 *  @property {string[]=} example
 *  @property {string[]=} hint
 */

// -------------------- Tile helpers --------------------
const LANG_EN = "en";
const LANG_VI = "vi";

function makeTile(card, side /** 'en'|'vi' */) {
    return {
        key: `${card.id}-${side}-${Math.random().toString(36).slice(2, 7)}`,
        pairId: card.id,
        lang: side,
        text: side === LANG_EN ? card.terminology : card.definition,
        audio: card.audio,
        pronounce: card.pronounce,
    };
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function emptyIndices(board) { return board.map((v, i) => (v ? null : i)).filter(v => v !== null); }

// ============================== Component ==============================
export default function PikachuPractice() {
    const [matchedIndices, setMatchedIndices] = useState([]); // các ô đang được tô xanh trước khi biến mất
    const [initialized, setInitialized] = useState(false);
    const endTimerRef = useRef(null);
    const navigate = useNavigate();
    const { flashcardId } = useParams();
    console.log("PikachuPractice flashCardId =", flashcardId);
    // ------- Fixed config -------
    const grid = { rows: 4, cols: 3 }; // 12 cells fixed
    const targetPairs = 3;

    // ------- Data states -------
    const [allCards, setAllCards] = useState([]); // BackendCard[]
    const [loading, setLoading] = useState(true);

    // Board is a flat array of length rows*cols containing tile or null
    const [board, setBoard] = useState([]);
    const [activePairIds, setActivePairIds] = useState(new Set()); // ids whose both sides are currently on board
    const [remainingIds, setRemainingIds] = useState([]); // ids not yet introduced as full pairs

    // Selection
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [shakeIndices, setShakeIndices] = useState([]); // for wrong-pair animation

    // Stats & end state
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [endOpen, setEndOpen] = useState(false);

    const totalCells = grid.rows * grid.cols;

    // -------------------- Load data (API placeholder) --------------------
    useEffect(() => {
        let canceled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await get(`api/card/getByFlashCard/${flashcardId}`);
                const list = res.listCardResponse;
                if (!canceled) setAllCards(list);
            } catch (e) {
                console.error(e);
                if (!canceled) message.error("Không tải được dữ liệu thẻ.");
            } finally {
                if (!canceled) setLoading(false);
            }
        })();
        return () => { canceled = true; };
    }, []);

    // -------------------- Board initialization --------------------
    useEffect(() => {
        if (loading) return;
        if (!allCards.length) return;

        const initial = Array(totalCells).fill(null);
        const idsShuffled = shuffle(allCards.map(c => c.id));
        const seedPairIds = idsShuffled.slice(0, Math.min(targetPairs, idsShuffled.length));
        const remain = idsShuffled.slice(seedPairIds.length); // pool to use later

        const active = new Set();

        // place seed pairs
        seedPairIds.forEach((id) => {
            const card = allCards.find(c => c.id === id);
            const idxs = emptyIndices(initial);
            if (idxs.length < 2) return;
            const pickA = randomChoice(idxs); initial[pickA] = makeTile(card, LANG_EN);
            const idxs2 = emptyIndices(initial); const pickB = randomChoice(idxs2); initial[pickB] = makeTile(card, LANG_VI);
            active.add(id);
        });

        // fill remaining with distractors (avoid completing more pairs accidentally)
        const fillAsDistractor = () => {
            let empties = emptyIndices(initial);
            let guard = 0;
            while (empties.length && guard < totalCells * 3) {
                guard++;
                const i = empties.pop();
                const card = randomChoice(allCards);
                const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;
                const wouldCompletePair = active.has(card.id) && initial.some(t => t && t.pairId === card.id && t.lang !== side);
                if (wouldCompletePair) { empties.unshift(i); continue; }
                initial[i] = makeTile(card, side);
            }
        };

        fillAsDistractor();

        setBoard(initial);
        setActivePairIds(active);
        setRemainingIds(remain);
        setSelectedIndex(null);
        setShakeIndices([]);
        setScore(0);
        setMoves(0);
        setEndOpen(false);
        setInitialized(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, allCards]);

    // -------------------- End detection --------------------
    useEffect(() => {
        if (loading || !initialized) return;

        const finished = remainingIds.length === 0 && activePairIds.size === 0;
        if (finished) {
            if (endTimerRef.current) clearTimeout(endTimerRef.current);
            endTimerRef.current = setTimeout(() => setEndOpen(true), 1000); // delay 1s
        } else {
            if (endTimerRef.current) { clearTimeout(endTimerRef.current); endTimerRef.current = null; }
        }

        return () => {
            if (endTimerRef.current) { clearTimeout(endTimerRef.current); endTimerRef.current = null; }
        };
    }, [remainingIds, activePairIds, loading, initialized]);


    // -------------------- Refill helpers (finite) --------------------
    function placeNewPairPrefer(indicesPrefer, currentBoard, currentActive) {
        // Only place if we still have remaining ids
        if (!remainingIds.length) return { board: currentBoard, active: currentActive };

        const pickId = remainingIds[0];
        const card = allCards.find(c => c.id === pickId);
        const empties = emptyIndices(currentBoard);
        if (empties.length < 2 && indicesPrefer.length < 2) return { board: currentBoard, active: currentActive };

        const [first, second] = (indicesPrefer.length >= 2 ? indicesPrefer.slice(0, 2) : shuffle(empties)).slice(0, 2);
        const b2 = currentBoard.slice();
        b2[first] = makeTile(card, LANG_EN);
        b2[second] = makeTile(card, LANG_VI);

        const a2 = new Set(currentActive); a2.add(pickId);
        setRemainingIds(prev => prev.slice(1)); // consume one id from pool
        return { board: b2, active: a2 };
    }

    function fillDistractorsFinite(currentBoard, currentActive) {
        // Fill remaining empties with single sides but NEVER create a new full pair beyond active pairs.
        const b2 = currentBoard.slice();
        const aIds = new Set(currentActive);
        let empties = emptyIndices(b2);
        let guard = 0;
        while (empties.length && guard < totalCells * 3) {
            guard++;
            const i = empties.pop();
            const card = randomChoice(allCards);
            const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;
            const wouldCompletePair = aIds.has(card.id) && b2.some(t => t && t.pairId === card.id && t.lang !== side);
            if (wouldCompletePair) { empties.unshift(i); continue; }
            b2[i] = makeTile(card, side);
        }
        return b2;
    }

    // -------------------- Handlers --------------------
    function onTileClick(index) {
        const tile = board[index];
        if (!tile) return;

        if (selectedIndex === null) { setSelectedIndex(index); return; }
        if (index === selectedIndex) return; // same tile

        const first = board[selectedIndex];
        const second = tile;

        // only allow EN + VI selections
        if (first.lang === second.lang) { setSelectedIndex(index); return; }

        setMoves(m => m + 1);

        if (first.pairId === second.pairId) {
            // đánh dấu hai ô "đúng" để tô xanh
            const a = selectedIndex;
            const b = index;
            setMatchedIndices([a, b]);
            setSelectedIndex(null);

            // đợi 450ms cho hiệu ứng xanh, rồi mới xóa và (nếu còn) chèn cặp mới
            setTimeout(() => {
                const b2 = board.slice();
                const removedPositions = [a, b];
                b2[a] = null;
                b2[b] = null;

                const a2 = new Set(activePairIds);
                a2.delete(first.pairId);

                let nextBoard = b2;
                let nextActive = a2;
                if (a2.size < targetPairs && remainingIds.length > 0) {
                    const placed = placeNewPairPrefer(removedPositions, b2, a2);
                    nextBoard = placed.board;
                    nextActive = placed.active;
                }
                // KHÔNG lấp distractor sau match → bảng trống dần
                setBoard(nextBoard);
                setActivePairIds(nextActive);
                setScore(s => s + 1);
                setMatchedIndices([]); // clear class xanh
            }, 450);

        } else {
            // sai → rung + viền đỏ
            const a = selectedIndex;
            const b = index;
            setShakeIndices([a, b]);
            setTimeout(() => setShakeIndices([]), 420);
            setSelectedIndex(null);
        }

    }

    function resetGame() {
        // re-init by shuffling allCards order (will trigger init effect)
        setInitialized(false);
        setAllCards(shuffle(allCards));
    }

    // -------------------- Derived --------------------
    const gridTemplate = useMemo(() => ({ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }), [grid.cols]);

    // -------------------- Render --------------------
    return (
        <div className="vocab-memory-page">
            <div className="page-header">
                <Space size={12} wrap>
                    <Button onClick={() => navigate(-1)} icon={<ReloadOutlined rotate={180} />}>Back</Button>
                    <Title level={3} style={{ margin: 0 }}>Pikachu Vocabulary Memory</Title>
                    <Tag color="blue">EN ↔ VI</Tag>
                </Space>
                <Space size={16} wrap>
                    <Button icon={<ReloadOutlined />} onClick={resetGame}>Reset</Button>
                </Space>
            </div>

            <div className="stats-bar">
                <Space size={24}>
                    <Text strong>Score: {score}</Text>
                    <Text>Moves: {moves}</Text>
                    <Text>Active pairs: {activePairIds.size}</Text>
                </Space>
            </div>

            {loading ? (
                <Row gutter={16}>
                    <Col xs={24} lg={16}>
                        <Row gutter={[16, 16]}>
                            {Array.from({ length: totalCells }).map((_, i) => (
                                <Col span={8} key={i}>
                                    <Skeleton.Button active block style={{ height: 110 }} />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                    <Col xs={24} lg={8}>
                        <div className="sidebar">
                            <Title level={5} style={{ marginTop: 0 }}>Hướng dẫn ôn tập</Title>
                            <ul className="guide">
                                
                            </ul>
                        </div>
                    </Col>
                </Row>
            ) : (
                <Row gutter={16}>
                    <Col xs={24} lg={16}>
                        <div className="board">
                            {board.map((tile, idx) => (
                                <Card
                                    key={idx + (tile?.key || "empty")}
                                    className={[
                                        "tile",
                                        selectedIndex === idx ? "tile--selected" : "",
                                        tile ? `tile--${tile.lang}` : "tile--empty",
                                        shakeIndices.includes(idx) ? "tile--shake" : "",
                                        matchedIndices.includes(idx) ? "tile--matched" : "", // ✅ nhớ class matched
                                    ].join(" ")}
                                    onClick={() => onTileClick(idx)}
                                    hoverable={!!tile}
                                >
                                    {tile ? (
                                        <Space direction="vertical" size={2} style={{ width: "100%" }}>
                                            <Text className="tile-label">{tile.lang === LANG_EN ? "EN" : "VI"}</Text>
                                            <Text className="tile-text">{tile.text}</Text>
                                            <Space>
                                                {tile.pronounce && tile.lang === LANG_EN && <Tag color="default">{tile.pronounce}</Tag>}
                                                {tile.audio && tile.lang === LANG_EN && (
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<SoundOutlined />}
                                                        onClick={(e) => { e.stopPropagation(); new Audio(tile.audio).play().catch(() => { }); }}
                                                    />
                                                )}
                                            </Space>
                                        </Space>
                                    ) : <div className="tile-empty" />}
                                </Card>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="sidebar">
                            <Title level={5} style={{ marginTop: 0 }}>Hướng dẫn ôn tập</Title>
                            <ul className="guide">
                                
                            </ul>
                        </div>
                    </Col>
                </Row>
            )}


            <div className="page-footer">
                <Text type="secondary">Mẹo: Chọn 1 ô English và 1 ô Vietnamese tạo thành cặp đúng để ghi điểm. Khi hết từ mới, trò chơi sẽ kết thúc và hiển thị kết quả.</Text>
            </div>

            <Modal
                open={endOpen}
                title="Hoàn thành bài luyện"
                footer={[
                    <Button key="back" onClick={() => navigate(-1)}>Quay lại</Button>,
                    <Button key="retry" type="primary" onClick={() => { setInitialized(false); setAllCards(shuffle(allCards)); setEndOpen(false); }}>Làm lại</Button>,
                ]}
                onCancel={() => setEndOpen(false)}
            >
                <Space direction="vertical" size={6}>
                    <Text>✅ Số cặp đúng: <b>{score}</b></Text>
                    <Text>🔁 Số lượt chọn: <b>{moves}</b></Text>
                </Space>
            </Modal>

        </div>
    );
}