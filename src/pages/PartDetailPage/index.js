// src/pages/PartDetailPage.jsx
import React, { useState } from "react";
import "./PartDetailPage.css";

const createEmptyQuestion = (index, partName) => ({
    id: Date.now(),
    title: `Câu ${index} - ${partName}`,
    text: "",
    audioUrl: "",
    options: ["", ""], // tối thiểu 2 đáp án
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
        initialQuestions.length === 0
            ? createEmptyQuestion(1, partName)
            : null
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
        setDraftQuestion({ ...q });
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

    const handleSaveDraft = () => {
        if (!draftQuestion.text.trim()) {
            alert("Vui lòng nhập nội dung câu hỏi");
            return;
        }
        if (editingId) {
            // update
            setQuestions((prev) =>
                prev.map((q) => (q.id === editingId ? { ...draftQuestion } : q))
            );
        } else {
            // create
            setQuestions((prev) => [...prev, draftQuestion]);
        }
        setCreatingNew(false);
        setEditingId(null);
        setDraftQuestion(null);
    };

    const handlePreviewDraft = () => {
        alert("Tính năng xem trước sẽ implement sau 😄");
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
                            <div className="question-card__options-label">
                                Đáp án:
                            </div>
                            <ul>
                                {q.options.map((opt, idx) => (
                                    <li key={idx}>{String.fromCharCode(65 + idx)}. {opt}</li>
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
                    <div className="part-detail__hero-icon">📘</div>
                    <div>
                        <h1 className="part-detail__title">Tạo đề thi</h1>
                        <p className="part-detail__subtitle">
                            {testName} | {durationMinutes} phút
                        </p>
                    </div>
                </div>

                <div className="part-detail__hero-center">
                    <span className="part-detail__part-name">{partName}</span>
                </div>

                <div className="part-detail__hero-actions">
                    <button className="part-detail__btn part-detail__btn--outlined">
                        Dùng thử bộ câu hỏi
                    </button>
                    <button
                        className="part-detail__btn part-detail__btn--solid"
                        onClick={handleStartCreate}
                    >
                        + Thêm câu hỏi
                    </button>
                    <button
                        className="part-detail__btn part-detail__btn--ghost"
                        onClick={handleBack}
                    >
                        ⟵ Quay lại
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

                            <div className="question-form__group">
                                <label>Câu hỏi</label>
                                <textarea
                                    value={draftQuestion.text}
                                    onChange={(e) =>
                                        handleChangeDraft("text", e.target.value)
                                    }
                                    rows={4}
                                />
                            </div>

                            <div className="question-form__group">
                                <label>Âm thanh:</label>
                                <div className="question-form__audio">
                                    <button className="part-detail__btn part-detail__btn--outlined">
                                        + Tải âm thanh
                                    </button>
                                    <span className="question-form__hint">
                                        (chưa xử lý upload, chỉ UI)
                                    </span>
                                </div>
                            </div>

                            <div className="question-form__group">
                                <label>Đáp án (nhiều nhất 4 đáp án)</label>
                                <button
                                    className="part-detail__btn part-detail__btn--ghost"
                                    onClick={handleAddOption}
                                    disabled={draftQuestion.options.length >= 4}
                                    type="button"
                                >
                                    + Thêm đáp án
                                </button>

                                <div className="question-form__options">
                                    {draftQuestion.options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={opt}
                                            placeholder={`${String.fromCharCode(65 + idx)}.`}
                                            onChange={(e) =>
                                                handleChangeOption(idx, e.target.value)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="question-form__footer">
                                <button
                                    className="part-detail__btn part-detail__btn--solid"
                                    onClick={handleSaveDraft}
                                >
                                    Lưu
                                </button>
                                <button
                                    className="part-detail__btn part-detail__btn--outlined"
                                    onClick={handlePreviewDraft}
                                >
                                    Xem trước…
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
