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

function countTilesById(boardArr) {
    const m = new Map();
    boardArr.forEach(t => { if (t) m.set(t.pairId, (m.get(t.pairId) || 0) + 1); });
    return m; // 0/1/2
}

function tilesOfId(boardArr, id) {
    const idxs = [];
    boardArr.forEach((t, i) => { if (t && t.pairId === id) idxs.push(i); });
    return idxs; // 0,1,2 indices
}

function fillSinglesPreferSlotsLocal(boardIn, preferSlots = [], maxSlots = 2, pool, allCards) {
    let b2 = boardIn.slice();
    const counts = countTilesById(b2);
    let used = 0;
    let newPool = [...pool];

    for (const slot of preferSlots) {
        if (used >= maxSlots) break;
        if (slot == null) continue;
        if (b2[slot] !== null) continue;

        const pickIdx = newPool.findIndex(x => (counts.get(x) || 0) === 0);
        if (pickIdx === -1) break; // hết pool phù hợp

        const id = newPool[pickIdx];
        const card = allCards.find(c => c.id === id);
        const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;

        b2[slot] = makeTile(card, side);
        counts.set(id, 1);
        newPool.splice(pickIdx, 1); // tiêu hao id khỏi pool
        used++;
    }
    return { board: b2, pool: newPool };
}

function ensureOnePairLocal(boardIn, currentActive, preferSlots = [], pool, allCards) {
    let b2 = boardIn.slice();
    let a2 = new Set(currentActive);
    const counts = countTilesById(b2);
    let newPool = [...pool];

    // Hoàn thiện singleton nếu có
    for (const [id, cnt] of counts.entries()) {
        if (cnt === 1 && !a2.has(id)) {
            const idxs = tilesOfId(b2, id);
            const have = b2[idxs[0]];
            const needSide = have.lang === LANG_EN ? LANG_VI : LANG_EN;

            const empties = emptyIndices(b2);
            const slots = (preferSlots.length ? preferSlots : empties).filter(i => b2[i] === null);
            if (!slots.length) return { board: b2, active: a2, pool: newPool };

            const slot = slots[0];
            const card = allCards.find(c => c.id === id);
            b2[slot] = makeTile(card, needSide);
            a2.add(id);
            return { board: b2, active: a2, pool: newPool };
        }
    }

    // Không có singleton → tạo cặp từ pool
    if (!newPool.length) return { board: b2, active: a2, pool: newPool };

    const empties = emptyIndices(b2);
    const slots = (preferSlots.length >= 2 ? preferSlots.slice(0, 2) : empties).slice(0, 2);
    if (slots.length < 2) return { board: b2, active: a2, pool: newPool };

    const id = newPool[0];
    const card = allCards.find(c => c.id === id);

    const sideA = Math.random() < 0.5 ? LANG_EN : LANG_VI;
    const sideB = sideA === LANG_EN ? LANG_VI : LANG_EN;
    b2[slots[0]] = makeTile(card, sideA);
    b2[slots[1]] = makeTile(card, sideB);
    a2.add(id);
    newPool = newPool.slice(1);

    return { board: b2, active: a2, pool: newPool };
}

function fillSinglesOnlyLocal(boardIn, currentActive, pool, allCards) {
    let b2 = boardIn.slice();
    const counts = countTilesById(b2);
    let empties = emptyIndices(b2);
    let newPool = [...pool];
    let guard = 0;

    while (empties.length && guard < b2.length * 4 && newPool.length) {
        guard++;
        const pickIdx = newPool.findIndex(x => (counts.get(x) || 0) === 0);
        if (pickIdx === -1) break;

        const id = newPool[pickIdx];
        const card = allCards.find(c => c.id === id);
        const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;
        const slot = empties.pop();

        b2[slot] = makeTile(card, side);
        counts.set(id, 1);
        newPool.splice(pickIdx, 1);
    }
    return { board: b2, pool: newPool };
}

function completeSingletonsIntoSlots(boardIn, slots, currentActive, allCards) {
    let b2 = boardIn.slice();
    let a2 = new Set(currentActive);

    const counts = countTilesById(b2);
    const slotsTodo = slots.filter(i => i != null && b2[i] === null);

    // duyệt các id đang có đúng 1 tile trên board
    for (const [id, cnt] of counts.entries()) {
        if (!slotsTodo.length) break;
        if (cnt !== 1) continue;

        // không hoàn thiện nếu ID này đã là cặp active (phòng vệ, thường cnt=2 mới là cặp)
        if (a2.has(id)) continue;

        const haveIdx = tilesOfId(b2, id)[0];
        const have = b2[haveIdx];
        const needSide = have.lang === LANG_EN ? LANG_VI : LANG_EN;
        const slot = slotsTodo.shift(); // lấy 1 ô trống
        const card = allCards.find(c => c.id === id);

        b2[slot] = makeTile(card, needSide);
        // bây giờ id trở thành cặp đúng
        a2.add(id);
    }
    return { board: b2, active: a2 };
}

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
    const boardRef = useRef(board);
    const activeRef = useRef(activePairIds);
    const poolRef = useRef(remainingIds);
    const audioRef = useRef(null);

    // Thống kê nhanh để hiển thị HUD/Sidebar
    const { pairsOnBoard, singlesOnBoard } = useMemo(() => {
        const m = countTilesById(board);
        let pairs = 0, singles = 0;
        for (const [, cnt] of m.entries()) {
            if (cnt === 2) pairs += 1;
            else if (cnt === 1) singles += 1;
        }
        return { pairsOnBoard: pairs, singlesOnBoard: singles };
    }, [board]);


    useEffect(() => { boardRef.current = board; }, [board]);
    useEffect(() => { activeRef.current = activePairIds; }, [activePairIds]);
    useEffect(() => { poolRef.current = remainingIds; }, [remainingIds]);

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
        const ids = shuffle(allCards.map(c => c.id));

        // seed tối đa 3 cặp (ít nhất 1 nếu còn data)
        const pairsToSeed = Math.min(3, Math.floor(totalCells / 2), ids.length) || (ids.length ? 1 : 0);
        const seedIds = ids.slice(0, pairsToSeed);
        const remain = ids.slice(pairsToSeed); // pool id CHƯA xuất hiện

        const active = new Set();

        // Đặt cặp
        seedIds.forEach(id => {
            const card = allCards.find(c => c.id === id);
            const empties = emptyIndices(initial);
            if (empties.length < 2) return;
            const a = randomChoice(empties);
            initial[a] = makeTile(card, Math.random() < 0.5 ? LANG_EN : LANG_VI);
            const empties2 = emptyIndices(initial);
            const b = randomChoice(empties2);
            // đảm bảo 2 mặt khác ngôn ngữ
            const langB = initial[a].lang === LANG_EN ? LANG_VI : LANG_EN;
            initial[b] = makeTile(card, langB);
            active.add(id);
        });

        // Fill phần còn lại bằng SINGLE từ các id chưa dùng (mỗi id chỉ 1 mặt)
        let empties = emptyIndices(initial);
        let guard = 0;
        let p = 0;
        while (empties.length && guard < totalCells * 4 && p < remain.length) {
            guard++;
            const i = empties.pop();
            const id = remain[p++];
            const card = allCards.find(c => c.id === id);
            const side = Math.random() < 0.5 ? LANG_EN : LANG_VI;
            initial[i] = makeTile(card, side);
            // CHÚ Ý: id này đã được đưa lên board (single) nên KHÔNG còn trong remainingIds nữa
        }
        // ids còn thừa trong remain (nếu bảng đã đầy) giữ lại làm pool
        const consumedSingles = p;
        const nextRemain = remain.slice(consumedSingles);

        setBoard(initial);
        setActivePairIds(active);
        setRemainingIds(nextRemain); // chỉ là những id CHƯA xuất hiện ở board
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

    // -------------------- PlayAudio --------------------
    useEffect(() => {
        const el = new Audio();
        el.preload = "none";
        el.crossOrigin = "anonymous"; // tránh CORS khi server cho phép
        audioRef.current = el;

        return () => {
            try { el.pause(); } catch { }
            audioRef.current = null;
        };
    }, []);

    // -------------------- Handlers --------------------
    function onTileClick(index) {

        if (matchedIndices.length) return;
        const tile = board[index];
        if (!tile) return;

        if (selectedIndex === null) { setSelectedIndex(index); return; }

        if (index === selectedIndex) {   //  click lại ô đang chọn → bỏ chọn
            setSelectedIndex(null);
            return;
        }

        const first = board[selectedIndex];
        const second = tile;

        // only allow EN + VI selections
        if (first.lang === second.lang) { setSelectedIndex(index); return; }

        setMoves(m => m + 1);

        if (first.pairId === second.pairId) {
            const a = selectedIndex, b = index;
            setMatchedIndices([a, b]);
            setSelectedIndex(null);

            setTimeout(() => {
                const pid = first.pairId;
                const originalRemoved = [a, b];

                // 1) Xoá 2 tile có cùng pairId
                let b2 = boardRef.current.map(t => (t && t.pairId === pid ? null : t));

                // 2) Active mới
                let a2 = new Set(activeRef.current);
                a2.delete(pid);

                // 3) Pool local (mới nhất)
                let pool = [...poolRef.current];

                // 4) Còn cặp đúng không?
                const countsNow = countTilesById(b2);
                let stillHasPair = false;
                for (const [, cnt] of countsNow.entries()) { if (cnt === 2) { stillHasPair = true; break; } }

                // 5) Nếu KHÔNG còn cặp → đảm bảo 1 cặp trước (ưu tiên 2 slot vừa trống)
                if (!stillHasPair) {
                    const ensured = ensureOnePairLocal(b2, a2, originalRemoved, pool, allCards);
                    b2 = ensured.board; a2 = ensured.active; pool = ensured.pool;
                }

                // 6) Recompute các slot còn trống trong 2 ô vừa xoá
                const removedSlotsNow = originalRemoved.filter(i => b2[i] === null);

                // 7) LUÔN lấp ngay các slot này bằng SINGLE từ pool (nếu còn)
                if (removedSlotsNow.length && pool.length) {
                    const fillRemoved = fillSinglesPreferSlotsLocal(
                        b2, removedSlotsNow, removedSlotsNow.length, pool, allCards
                    );
                    b2 = fillRemoved.board; pool = fillRemoved.pool;
                }

                // 🔥 7b) Fallback khi pool = 0: dùng chính các singleton hiện có để lấp slot
                const removedSlotsStillEmpty = removedSlotsNow.filter(i => b2[i] === null);
                if (removedSlotsStillEmpty.length && pool.length === 0) {
                    const completed = completeSingletonsIntoSlots(b2, removedSlotsStillEmpty, a2, allCards);
                    b2 = completed.board; a2 = completed.active;
                }

                // 8) (Tuỳ chọn) Lấp thêm SINGLE các ô trống khác bằng pool (nếu còn)
                if (pool.length) {
                    const fillRest = fillSinglesOnlyLocal(b2, a2, pool, allCards);
                    b2 = fillRest.board; pool = fillRest.pool;
                }

                // 9) Commit state
                setBoard(b2);
                setActivePairIds(a2);
                setRemainingIds(pool);
                setScore(s => s + 1);
                setMatchedIndices([]);
            }, 450);

        }
        else {
            // sai → rung + viền đỏ
            const a = selectedIndex;
            const b = index;
            setShakeIndices([a, b]);
            setTimeout(() => setShakeIndices([]), 420);
            setSelectedIndex(null);
        }

    }

    function playAudio(url, fallbackText, langCode = "en-US") {
        if (!url || !audioRef.current) return;
        const el = audioRef.current;

        // Nếu site chạy https mà url là http → sẽ bị chặn (mixed content)
        if (window.location.protocol === "https:" && url.startsWith("http:")) {
            // fallback sang TTS để vẫn có âm thanh
            if ("speechSynthesis" in window && fallbackText) {
                const u = new SpeechSynthesisUtterance(fallbackText);
                u.lang = langCode;
                window.speechSynthesis.speak(u);
            } else {
                message.warning("Audio bị chặn do mixed content (http). Hãy dùng URL https.");
            }
            return;
        }

        try {
            // reset rồi play
            el.pause();
            el.src = url;
            el.currentTime = 0;
            el.play().catch(err => {
                // Trường hợp Safari/CORS/format fail → fallback TTS
                if ("speechSynthesis" in window && fallbackText) {
                    const u = new SpeechSynthesisUtterance(fallbackText);
                    u.lang = langCode;
                    window.speechSynthesis.speak(u);
                } else {
                    console.warn("Audio play error:", err);
                    message.warning("Không phát được audio.");
                }
            });
        } catch (err) {
            console.warn("Audio error:", err);
            message.warning("Không phát được audio.");
        }
    }
    function resetGame() {
        // re-init by shuffling allCards order (will trigger init effect)
        setInitialized(false);
        setAllCards(shuffle(allCards));
    }

    // -------------------- Render --------------------
    return (
        <div className="vocab-memory-page">
            <header className="game-header">
                <div className="gh-left">
                    <Button
                        className="btn-ghost"
                        onClick={() => navigate(-1)}
                        icon={<ReloadOutlined rotate={180} />}
                        size="middle"
                    >
                        Back
                    </Button>

                    <div className="game-title">
                        <span className="sparkle" aria-hidden>✦</span>
                        <Title level={3} className="title-text">Pikachu Vocabulary</Title>
                        <Tag className="mode-tag">EN ↔ VI</Tag>
                    </div>
                </div>

                <div className="gh-right">
                    <div className="hud">
                        <div className="hud-chip">
                            <span>Score</span><b>{score}</b>
                        </div>
                        <div className="hud-chip">
                            <span>Moves</span><b>{moves}</b>
                        </div>
                        <div className="hud-chip hud-subtle">
                            <span>Pairs</span><b>{pairsOnBoard}</b>
                        </div>
                    </div>
                    <Button
                        className="btn-primary"
                        icon={<ReloadOutlined />}
                        size="middle"
                        onClick={resetGame}
                    >
                        Reset
                    </Button>
                </div>
            </header>


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
                                            <Text className={`tile-text ${tile?.lang === LANG_EN ? "title-EN-text" : ""
                                                }`}>{tile.text}</Text>
                                            <Space>
                                                {tile.pronounce && tile.lang === LANG_EN && <Tag color="default">{tile.pronounce}</Tag>}
                                                {tile.audio && tile.lang === LANG_EN && (
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<SoundOutlined />}
                                                        onClick={(e) => { e.stopPropagation(); playAudio(tile.audio, tile.text, "en-US"); }}
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
                        <aside className="sidebar">
                            <div className="side-card side-howto">
                                <Title level={5} className="side-title">Hướng dẫn</Title>
                                <ul className="side-steps">
                                    <li>Chọn <b>1 ô EN</b> và <b>1 ô VI</b> để tạo <b>cặp đúng</b>.</li>
                                </ul>
                            </div>

                            <div className="side-card side-legend">
                                <Title level={5} className="side-title">Ký hiệu</Title>
                                <div className="legend-row">
                                    <span className="legend-badge en">EN</span>
                                    <Text type="secondary">Từ vựng tiếng Anh</Text>
                                </div>
                                <div className="legend-row">
                                    <span className="legend-badge vi">VI</span>
                                    <Text type="secondary">Nghĩa tiếng Việt</Text>
                                </div>
                            </div>

                            {/* <div className="side-card side-stats">
                                <Title level={5} className="side-title">Board status</Title>
                                <div className="kpi-row"><Text type="secondary">Active pairs:</Text><b>{pairsOnBoard}</b></div>
                                <div className="kpi-row"><Text type="secondary">Singles:</Text><b>{singlesOnBoard}</b></div>
                                <div className="kpi-row"><Text type="secondary">Pool:</Text><b>{remainingIds.length}</b></div>
                            </div> */}
                        </aside>
                    </Col>

                </Row>
            )}

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