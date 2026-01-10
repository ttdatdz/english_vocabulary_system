import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./PartDetailPage.scss";
import crown from "../../assets/images/crown.png";
import { postFormData, post, put, get, del } from "../../utils/request";
import CreateToeicQuestion from "../../components/CreateToeicQuestion";

const LETTERS = ["A", "B", "C", "D", "E"];

// Map từ ToeicQuestionResponse backend sang local model
function mapToeicQuestionResponseToLocal(q) {
    if (!q) return null;

    const correctIdx = LETTERS.indexOf(q.result);

    // ✅ Backend trả list nhưng single question chỉ lấy phần tử đầu
    const audioUrls = Array.isArray(q.audios) ? q.audios.filter(Boolean) : [];
    const audioUrl = audioUrls.length > 0 ? audioUrls[0] : "";

    const imageUrls = Array.isArray(q.images) ? q.images.filter(Boolean) : [];

    return {
        id: q.id ?? null,
        indexNumber: q.indexNumber ?? null,
        part: q.part ?? "",
        detail: q.detail || "",
        result: q.result || "",

        // ✅ Single audio (string, not array)
        audioUrl,
        audioKey: "",
        audioFile: null,
        audioPreview: "",

        // Images vẫn là list
        imageUrls,
        imageKeys: [],
        imageFiles: [],
        imagePreviews: [],

        options: (q.options || []).map((o) => o.detail || ""),
        correctOptionIndex: correctIdx >= 0 ? correctIdx : null,

        conversation: q.conversation || null,
        clarify: q.clarify || "",
    };
}

const createEmptyQuestion = (part) => ({
    id: null,
    indexNumber: null,
    part: String(part),

    detail: "",
    result: "",

    conversation: null,
    clarify: "",

    options: ["", ""],
    correctOptionIndex: null,

    // ✅ Single audio (not array)
    audioUrl: "",
    audioKey: "",
    audioFile: null,
    audioPreview: "",

    // Images vẫn là list
    imageUrls: [],
    imageKeys: [],
    imageFiles: [],
    imagePreviews: [],
});

const buildMediaPayload = ({ existingKeys = [], uploadedKeys = [] }) => {
    const all = [...(existingKeys || []), ...(uploadedKeys || [])].filter(Boolean);
    const uniq = Array.from(new Set(all));
    return uniq.map((key) => ({ url: key }));
};

const buildReorderPayload = ({ examId, partNumber, questions }) => {
    return {
        examId: Number(examId),
        part: String(partNumber),
        items: (questions || []).map((q, i) => ({
            questionId: q.id,
            indexNumber: i + 1,
        })),
    };
};

export default function DetailPart() {
    const location = useLocation();
    const routeState = location.state || {};
    const { examId, partNumber } = useParams();

    const navigate = useNavigate();
    const [examTitle, setExamTitle] = useState(routeState.examName || "");
    const [duration, setDuration] = useState(routeState.durationMinutes || 120);

    const [questions, setQuestions] = useState([]);

    const [expandedId, setExpandedId] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [draftQuestion, setDraftQuestion] = useState(null);
    const [creatingNew, setCreatingNew] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);

    // ===== Load câu hỏi từ route state =====
    useEffect(() => {
        let cancelled = false;

        const loadQuestions = async () => {
            try {
                const fromState = routeState.partQuestions;
                if (Array.isArray(fromState) && fromState.length > 0) {
                    const mapped = fromState.map(mapToeicQuestionResponseToLocal);
                    if (!cancelled) setQuestions(mapped);
                    return;
                }

                const examData = await get(`/api/exam/detail/${examId}`, true);
                const list = Array.isArray(examData?.questions) ? examData.questions : [];
                const partQuestions = list.filter(
                    (q) => String(q.part) === String(partNumber)
                );

                const mapped = partQuestions.map(mapToeicQuestionResponseToLocal);
                if (!cancelled) setQuestions(mapped);

                if (!cancelled && mapped.length === 0) {
                    setCreatingNew(true);
                    setDraftQuestion(createEmptyQuestion(String(partNumber)));
                }
            } catch (err) {
                console.error("Load part questions error", err);
            }
        };

        loadQuestions();

        return () => {
            cancelled = true;
        };
    }, [examId, partNumber, routeState.partQuestions]);

    const handleBack = () => navigate(-1);

    const handleClickCard = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleStartCreate = () => {
        setDraftQuestion(createEmptyQuestion(String(partNumber)));
        setCreatingNew(true);
        setEditingQuestionId(null);
        setExpandedId(null);
        setShowQuestionModal(true);
    };

    const handleEditQuestion = (q) => {
        setDraftQuestion({
            ...q,
            // ✅ Copy keys để giữ khi update
            audioKey: q.audioKey || "",
            imageKeys: [...(q.imageKeys || [])],
            
            // Reset upload files
            audioFile: null,
            audioPreview: "",
            imageFiles: [],
            imagePreviews: [],
        });
        setEditingQuestionId(q.id);
        setCreatingNew(false);
        setExpandedId(q.id);
        setShowQuestionModal(true);
    };

    const handleCloseQuestionModal = () => {
        setShowQuestionModal(false);
        setCreatingNew(false);
        setEditingQuestionId(null);
        setDraftQuestion(null);
    };

    const handleDeleteQuestion = async (id) => {
        if (id == null) return;
        if (!window.confirm("Xoá câu hỏi này?")) return;

        if (editingQuestionId === id) {
            setShowQuestionModal(false);
            setCreatingNew(false);
            setEditingQuestionId(null);
            setDraftQuestion(null);
        }

        setUploading(true);
        try {
            const isPersisted = id != null && !Number.isNaN(Number(id));
            if (isPersisted) {
                await del(`/api/toeic-question/${id}`, true);
            }

            const nextQuestions = (questions || [])
                .filter((q) => q?.id !== id)
                .map((q, i) => ({ ...q, indexNumber: i + 1 }));

            setQuestions(nextQuestions);

            if (expandedId === id) setExpandedId(null);
            if (editingQuestionId === id) setEditingQuestionId(null);

            if (window.__toeicExamData?.questions) {
                window.__toeicExamData = {
                    ...window.__toeicExamData,
                    questions: (window.__toeicExamData.questions || []).filter((q) => q?.id !== id),
                };
            }

            const hasInvalidId = nextQuestions.some((q) => q?.id == null || Number.isNaN(Number(q.id)));
            if (!hasInvalidId) {
                const reorderPayload = buildReorderPayload({
                    examId,
                    partNumber,
                    questions: nextQuestions,
                });

                await put(reorderPayload, `/api/toeic-question/reorder/${examId}`, true);
            }
        } catch (err) {
            console.error("Delete question error:", err);
            alert(err?.message || "Xoá câu hỏi thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleChangeDraftField = (field, value) => {
        setDraftQuestion((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeOption = (index, value) => {
        setDraftQuestion((prev) => {
            const options = [...prev.options];
            options[index] = value;
            return { ...prev, options };
        });
    };

    const handleAddOption = () => {
        setDraftQuestion((prev) => {
            if (!prev) return prev;
            if (prev.options.length >= 5) return prev;
            return { ...prev, options: [...prev.options, ""] };
        });
    };

    const handleRemoveOption = (index) => {
        setDraftQuestion((prev) => {
            if (!prev) return prev;
            if (prev.options.length <= 2) return prev;

            const newOptions = prev.options.filter((_, idx) => idx !== index);

            let newCorrect = prev.correctOptionIndex;
            if (prev.correctOptionIndex === index) newCorrect = null;
            else if (prev.correctOptionIndex != null && prev.correctOptionIndex > index) {
                newCorrect = prev.correctOptionIndex - 1;
            }

            return { ...prev, options: newOptions, correctOptionIndex: newCorrect };
        });
    };

    const handleMarkCorrect = (index) => {
        setDraftQuestion((prev) => ({
            ...prev,
            correctOptionIndex: index,
        }));
    };

    // ==== MEDIA HANDLERS ====

    const handleAudioChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setDraftQuestion((prev) => ({
            ...prev,
            audioFile: file,
            audioPreview: previewUrl,
        }));

        e.target.value = '';
    };

    const handleClearAudio = () => {
        setDraftQuestion((prev) => ({
            ...prev,
            audioFile: null,
            audioPreview: "",
            audioUrl: "",
            audioKey: "",
        }));
    };

    const handleAddImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setDraftQuestion((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), previewUrl],
        }));
        
        e.target.value = '';
    };

    const handleRemoveImage = (source, idx) => {
        if (typeof source === "number") {
            idx = source;
            source = "local";
        }

        setDraftQuestion((prev) => {
            if (!prev) return prev;

            if (source === "server") {
                const newUrls = (prev.imageUrls || []).filter((_, i) => i !== idx);
                const newKeys = (prev.imageKeys || []).filter((_, i) => i !== idx);
                return { ...prev, imageUrls: newUrls, imageKeys: newKeys };
            }

            const newFiles = (prev.imageFiles || []).filter((_, i) => i !== idx);
            const newPreviews = (prev.imagePreviews || []).filter((_, i) => i !== idx);

            return { ...prev, imageFiles: newFiles, imagePreviews: newPreviews };
        });
    };

    const handleSaveDraftQuestionToState = async () => {
        if (!draftQuestion?.detail?.trim()) {
            alert("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        const trimmedOptions = (draftQuestion.options || []).map((o) => (o || "").trim());
        const filled = trimmedOptions.filter(Boolean);
        if (filled.length < 2) {
            alert("Vui lòng nhập ít nhất 2 đáp án");
            return;
        }

        const idx = draftQuestion.correctOptionIndex;
        if (idx == null || idx < 0 || !trimmedOptions[idx]) {
            alert("Vui lòng chọn đáp án đúng");
            return;
        }

        setUploading(true);

        try {
            let uploadedImageKeys = [];
            let uploadedAudioKey = null;

            const fd = new FormData();

            if (draftQuestion.audioFile) {
                fd.append("audios", draftQuestion.audioFile);
            }

            if (draftQuestion.imageFiles && draftQuestion.imageFiles.length > 0) {
                draftQuestion.imageFiles.forEach((f) => fd.append("images", f));
            }

            if (draftQuestion.audioFile || (draftQuestion.imageFiles && draftQuestion.imageFiles.length > 0)) {
                const uploadRes = await postFormData("/api/media/upload", fd, true);

                const audioList = Array.isArray(uploadRes?.audios) ? uploadRes.audios : [];
                if (audioList.length > 0) {
                    uploadedAudioKey = audioList[0]?.key || null;
                }

                const imgList = Array.isArray(uploadRes?.images) ? uploadRes.images : [];
                uploadedImageKeys = imgList.map((x) => x?.key).filter(Boolean);
            }

            const existingImageKeys = Array.isArray(draftQuestion.imageKeys) ? draftQuestion.imageKeys : [];
            const existingAudioKey = draftQuestion.audioKey || null;

            const imagesPayload = buildMediaPayload({
                existingKeys: existingImageKeys,
                uploadedKeys: uploadedImageKeys,
            });

            const audiosPayload = [];
            const finalAudioKey = uploadedAudioKey || existingAudioKey;
            if (finalAudioKey) {
                audiosPayload.push({ url: finalAudioKey });
            }

            const basePayload = {
                part: String(partNumber),
                detail: draftQuestion.detail.trim(),
                conversation: draftQuestion.conversation || null,
                clarify: (draftQuestion.clarify || "").trim(),
                examId: Number(examId),
                random: true,
                options: trimmedOptions.map((opt, optIdx) => ({
                    mark: LETTERS[optIdx],
                    detail: opt,
                })),
                result: LETTERS[idx],
                audios: audiosPayload,
                images: imagesPayload,
            };

            if (editingQuestionId != null) {
                const idxInList = questions.findIndex((q) => q.id === editingQuestionId);
                const payload = {
                    ...basePayload,
                    indexNumber: idxInList >= 0 ? idxInList + 1 : null,
                };

                await put(payload, `/api/toeic-question/${editingQuestionId}`, true);

                const allImageKeys = [...existingImageKeys, ...uploadedImageKeys].filter(Boolean);

                const updatedLocal = {
                    ...draftQuestion,
                    detail: payload.detail,
                    clarify: payload.clarify || "",
                    conversation: payload.conversation,
                    result: payload.result,

                    options: trimmedOptions,
                    correctOptionIndex: idx,

                    audioKey: finalAudioKey || "",
                    audioFile: null,
                    audioPreview: "",

                    imageKeys: allImageKeys,
                    imageFiles: [],
                    imagePreviews: [],

                    indexNumber: payload.indexNumber,
                };

                setQuestions((prev) => prev.map((q) => (q.id === editingQuestionId ? updatedLocal : q)));

            } else {
                const saved = await post(basePayload, "/api/toeic-question", true);

                if (!saved) {
                    throw new Error("Create question failed");
                }

                const createdLocal = mapToeicQuestionResponseToLocal(saved);

                const allImageKeys = [...existingImageKeys, ...uploadedImageKeys].filter(Boolean);

                createdLocal.audioKey = finalAudioKey || "";
                createdLocal.imageKeys = allImageKeys;

                createdLocal.audioFile = null;
                createdLocal.audioPreview = "";
                createdLocal.imageFiles = [];
                createdLocal.imagePreviews = [];

                setQuestions((prev) => [...prev, createdLocal]);
            }

            setCreatingNew(false);
            setEditingQuestionId(null);
            setDraftQuestion(null);
            setShowQuestionModal(false);
        } catch (err) {
            console.error("Save question error", err);
            alert(err?.message || "Lưu câu hỏi thất bại");
        } finally {
            setUploading(false);
        }
    };

    // ==== Drag & drop ====

    const handleDragStart = (id) => setDraggingId(id);
    const handleDragOver = (e) => e.preventDefault();

    const handleDropOn = async (targetId) => {
        if (!draggingId || draggingId === targetId) return;

        const from = questions.findIndex((q) => q.id === draggingId);
        const to = questions.findIndex((q) => q.id === targetId);
        if (from === -1 || to === -1) {
            setDraggingId(null);
            return;
        }

        const updated = [...questions];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);

        const nextQuestions = updated.map((q, i) => ({
            ...q,
            indexNumber: i + 1,
        }));

        setQuestions(nextQuestions);
        setDraggingId(null);

        try {
            const hasInvalidId = nextQuestions.some((q) => q.id == null || Number.isNaN(Number(q.id)));
            if (hasInvalidId) return;

            const reorderPayload = buildReorderPayload({
                examId,
                partNumber,
                questions: nextQuestions,
            });

            await put(reorderPayload, `/api/toeic-question/reorder/${examId}`, true);
        } catch (e) {
            console.error("Reorder failed:", e);
        }
    };

    const handleDragEnd = () => setDraggingId(null);

    const renderQuestionCard = (q, index) => {
        const isExpanded = expandedId === q.id && editingQuestionId !== q.id;
        const isDragging = draggingId === q.id;

        return (
            <div
                key={q.id || `local-${index}`}
                className={
                    "question-card" +
                    (isExpanded ? " question-card--expanded" : " question-card--collapsed") +
                    (isDragging ? " question-card--dragging" : "")
                }
                draggable={true}
                onDragStart={() => handleDragStart(q.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOn(q.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="question-card__header" onClick={() => handleClickCard(q.id)}>
                    <div className="question-card__drag-handle">⋮⋮</div>
                    <div className="question-card__title">
                        {`Câu ${index + 1} - `}
                        <span className="question-card__part-name">Part {partNumber}</span>
                    </div>
                    <div className="question-card__actions">
                        <button
                            className="question-card__btn question-card__btn--ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestion(q);
                            }}
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            className="question-card__btn question-card__btn--ghost question-card__btn--danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(q.id);
                            }}
                        >
                            Xoá
                        </button>
                    </div>
                </div>

                <div className="question-card__body">
                    <p className="question-card__text">{q.detail || "Chưa có nội dung câu hỏi."}</p>

                    {/* ✅ Hiển thị single audio */}
                    {q.audioUrl && (
                        <div className="question-card__audio">
                            <span>Âm thanh:</span>
                            <audio src={q.audioUrl} controls style={{ marginTop: 4, width: "100%" }} />
                        </div>
                    )}

                    {/* ✅ Hiển thị images list */}
                    {q.imageUrls && q.imageUrls.length > 0 && (
                        <div className="question-card__images">
                            <span>Hình ảnh:</span>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                                {q.imageUrls.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`img-${idx}`}
                                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {q.options && q.options.length > 0 && (
                        <div className="question-card__options">
                            <div className="question-card__options-label">Đáp án:</div>
                            <ul>
                                {q.options.map((opt, idx) => (
                                    <li key={idx}>
                                        {LETTERS[idx]}. {opt}
                                        {q.correctOptionIndex === idx && (
                                            <strong style={{ color: "#16a34a", marginLeft: 6, fontSize: 12 }}>✓</strong>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const showFormCard = creatingNew || editingQuestionId != null;

    return (
        <div className="part-detail">
            {/* HEADER */}
            <div className="part-detail__hero">
                <div className="part-detail__hero-left">
                    <button
                        className="part-detail__btn part-detail__btn--ghost"
                        onClick={handleBack}
                    >
                        ⟵ Quay lại
                    </button>
                </div>

                <div className="part-detail__hero-center">
                    <p>{examTitle} -</p>
                    <span className="part-detail__part-name">Part {partNumber}</span>
                </div>

                <div className="part-detail__hero-actions">
                    <button className="part-detail__btn part-detail__btn--outlined">
                        <img src={crown} className="crown-icon" alt="crown-icon" />
                        Ngân hàng câu hỏi
                    </button>
                    <button
                        className="part-detail__btn part-detail__btn--solid"
                        onClick={handleStartCreate}
                    >
                        + Thêm câu hỏi
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="part-detail__content">
                <div className="part-detail__left">
                    {questions.length === 0 && !showFormCard && (
                        <div className="part-detail__empty">
                            <p>Part này chưa có câu hỏi nào.</p>
                            <button
                                className="part-detail__btn part-detail__btn--solid"
                                onClick={handleStartCreate}
                            >
                                + Thêm câu hỏi đầu tiên
                            </button>
                        </div>
                    )}

                    {questions.length > 0 && (
                        <div className="part-detail__question-list">
                            {questions.map((q, index) => renderQuestionCard(q, index))}
                        </div>
                    )}
                </div>

                {/* Modal create/edit question */}
                <CreateToeicQuestion
                    open={showQuestionModal}
                    onClose={handleCloseQuestionModal}
                    draftQuestion={draftQuestion}
                    onChangeDraftField={handleChangeDraftField}
                    onChangeOption={handleChangeOption}
                    onAddOption={handleAddOption}
                    onRemoveOption={handleRemoveOption}
                    onMarkCorrect={handleMarkCorrect}
                    onAudioChange={handleAudioChange}
                    onClearAudio={handleClearAudio}
                    onAddImage={handleAddImage}
                    onRemoveImage={handleRemoveImage}
                    onSave={handleSaveDraftQuestionToState}
                    partNumber={partNumber}
                    isEditing={editingQuestionId != null}
                    questionIndex={questions.length + 1}
                    loading={uploading}
                />
            </div>
        </div>
    );
}