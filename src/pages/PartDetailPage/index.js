// src/pages/PartDetailPage.jsx
import React, { useState } from "react";
import "./PartDetailPage.css";
import crown from "../../assets/images/crown.png";

const createEmptyQuestion = (index, partName) => ({
    id: Date.now(),
    title: `Câu ${index} - ${partName}`,
    text: "",
    audioUrl: "",
    imageUrl: "",
    audioName: "",
    imageName: "",
    options: ["", ""], // tối thiểu 2 đáp án
    correctOptionIndex: null,
});

export default function PartDetailPage({
    testName = "Toeic Custom Test 1",
    durationMinutes = 120,
    partName = "Part 1",
    initialQuestions = [],
    onBack,
}) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [creatingNew, setCreatingNew] = useState(initialQuestions.length === 0);
    const [draftQuestion, setDraftQuestion] = useState(
        initialQuestions.length === 0 ? createEmptyQuestion(1, partName) : null
    );
    const [draggingId, setDraggingId] = useState(null);

    const handleBack = () => {
        if (onBack) onBack();
    };

    const handleClickCard = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleStartCreate = () => {
        const idx = questions.length + 1;
        setDraftQuestion(createEmptyQuestion(idx, partName));
        setCreatingNew(true);
        setEditingId(null);
        setExpandedId(null);
    };

    const handleEditQuestion = (q) => {
        // đảm bảo luôn có correctOptionIndex
        setDraftQuestion({
            ...q,
            correctOptionIndex:
                typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : null,
        });
        setEditingId(q.id);
        setCreatingNew(false);
        setExpandedId(q.id);
    };

    const handleDeleteQuestion = (id) => {
        if (!window.confirm("Xoá câu hỏi này?")) return;
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (expandedId === id) setExpandedId(null);
        if (editingId === id) setEditingId(null);
    };

    const handleChangeDraft = (field, value) => {
        setDraftQuestion((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeOption = (index, value) => {
        setDraftQuestion((prev) => {
            const newOpts = [...prev.options];
            newOpts[index] = value;
            return { ...prev, options: newOpts };
        });
    };

    const handleAddOption = () => {
        setDraftQuestion((prev) => {
            if (prev.options.length >= 4) return prev;
            return { ...prev, options: [...prev.options, ""] };
        });
    };

    const handleMarkCorrect = (index) => {
        setDraftQuestion((prev) => ({
            ...prev,
            correctOptionIndex: index,
        }));
    };

    const handleRemoveOption = (index) => {
        setDraftQuestion((prev) => {
            // giữ tối thiểu 2 đáp án
            if (prev.options.length <= 2) return prev;

            const newOptions = prev.options.filter((_, idx) => idx !== index);

            let newCorrect = prev.correctOptionIndex;
            if (prev.correctOptionIndex === index) {
                // xoá đúng đáp án hiện tại => bỏ chọn
                newCorrect = null;
            } else if (
                prev.correctOptionIndex != null &&
                prev.correctOptionIndex > index
            ) {
                // dịch lại index nếu xoá option phía trước
                newCorrect = prev.correctOptionIndex - 1;
            }

            return {
                ...prev,
                options: newOptions,
                correctOptionIndex: newCorrect,
            };
        });
    };

    const handleAudioChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setDraftQuestion((prev) => ({
            ...prev,
            audioUrl: url,
            audioName: file.name,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setDraftQuestion((prev) => ({
            ...prev,
            imageUrl: url,
            imageName: file.name,
        }));
    };

    const handleClearAudio = () => {
        setDraftQuestion((prev) => ({
            ...prev,
            audioUrl: "",
            audioName: "",
        }));
    };

    const handleClearImage = () => {
        setDraftQuestion((prev) => ({
            ...prev,
            imageUrl: "",
            imageName: "",
        }));
    };


    const handleSaveDraft = () => {
        if (!draftQuestion.text.trim()) {
            alert("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        // ít nhất 2 đáp án có nội dung
        const trimmedOptions = draftQuestion.options.map((opt) => opt.trim());
        const filledOptions = trimmedOptions.filter((opt) => opt);
        if (filledOptions.length < 2) {
            alert("Vui lòng nhập ít nhất 2 đáp án");
            return;
        }

        // bắt buộc chọn đáp án đúng
        if (
            draftQuestion.correctOptionIndex == null ||
            draftQuestion.correctOptionIndex < 0 ||
            !trimmedOptions[draftQuestion.correctOptionIndex]
        ) {
            alert("Vui lòng chọn một đáp án đúng");
            return;
        }

        // chuẩn hoá question để lưu vào state
        const normalizedQuestion = {
            ...draftQuestion,
            text: draftQuestion.text.trim(),
            options: trimmedOptions,
        };

        // OBJECT chuẩn để gửi lên API / lưu DB (nếu cần)
        const payload = {
            id: normalizedQuestion.id,
            partName,
            text: normalizedQuestion.text,
            audioUrl: normalizedQuestion.audioUrl || null,
            options: normalizedQuestion.options.map((opt, idx) => ({
                key: String.fromCharCode(65 + idx), // A, B, C, D...
                text: opt,
                isCorrect: idx === normalizedQuestion.correctOptionIndex,
            })),
        };
        // TODO: gọi API ở đây nếu cần
        console.log("Question payload:", payload);

        if (editingId) {
            setQuestions((prev) =>
                prev.map((q) => (q.id === editingId ? normalizedQuestion : q))
            );
        } else {
            setQuestions((prev) => [...prev, normalizedQuestion]);
        }

        setCreatingNew(false);
        setEditingId(null);
        setDraftQuestion(null);
    };

    // Drag & drop
    const handleDragStart = (id) => {
        setDraggingId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOn = (targetId) => {
        if (!draggingId || draggingId === targetId) return;
        setQuestions((prev) => {
            const fromIndex = prev.findIndex((q) => q.id === draggingId);
            const toIndex = prev.findIndex((q) => q.id === targetId);
            if (fromIndex === -1 || toIndex === -1) return prev;
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });
        setDraggingId(null);
    };

    const handleDragEnd = () => setDraggingId(null);

    const renderQuestionViewCard = (q, index) => {
        const isExpanded = expandedId === q.id && editingId !== q.id;
        const isDragging = draggingId === q.id;

        return (
            <div
                key={q.id}
                className={
                    "question-card" +
                    (isExpanded ? " question-card--expanded" : " question-card--collapsed") +
                    (isDragging ? " question-card--dragging" : "")
                }
                draggable
                onDragStart={() => handleDragStart(q.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOn(q.id)}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="question-card__header"
                    onClick={() => handleClickCard(q.id)}
                >
                    <div className="question-card__drag-handle">⋮⋮</div>
                    <div className="question-card__title">
                        {`Câu ${index + 1} - `}&nbsp;
                        <span className="question-card__part-name">{partName}</span>
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
                    <p className="question-card__text">
                        {q.text || "Chưa có nội dung câu hỏi."}
                    </p>

                    {q.audioUrl && (
                        <div className="question-card__audio">
                            <span>Âm thanh:</span>
                            <audio src={q.audioUrl} controls />
                        </div>
                    )}

                    {q.options && q.options.length > 0 && (
                        <div className="question-card__options">
                            <div className="question-card__options-label">Đáp án:</div>
                            <ul>
                                {q.options.map((opt, idx) => (
                                    <li key={idx}>
                                        {String.fromCharCode(65 + idx)}. {opt}
                                        {q.correctOptionIndex === idx && (
                                            <strong
                                                style={{ color: "#16a34a", marginLeft: 6, fontSize: 12 }}
                                            >
                                                ✓
                                            </strong>
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

    const showFormCard = creatingNew || editingId;

    return (
        <div className="part-detail">
            {/* Header */}
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
                    <p>{testName} -</p>
                    <span className="part-detail__part-name">{partName}</span>
                </div>

                <div className="part-detail__hero-actions">
                    <button className="part-detail__btn part-detail__btn--outlined">
                        <img src={crown} className="crown-icon" alt="crown-icon" />
                        Dùng thử bộ câu hỏi
                    </button>
                    <button
                        className="part-detail__btn part-detail__btn--solid"
                        onClick={handleStartCreate}
                    >
                        + Thêm câu hỏi
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="part-detail__content">
                <div className="part-detail__left">
                    {/* Nếu chưa có câu hỏi & không show form, hiển thị nút Thêm */}
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

                    {/* Danh sách câu hỏi */}
                    {questions.length > 0 && (
                        <div className="part-detail__question-list">
                            {questions.map((q, index) => renderQuestionViewCard(q, index))}
                        </div>
                    )}

                    {/* Nút thêm dưới list */}
                    {questions.length > 0 && !creatingNew && !editingId && (
                        <div className="part-detail__add-bottom">
                            <button
                                className="part-detail__btn part-detail__btn--solid"
                                onClick={handleStartCreate}
                            >
                                + Thêm câu hỏi
                            </button>
                        </div>
                    )}
                </div>

                {/* Card form: thêm / chỉnh sửa */}
                {showFormCard && draftQuestion && (
                    <div className="part-detail__right">
                        <div className="question-form">
                            <div className="question-form__header">
                                <div className="question-form__title">
                                    {editingId
                                        ? `Chỉnh sửa - ${partName}`
                                        : `Câu ${questions.length + 1} - ${partName}`}
                                </div>
                                <button
                                    className="question-form__close"
                                    onClick={() => {
                                        setCreatingNew(false);
                                        setEditingId(null);
                                        setDraftQuestion(null);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* TEXT */}
                            <div className="question-form__group">
                                <label>Câu hỏi</label>
                                <textarea
                                    value={draftQuestion.text}
                                    onChange={(e) => handleChangeDraft("text", e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* TỆP ĐÍNH KÈM */}
                            <div className="question-form__group">
                                <label>Tệp đính kèm</label>

                                <div className="question-form__attachments">
                                    {/* AUDIO */}
                                    <div className="question-form__attachment">
                                        <div className="question-form__attachment-header">
                                            <span className="question-form__attachment-label">Âm thanh</span>
                                            {draftQuestion.audioUrl && (
                                                <button
                                                    type="button"
                                                    className="question-form__attachment-remove"
                                                    onClick={handleClearAudio}
                                                >
                                                    Xoá
                                                </button>
                                            )}
                                        </div>

                                        <div className="question-form__attachment-body">
                                            <label className="part-detail__btn part-detail__btn--dash question-form__upload-btn">
                                                <span>{draftQuestion.audioUrl ? "Thay audio" : "+ Tải audio"}</span>
                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={handleAudioChange}
                                                />
                                            </label>

                                            {draftQuestion.audioName && (
                                                <span className="question-form__file-name">
                                                    {draftQuestion.audioName}
                                                </span>
                                            )}
                                        </div>

                                        {draftQuestion.audioUrl && (
                                            <audio
                                                controls
                                                src={draftQuestion.audioUrl}
                                                style={{ marginTop: "8px", width: "100%" }}
                                            />
                                        )}
                                    </div>

                                    {/* IMAGE */}
                                    <div className="question-form__attachment">
                                        <div className="question-form__attachment-header">
                                            <span className="question-form__attachment-label">Hình ảnh</span>
                                            {draftQuestion.imageUrl && (
                                                <button
                                                    type="button"
                                                    className="question-form__attachment-remove"
                                                    onClick={handleClearImage}
                                                >
                                                    Xoá
                                                </button>
                                            )}
                                        </div>

                                        <div className="question-form__attachment-body">
                                            <label className="part-detail__btn part-detail__btn--dash question-form__upload-btn">
                                                <span>{draftQuestion.imageUrl ? "Thay hình" : "+ Tải hình"}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>

                                            {draftQuestion.imageName && (
                                                <span className="question-form__file-name">
                                                    {draftQuestion.imageName}
                                                </span>
                                            )}
                                        </div>

                                        {draftQuestion.imageUrl && (
                                            <img
                                                src={draftQuestion.imageUrl}
                                                alt="preview"
                                                className="question-form__preview-img"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ĐÁP ÁN */}
                            <div className="question-form__group">
                                <div className="question-form__group-header">
                                    <label>Đáp án (nhiều nhất 4 đáp án)</label>
                                    <button
                                        className="part-detail__btn part-detail__btn--dash"
                                        onClick={handleAddOption}
                                        disabled={draftQuestion.options.length >= 4}
                                        type="button"
                                    >
                                        + Thêm đáp án
                                    </button>
                                </div>

                                <div className="question-form__options">
                                    {draftQuestion.options.map((opt, idx) => {
                                        const isCorrect = draftQuestion.correctOptionIndex === idx;

                                        return (
                                            <div
                                                key={idx}
                                                className={
                                                    "question-form__option-row" +
                                                    (isCorrect ? " question-form__option-row--correct" : "")
                                                }
                                            >
                                                <span className="question-form__option-label">
                                                    {String.fromCharCode(65 + idx)}.
                                                </span>

                                                <input
                                                    type="text"
                                                    value={opt}
                                                    placeholder="Nhập nội dung đáp án"
                                                    onChange={(e) => handleChangeOption(idx, e.target.value)}
                                                />

                                                <button
                                                    type="button"
                                                    className={
                                                        "question-form__option-check" +
                                                        (isCorrect ? " question-form__option-check--active" : "")
                                                    }
                                                    onClick={() => handleMarkCorrect(idx)}
                                                    title="Đánh dấu đúng"
                                                >
                                                    ✓
                                                </button>

                                                <button
                                                    type="button"
                                                    className="question-form__option-remove"
                                                    onClick={() => handleRemoveOption(idx)}
                                                    title="Xoá"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="question-form__footer">
                                <button
                                    className="part-detail__btn part-detail__btn--solid"
                                    onClick={handleSaveDraft}
                                >
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
