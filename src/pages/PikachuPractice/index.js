// =========================================================
// File: src/pages/VocabMemory/index.js
// Description: Pikachu-style vocabulary matching (EN ↔ VI) using Ant Design
// Requirements satisfied:
// - Board shows few true pairs at any time; rest are distractors
// - User selects 1 English + 1 Vietnamese; if correct, both disappear
// - Immediately replace with a new pair from the remaining pool
// - When board has empty cells, new tiles are inserted at random positions
// - Data is loaded when entering the page (API call placeholder marked TODO)
// - Uses react-router-dom navigation
// - Fits folder structure: pages/VocabMemory/{index.js, style.scss}
// =========================================================

import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Typography, Space, Button, Tag, message, Segmented, Skeleton } from "antd";
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
    const navigate = useNavigate();

    // ------- Config -------
    const [grid, setGrid] = useState({ rows: 4, cols: 4 }); // 16 cells
    const [targetPairs, setTargetPairs] = useState(3); // concurrently visible correct pairs

    // ------- Data states -------
    const [allCards, setAllCards] = useState([]); // BackendCard[]
    const [loading, setLoading] = useState(true);

    // Board is a flat array of length rows*cols containing tile or null
    const [board, setBoard] = useState([]);
    const [activePairIds, setActivePairIds] = useState(new Set()); // ids whose both sides are currently on board
    const [usedPairIds, setUsedPairIds] = useState(new Set());

    // Selection
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Stats
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);

    const {flashcardId} = useParams();

    const totalCells = grid.rows * grid.cols;

    // -------------------- Load data (API placeholder) --------------------
    useEffect(() => {
        let canceled = false;
        (async () => {
            try {
                setLoading(true);
                const data = await get(`api/card/getByFlashCard/${flashcardId}`);
                const list = data.listCardResponse;
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
        const activePairs = new Set();

        // choose distinct ids for visible pairs
        const ids = shuffle(allCards.map(c => c.id)).slice(0, Math.min(targetPairs, allCards.length));

        // place each pair on random empty positions
        ids.forEach((id) => {
            const card = allCards.find(c => c.id === id);
            const idxs = emptyIndices(initial);
            if (idxs.length < 2) return;
            const pickA = randomChoice(idxs);
            initial[pickA] = makeTile(card, LANG_EN);
            const idxs2 = emptyIndices(initial);
            const pickB = randomChoice(idxs2);
            initial[pickB] = makeTile(card, LANG_VI);
            activePairs.add(id);
        });

        // fill remaining with distractors (single-side only), trying to not complete extra pairs
        const fillAsDistractor = () => {
            let empties = emptyIndices(initial);
            let guard = 0;
            while (empties.length && guard < totalCells * 3) {
                guard++;
                const i = empties.pop();
                const card = randomChoice(allCards);
                const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;
                const wouldCompletePair = activePairs.has(card.id) && initial.some(t => t && t.pairId === card.id && t.lang !== side);
                if (wouldCompletePair) {
                    // put index back and try another pick
                    empties.unshift(i);
                    continue;
                }
                initial[i] = makeTile(card, side);
            }
        };

        fillAsDistractor();

        setBoard(initial);
        setActivePairIds(activePairs);
        setUsedPairIds(new Set());
        setSelectedIndex(null);
        setScore(0);
        setMoves(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, allCards, grid.rows, grid.cols, targetPairs]);

    // -------------------- Refill helpers --------------------
    function placeNewPairAt(indicesPrefer, currentBoard, currentActive) {
        const activeIds = new Set(currentActive);
        const candidates = allCards.filter(c => !activeIds.has(c.id));
        const pick = candidates.length ? randomChoice(candidates) : randomChoice(allCards);
        if (!pick) return { board: currentBoard, active: currentActive };

        const empties = emptyIndices(currentBoard);
        if (empties.length < 2 && indicesPrefer.length < 2) return { board: currentBoard, active: currentActive };

        const [first, second] = (indicesPrefer.length >= 2 ? indicesPrefer.slice(0, 2) : shuffle(empties)).slice(0, 2);
        const b2 = currentBoard.slice();
        b2[first] = makeTile(pick, LANG_EN);
        b2[second] = makeTile(pick, LANG_VI);
        const a2 = new Set(currentActive);
        a2.add(pick.id);
        return { board: b2, active: a2 };
    }

    function fillDistractors(currentBoard, currentActive) {
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
            // Match! remove both and refill
            const b2 = board.slice();
            const removedPositions = [selectedIndex, index];
            b2[selectedIndex] = null;
            b2[index] = null;

            const a2 = new Set(activePairIds); a2.delete(first.pairId);
            const u2 = new Set(usedPairIds); u2.add(first.pairId);

            let result = { board: b2, active: a2 };
            if (a2.size < targetPairs) {
                result = placeNewPairAt(removedPositions, b2, a2); // prefer placing in just-emptied spots
            }
            const filled = fillDistractors(result.board, result.active);

            setBoard(filled);
            setActivePairIds(result.active);
            setUsedPairIds(u2);
            setSelectedIndex(null);
            setScore(s => s + 1);
        } else {
            // Not a match
            setSelectedIndex(null);
        }
    }

    function resetBoard() { setAllCards(shuffle(allCards)); }

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
                    <Segmented
                        value={`${grid.rows}x${grid.cols}`}
                        onChange={(val) => {
                            const [r, c] = String(val).split("x").map(Number);
                            setGrid({ rows: r, cols: c });
                        }}
                        options={["4x4", "4x5", "5x6"].map(s => ({ label: s, value: s }))}
                    />
                    <Segmented
                        value={String(targetPairs)}
                        onChange={(v) => setTargetPairs(Number(v))}
                        options={[{ label: "2 pairs", value: "2" }, { label: "3 pairs", value: "3" }, { label: "4 pairs", value: "4" }]}
                    />
                    <Button icon={<ReloadOutlined />} onClick={resetBoard}>Reset</Button>
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
                <Row gutter={[16, 16]}>
                    {Array.from({ length: totalCells }).map((_, i) => (
                        <Col span={24 / Math.min(4, grid.cols)} key={i}>
                            <Skeleton.Button active block style={{ height: 72 }} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="board" style={gridTemplate}>
                    {board.map((tile, idx) => (
                        <Card
                            key={idx + (tile?.key || "empty")}
                            className={[
                                "tile",
                                selectedIndex === idx ? "tile--selected" : "",
                                tile ? `tile--${tile.lang}` : "tile--empty",
                            ].join(" ")}
                            onClick={() => onTileClick(idx)}
                            hoverable={!!tile}
                        >
                            {tile ? (
                                <Space direction="vertical" size={2} style={{ width: "100%" }}>
                                    <Text className="tile-label">{tile.lang === LANG_EN ? "EN" : "VI"}</Text>
                                    <Text className="tile-text">{tile.text}</Text>
                                    <Space>
                                        {tile.pronounce && tile.lang === LANG_EN && (
                                            <Tag color="default">{tile.pronounce}</Tag>
                                        )}
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
                            ) : (
                                <div className="tile-empty" />)
                            }
                        </Card>
                    ))}
                </div>
            )}

            <div className="page-footer">
                <Text type="secondary">Mẹo: Chọn 1 ô English và 1 ô Vietnamese tạo thành cặp đúng để ghi điểm. Hệ thống sẽ thêm cặp mới ngay sau khi bạn bắt cặp thành công.</Text>
            </div>
        </div>
    );
}