import React from "react";
import BaseModal from "../BaseModal";
import "./CreateToeicQuestion.scss";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function CreateToeicQuestion(props) {
    const {
        open,
        onClose,
        draftQuestion,
        onChangeDraftField,
        onChangeOption,
        onAddOption,
        onRemoveOption,
        onMarkCorrect,
        onAudioChange,
        onClearAudio,
        onAddImage,
        onRemoveImage,
        onSave,
        partNumber,
        isEditing,
        questionIndex,
        loading,
    } = props;

    if (!draftQuestion) return null;

    // Support both audio preview naming conventions used across pages
    const audioSrc = draftQuestion.audioPreview || draftQuestion.audioPreviewUrl || draftQuestion.audioUrl || "";

    const serverImages = Array.isArray(draftQuestion.imageUrls)
        ? draftQuestion.imageUrls
        : [];
    const localPreviews = Array.isArray(draftQuestion.imagePreviews)
        ? draftQuestion.imagePreviews
        : [];

    const options = Array.isArray(draftQuestion.options) ? draftQuestion.options : [];

    return (
        <BaseModal
            open={open}
            onCancel={onClose}
            title={
                isEditing
                    ? `Chỉnh sửa - Part ${partNumber}`
                    : `Câu ${questionIndex} - Part ${partNumber}`
            }
            width={800}
        >
            <div style={{ height: "500px", overflow: "auto" }}>
                {/* TEXT */}
                <div className="question-form__group">
                    <label>Câu hỏi</label>
                    <textarea
                        value={draftQuestion.detail || ""}
                        onChange={(e) => onChangeDraftField("detail", e.target.value)}
                        rows={4}
                        placeholder="Nhập nội dung câu hỏi"
                    />
                </div>

                {/* MEDIA */}
                <div className="question-form__group">
                    <label>Tệp đính kèm</label>
                    <div className="question-form__attachments">
                        {/* AUDIO */}
                        <div className="question-form__attachment">
                            <div className="question-form__attachment-header">
                                <span className="question-form__attachment-label">Âm thanh</span>
                                {audioSrc && (
                                    <button
                                        type="button"
                                        className="question-form__attachment-remove"
                                        onClick={onClearAudio}
                                    >
                                        Xoá
                                    </button>
                                )}
                            </div>

                            <div className="question-form__attachment-body">
                                <label className="question-form__upload-btn">
                                    <span>{audioSrc ? "Thay audio" : "+ Tải audio"}</span>
                                    <input type="file" accept="audio/*" onChange={onAudioChange} />
                                </label>

                                {draftQuestion.audioFile && (
                                    <span className="question-form__file-name">
                                        {draftQuestion.audioFile.name}
                                    </span>
                                )}
                            </div>

                            {audioSrc && (
                                <audio
                                    controls
                                    src={audioSrc}
                                    style={{ marginTop: "8px", width: "100%" }}
                                />
                            )}
                        </div>

                        {/* IMAGES */}
                        <div className="question-form__attachment">
                            <div className="question-form__attachment-header">
                                <span className="question-form__attachment-label">Hình ảnh</span>
                            </div>

                            <div className="question-form__attachment-body">
                                <label className="question-form__upload-btn">
                                    <span>+ Thêm hình</span>
                                    <input type="file" accept="image/*" onChange={onAddImage} />
                                </label>
                            </div>

                            {(serverImages.length > 0 || localPreviews.length > 0) && (
                                <div className="question-form__image-list">
                                    {serverImages.map((url, idx) => (
                                        <div key={`server-${idx}`} className="question-form__image-item">
                                            <img
                                                src={url}
                                                alt={`server-${idx}`}
                                                className="question-form__preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="question-form__option-remove"
                                                onClick={() => onRemoveImage("server", idx)}
                                                title="Xoá ảnh"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {localPreviews.map((url, idx) => (
                                        <div key={`local-${idx}`} className="question-form__image-item">
                                            <img
                                                src={url}
                                                alt={`preview-${idx}`}
                                                className="question-form__preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="question-form__option-remove"
                                                onClick={() => onRemoveImage("local", idx)}
                                                title="Xoá ảnh"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* OPTIONS */}
                <div className="question-form__group">
                    <div className="question-form__group-header">
                        <label>Đáp án (nhiều nhất 5 đáp án)</label>
                        <button
                            className="question-form__btn question-form__btn--dash"
                            onClick={onAddOption}
                            disabled={options.length >= 5}
                            type="button"
                        >
                            + Thêm đáp án
                        </button>
                    </div>

                    <div className="question-form__options">
                        {options.map((opt, idx) => {
                            const isCorrect = draftQuestion.correctOptionIndex === idx;
                            const canDelete = options.length > 2;

                            return (
                                <div
                                    key={idx}
                                    className={
                                        "question-form__option-row" +
                                        (isCorrect ? " question-form__option-row--correct" : "")
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span className="question-form__option-label">
                                        {(LETTERS[idx] || idx + 1) + "."}
                                    </span>

                                    <input
                                        type="text"
                                        value={opt}
                                        placeholder="Nhập nội dung đáp án"
                                        onChange={(e) => onChangeOption(idx, e.target.value)}
                                        style={{ flex: 1, minWidth: 0 }}
                                    />

                                    <button
                                        type="button"
                                        className={
                                            "question-form__option-check" +
                                            (isCorrect ? " question-form__option-check--active" : "")
                                        }
                                        onClick={() => onMarkCorrect(idx)}
                                        title="Đánh dấu đúng"
                                    >
                                        ✓
                                    </button>

                                    {/* ✅ NÚT XOÁ OPTION: class khác + inline để không bị CSS nút xoá ảnh đè */}
                                    <button
                                        type="button"
                                        className="question-form__option-delete"
                                        onClick={() => onRemoveOption(idx)}
                                        title="Xoá đáp án"
                                        disabled={!canDelete}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            border: "1px solid rgba(255,255,255,0.2)",
                                            background: "transparent",
                                            cursor: canDelete ? "pointer" : "not-allowed",
                                            opacity: canDelete ? 1 : 0.4,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            lineHeight: 1,
                                            fontSize: 16,
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* GIẢI THÍCH */}
                    <div className="question-form__group" style={{ marginTop: 12 }}>
                        <label>Giải thích</label>
                        <textarea
                            value={draftQuestion.clarify || ""}
                            onChange={(e) => onChangeDraftField("clarify", e.target.value)}
                            rows={3}
                            placeholder="Nhập giải thích cho đáp án (tuỳ chọn)"
                        />
                    </div>
                </div>

                <div className="question-form__footer">
                    <button
                        className="question-form__btn question-form__btn--solid"
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo câu hỏi"}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
