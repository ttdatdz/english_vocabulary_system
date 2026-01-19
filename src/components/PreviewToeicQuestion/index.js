import React from "react";
import BaseModal from "../BaseModal";
import "./PreviewToeicQuestion.scss";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function PreviewToeicQuestion({ open, onClose, question }) {
  if (!question) return null;

  // Support multiple audio naming conventions
  const audioSrc =
    question.audioPreview ||
    question.audioPreviewUrl ||
    question.audioUrl ||
    question.audio ||
    "";

  // Support multiple image naming conventions
  const imageUrls = Array.isArray(question.imageUrls)
    ? question.imageUrls
    : Array.isArray(question.imagePreviews)
    ? question.imagePreviews
    : Array.isArray(question.images)
    ? question.images
    : [];

  const options = Array.isArray(question.options) ? question.options : [];

  // Tìm index của đáp án đúng
  const correctIndex =
    question.correctOptionIndex ??
    (question.result ? LETTERS.indexOf(question.result) : -1);

  return (
    <BaseModal
      open={open}
      onCancel={onClose}
      title={
        <div className="preview-question__modal-title">
          <span className="preview-question__modal-title-icon">👁️</span>
          Xem chi tiết - Câu {question.indexNumber || question.id || "?"} - Part{" "}
          {question.part || "?"}
        </div>
      }
      width={800}
    >
      <div className="preview-question">
        <div className="preview-question__content">
          {/* Câu hỏi */}
          <div className="preview-question__section">
            <div className="preview-question__section-header">
              <span className="preview-question__section-icon">📝</span>
              <label className="preview-question__label">Câu hỏi</label>
            </div>
            <div className="preview-question__text-box">
              {question.detail || (
                <span className="preview-question__empty">
                  Không có nội dung
                </span>
              )}
            </div>
          </div>

          {/* Tệp đính kèm */}
          <div className="preview-question__section">
            <div className="preview-question__section-header">
              <span className="preview-question__section-icon">📎</span>
              <label className="preview-question__label">Tệp đính kèm</label>
            </div>

            <div className="preview-question__attachments">
              {/* Audio */}
              <div className="preview-question__attachment">
                <div className="preview-question__attachment-header">
                  <span className="preview-question__attachment-icon">🔊</span>
                  <span className="preview-question__attachment-label">
                    Âm thanh
                  </span>
                </div>
                <div className="preview-question__attachment-body">
                  {audioSrc ? (
                    <audio
                      controls
                      src={audioSrc}
                      className="preview-question__audio"
                    />
                  ) : (
                    <div className="preview-question__no-media">
                      <span className="preview-question__no-media-icon">
                        🔇
                      </span>
                      Không có âm thanh
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="preview-question__attachment">
                <div className="preview-question__attachment-header">
                  <span className="preview-question__attachment-icon">🖼️</span>
                  <span className="preview-question__attachment-label">
                    Hình ảnh
                  </span>
                </div>
                <div className="preview-question__attachment-body">
                  {imageUrls.length > 0 ? (
                    <div className="preview-question__image-list">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="preview-question__image-item">
                          <img
                            src={url}
                            alt={`img-${idx}`}
                            className="preview-question__image"
                          />
                          <div className="preview-question__image-overlay">
                            <span>Ảnh {idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="preview-question__no-media">
                      <span className="preview-question__no-media-icon">
                        🖼️
                      </span>
                      Không có hình ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Đáp án */}
          <div className="preview-question__section">
            <div className="preview-question__section-header">
              <span className="preview-question__section-icon">✅</span>
              <label className="preview-question__label">
                Đáp án ({options.length}/5)
              </label>
            </div>

            {options.length > 0 ? (
              <div className="preview-question__options">
                {options.map((opt, idx) => {
                  const isCorrect = correctIndex === idx;
                  const optionText =
                    typeof opt === "string" ? opt : opt.detail || "";

                  return (
                    <div
                      key={idx}
                      className={`preview-question__option ${
                        isCorrect ? "preview-question__option--correct" : ""
                      }`}
                    >
                      <span className="preview-question__option-letter">
                        {LETTERS[idx]}
                      </span>
                      <span className="preview-question__option-text">
                        {optionText || (
                          <span className="preview-question__empty">
                            Chưa có nội dung
                          </span>
                        )}
                      </span>
                      {isCorrect && (
                        <span className="preview-question__option-check">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="preview-question__no-options">
                Chưa có đáp án nào
              </div>
            )}
          </div>

          {/* Giải thích */}
          <div className="preview-question__section">
            <div className="preview-question__section-header">
              <span className="preview-question__section-icon">💡</span>
              <label className="preview-question__label">Giải thích</label>
            </div>
            <div className="preview-question__text-box preview-question__text-box--clarify">
              {question.clarify || (
                <span className="preview-question__empty">
                  Không có giải thích
                </span>
              )}
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="preview-question__section">
            <div className="preview-question__section-header">
              <span className="preview-question__section-icon">ℹ️</span>
              <label className="preview-question__label">Thông tin khác</label>
            </div>
            <div className="preview-question__meta">
              <div className="preview-question__meta-item">
                <span className="preview-question__meta-label">ID:</span>
                <span className="preview-question__meta-value">
                  {question.id || "N/A"}
                </span>
              </div>
              <div className="preview-question__meta-item">
                <span className="preview-question__meta-label">Part:</span>
                <span className="preview-question__meta-value">
                  {question.part || "N/A"}
                </span>
              </div>
              <div className="preview-question__meta-item">
                <span className="preview-question__meta-label">Số thứ tự:</span>
                <span className="preview-question__meta-value">
                  {question.indexNumber || "N/A"}
                </span>
              </div>
              {question.contributor && (
                <div className="preview-question__meta-item">
                  <span className="preview-question__meta-label">
                    Người đóng góp:
                  </span>
                  <span className="preview-question__meta-value">
                    {question.contributor}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="preview-question__footer">
          <button
            className="preview-question__btn preview-question__btn--close"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </BaseModal>
  );
}