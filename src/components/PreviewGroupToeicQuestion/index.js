import React from "react";
import BaseModal from "../BaseModal";
import "./PreviewGroupToeicQuestion.scss";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function PreviewGroupToeicQuestion({
  open,
  onClose,
  groupQuestion,
}) {
  if (!groupQuestion) return null;

  // Support multiple image naming conventions
  const groupImageUrls = Array.isArray(groupQuestion.imageUrls)
    ? groupQuestion.imageUrls
    : Array.isArray(groupQuestion.imagePreviews)
      ? groupQuestion.imagePreviews
      : Array.isArray(groupQuestion.images)
        ? groupQuestion.images
        : [];

  // Support multiple audio naming conventions
  const groupAudioUrls = Array.isArray(groupQuestion.audioUrls)
    ? groupQuestion.audioUrls
    : groupQuestion.audioUrl
      ? [groupQuestion.audioUrl]
      : groupQuestion.audioPreview
        ? [groupQuestion.audioPreview]
        : Array.isArray(groupQuestion.audios)
          ? groupQuestion.audios
          : [];

  const questions = Array.isArray(groupQuestion.questions)
    ? groupQuestion.questions
    : [];

  return (
    <BaseModal
      open={open}
      onCancel={onClose}
      title={
        <div className="preview-group__modal-title">
          Xem chi tiết -{" "}
          {groupQuestion.title || `Part ${groupQuestion.part || "?"}`}
          {groupQuestion.questionRange && (
            <span className="preview-group__modal-title-range">
              ({groupQuestion.questionRange})
            </span>
          )}
        </div>
      }
      width={950}
    >
      <div className="preview-group">
        <div className="preview-group__content">
          {/* Thông tin nhóm */}
          <div className="preview-group__info-bar">
            <div className="preview-group__info-item">
              <span className="preview-group__info-label">ID:</span>
              <span className="preview-group__info-value">
                {groupQuestion.id || "N/A"}
              </span>
            </div>
            <div className="preview-group__info-item">
              <span className="preview-group__info-label">Part:</span>
              <span className="preview-group__info-value">
                {groupQuestion.part || "N/A"}
              </span>
            </div>
            <div className="preview-group__info-item">
              <span className="preview-group__info-label">Số câu:</span>
              <span className="preview-group__info-value">
                {questions.length}
              </span>
            </div>
            {groupQuestion.contributor && (
              <div className="preview-group__info-item">
                <span className="preview-group__info-label">Người tạo:</span>
                <span className="preview-group__info-value">
                  {groupQuestion.contributor}
                </span>
              </div>
            )}
          </div>

          {/* Nội dung (hội thoại / đoạn văn) */}
          <div className="preview-group__section">
            <div className="preview-group__section-header">
              <label className="preview-group__label">
                Nội dung (hội thoại / đoạn văn)
              </label>
            </div>
            <div className="preview-group__text-box">
              {groupQuestion.content || (
                <span className="preview-group__empty">Không có nội dung</span>
              )}
            </div>
          </div>

          {/* Tệp đính kèm của nhóm */}
          <div className="preview-group__section">
            <div className="preview-group__section-header">
              <label className="preview-group__label">
                Tệp đính kèm của nhóm
              </label>
            </div>

            <div className="preview-group__attachments">
              {/* Audio */}
              <div className="preview-group__attachment">
                <div className="preview-group__attachment-header">
                  <span className="preview-group__attachment-label">
                    Âm thanh ({groupAudioUrls.length})
                  </span>
                </div>
                <div className="preview-group__attachment-body">
                  {groupAudioUrls.length > 0 ? (
                    <div className="preview-group__audio-list">
                      {groupAudioUrls.map((url, idx) => (
                        <div key={idx} className="preview-group__audio-item">
                          <span className="preview-group__audio-label">
                            Audio {idx + 1}
                          </span>
                          <audio
                            controls
                            src={url}
                            className="preview-group__audio"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="preview-group__no-media">
                      Không có âm thanh
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="preview-group__attachment">
                <div className="preview-group__attachment-header">
                  <span className="preview-group__attachment-label">
                    Hình ảnh ({groupImageUrls.length})
                  </span>
                </div>
                <div className="preview-group__attachment-body">
                  {groupImageUrls.length > 0 ? (
                    <div className="preview-group__image-list">
                      {groupImageUrls.map((url, idx) => (
                        <div key={idx} className="preview-group__image-item">
                          <img
                            src={url}
                            alt={`group-img-${idx}`}
                            className="preview-group__image"
                          />
                          <div className="preview-group__image-overlay">
                            <span>Ảnh {idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="preview-group__no-media">
                      Không có hình ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div className="preview-group__section preview-group__section--questions">
            <div className="preview-group__section-header">
              <label className="preview-group__label">
                Danh sách câu hỏi ({questions.length})
              </label>
            </div>

            {questions.length > 0 ? (
              <div className="preview-group__questions">
                {questions.map((q, qIdx) => {
                  const options = Array.isArray(q.options) ? q.options : [];
                  const correctIndex =
                    q.correctOptionIndex ??
                    (q.result ? LETTERS.indexOf(q.result) : -1);

                  // Hình ảnh của câu hỏi con
                  const qImageUrls = Array.isArray(q.imageUrls)
                    ? q.imageUrls
                    : Array.isArray(q.imagePreviews)
                      ? q.imagePreviews
                      : [];

                  return (
                    <div key={qIdx} className="preview-group__question-card">
                      {/* Header câu hỏi */}
                      <div className="preview-group__question-header">
                        <span className="preview-group__question-number">
                          Câu {q.indexNumber || qIdx + 1}
                        </span>
                        {correctIndex >= 0 && (
                          <span className="preview-group__question-answer">
                            Đáp án: {LETTERS[correctIndex]}
                          </span>
                        )}
                      </div>

                      {/* Nội dung câu hỏi */}
                      <div className="preview-group__question-section">
                        <label className="preview-group__question-label">
                          Nội dung câu hỏi:
                        </label>
                        <div className="preview-group__question-detail">
                          {q.detail || (
                            <span className="preview-group__empty">
                              Không có nội dung
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hình ảnh của câu hỏi con */}
                      {qImageUrls.length > 0 && (
                        <div className="preview-group__question-section">
                          <label className="preview-group__question-label">
                            Hình ảnh:
                          </label>
                          <div className="preview-group__question-images">
                            {qImageUrls.map((url, idx) => (
                              <div
                                key={idx}
                                className="preview-group__question-image-item"
                              >
                                <img
                                  src={url}
                                  alt={`q-img-${idx}`}
                                  className="preview-group__question-image"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Đáp án */}
                      <div className="preview-group__question-section">
                        <label className="preview-group__question-label">
                          Đáp án ({options.length}/5):
                        </label>
                        {options.length > 0 ? (
                          <div className="preview-group__question-options">
                            {options.map((opt, optIdx) => {
                              const isCorrect = correctIndex === optIdx;
                              const optionText =
                                typeof opt === "string"
                                  ? opt
                                  : opt.detail || "";

                              return (
                                <div
                                  key={optIdx}
                                  className={`preview-group__option ${
                                    isCorrect
                                      ? "preview-group__option--correct"
                                      : ""
                                  }`}
                                >
                                  <span className="preview-group__option-letter">
                                    {LETTERS[optIdx]}
                                  </span>
                                  <span className="preview-group__option-text">
                                    {optionText || (
                                      <span className="preview-group__empty">
                                        Chưa có nội dung
                                      </span>
                                    )}
                                  </span>
                                  {isCorrect && (
                                    <span className="preview-group__option-check">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="preview-group__no-options">
                            Chưa có đáp án
                          </div>
                        )}
                      </div>

                      {/* Giải thích */}
                      <div className="preview-group__question-section">
                        <label className="preview-group__question-label">
                          Giải thích:
                        </label>
                        <div className="preview-group__question-clarify">
                          {q.clarify || (
                            <span className="preview-group__empty">
                              Không có giải thích
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="preview-group__no-questions">
                <span>Nhóm này chưa có câu hỏi nào</span>
              </div>
            )}
          </div>
        </div>

        <div className="preview-group__footer">
          <button
            className="preview-group__btn preview-group__btn--close"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
