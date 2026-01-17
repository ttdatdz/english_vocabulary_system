import React from "react";
import BaseModal from "../BaseModal";
import "./PreviewToeicQuestion.scss";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function PreviewToeicQuestion({ open, onClose, question }) {
  if (!question) return null;

  // Support both audio naming conventions
  const audioSrc =
    question.audioPreview ||
    question.audioPreviewUrl ||
    question.audioUrl ||
    question.audio ||
    "";

  const imageUrls = Array.isArray(question.imageUrls)
    ? question.imageUrls
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
      title={`Xem chi tiết - Câu ${
        question.indexNumber || question.id
      } - Part ${question.part}`}
      width={800}
    >
      <div className="preview-question">
        <div className="preview-question__content">
          {/* Câu hỏi */}
          <div className="preview-question__section">
            <label className="preview-question__label">Câu hỏi:</label>
            <div className="preview-question__text-box">
              {question.detail || "Không có nội dung"}
            </div>
          </div>

          {/* Tệp đính kèm */}
          <div className="preview-question__section">
            <label className="preview-question__label">Tệp đính kèm:</label>
            <div className="preview-question__attachments">
              {/* Audio */}
              <div className="preview-question__attachment">
                <div className="preview-question__attachment-header">
                  <span className="preview-question__attachment-label">
                    Âm thanh:
                  </span>
                </div>
                {audioSrc ? (
                  <audio
                    controls
                    src={audioSrc}
                    className="preview-question__audio"
                  />
                ) : (
                  <div className="preview-question__no-media">
                    Không có âm thanh
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="preview-question__attachment">
                <div className="preview-question__attachment-header">
                  <span className="preview-question__attachment-label">
                    Hình ảnh:
                  </span>
                </div>
                {imageUrls.length > 0 ? (
                  <div className="preview-question__image-list">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="preview-question__image-item">
                        <img
                          src={url}
                          alt={`img-${idx}`}
                          className="preview-question__image"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="preview-question__no-media">
                    Không có hình ảnh
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Đáp án */}
          {options.length > 0 && (
            <div className="preview-question__section">
              <label className="preview-question__label">
                Đáp án (nhiều nhất 5 đáp án):
              </label>
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
                        {LETTERS[idx]}.
                      </span>
                      <span className="preview-question__option-text">
                        {optionText}
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
            </div>
          )}

          {/* Giải thích */}
          <div className="preview-question__section">
            <label className="preview-question__label">Giải thích:</label>
            <div className="preview-question__text-box">
              {question.clarify || "Không có giải thích"}
            </div>
          </div>

          {/* Thông tin bổ sung */}
          {(question.contributor || question.id) && (
            <div className="preview-question__section">
              <div className="preview-question__meta">
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
                {question.id && (
                  <div className="preview-question__meta-item">
                    <span className="preview-question__meta-label">ID:</span>
                    <span className="preview-question__meta-value">
                      {question.id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
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
