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

  const imageUrls = Array.isArray(groupQuestion.imageUrls)
    ? groupQuestion.imageUrls
    : Array.isArray(groupQuestion.images)
    ? groupQuestion.images
    : [];

  const audioUrls = Array.isArray(groupQuestion.audioUrls)
    ? groupQuestion.audioUrls
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
      title={`Xem chi tiết nhóm - ${
        groupQuestion.title || `Part ${groupQuestion.part}`
      }`}
      width={900}
    >
      <div className="preview-group-question">
        <div className="preview-group-question__content">
          {/* Nội dung (hội thoại / đoạn văn) */}
          <div className="preview-group-question__section">
            <label className="preview-group-question__label">
              Nội dung (hội thoại / đoạn văn):
            </label>
            <div className="preview-group-question__text-box">
              {groupQuestion.content || "Không có nội dung"}
            </div>
          </div>

          {/* Hình ảnh của nhóm */}
          <div className="preview-group-question__section">
            <label className="preview-group-question__label">Hình ảnh:</label>
            {imageUrls.length > 0 ? (
              <div className="preview-group-question__image-list">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="preview-group-question__image-item">
                    <img
                      src={url}
                      alt={`group-img-${idx}`}
                      className="preview-group-question__image"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="preview-group-question__no-media">
                Không có hình ảnh
              </div>
            )}
          </div>

          {/* Âm thanh của nhóm */}
          <div className="preview-group-question__section">
            <label className="preview-group-question__label">Âm thanh:</label>
            {audioUrls.length > 0 ? (
              <div className="preview-group-question__audio-list">
                {audioUrls.map((url, idx) => (
                  <audio
                    key={idx}
                    controls
                    src={url}
                    className="preview-group-question__audio"
                  />
                ))}
              </div>
            ) : (
              <div className="preview-group-question__no-media">
                Không có âm thanh
              </div>
            )}
          </div>

          {/* Câu hỏi */}
          <div className="preview-group-question__section">
            <label className="preview-group-question__label">
              Câu hỏi ({questions.length || 0}):
            </label>

            {questions.length > 0 ? (
              <div className="preview-group-question__questions">
                {questions.map((q, qIdx) => {
                  const options = Array.isArray(q.options) ? q.options : [];
                  const correctIndex =
                    q.correctOptionIndex ??
                    (q.result ? LETTERS.indexOf(q.result) : -1);

                  return (
                    <div
                      key={qIdx}
                      className="preview-group-question__question-card"
                    >
                      {/* Header câu hỏi */}
                      <div className="preview-group-question__question-header">
                        <span className="preview-group-question__question-number">
                          Câu {q.indexNumber || qIdx + 1}
                        </span>
                      </div>

                      {/* Nội dung câu hỏi */}
                      <div className="preview-group-question__question-detail">
                        {q.detail || "Không có nội dung"}
                      </div>

                      {/* Hình ảnh của câu hỏi con */}
                      {q.imageUrls && q.imageUrls.length > 0 && (
                        <div className="preview-group-question__question-images">
                          {q.imageUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="preview-group-question__question-image-item"
                            >
                              <img
                                src={url}
                                alt={`q-img-${idx}`}
                                className="preview-group-question__question-image"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Đáp án */}
                      {options.length > 0 && (
                        <div className="preview-group-question__question-options">
                          <label className="preview-group-question__options-label">
                            Đáp án (nhiều nhất 5 đáp án):
                          </label>
                          <div className="preview-group-question__options">
                            {options.map((opt, optIdx) => {
                              const isCorrect = correctIndex === optIdx;
                              const optionText =
                                typeof opt === "string"
                                  ? opt
                                  : opt.detail || "";

                              return (
                                <div
                                  key={optIdx}
                                  className={`preview-group-question__option ${
                                    isCorrect
                                      ? "preview-group-question__option--correct"
                                      : ""
                                  }`}
                                >
                                  <span className="preview-group-question__option-letter">
                                    {LETTERS[optIdx]}.
                                  </span>
                                  <span className="preview-group-question__option-text">
                                    {optionText}
                                  </span>
                                  {isCorrect && (
                                    <span className="preview-group-question__option-check">
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
                      <div className="preview-group-question__question-clarify">
                        <label className="preview-group-question__clarify-label">
                          Giải thích:
                        </label>
                        <div className="preview-group-question__clarify-text">
                          {q.clarify || "Không có giải thích"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="preview-group-question__no-questions">
                Nhóm này chưa có câu hỏi nào
              </div>
            )}
          </div>

          {/* Thông tin bổ sung */}
          {(groupQuestion.contributor ||
            groupQuestion.id ||
            groupQuestion.part) && (
            <div className="preview-group-question__section">
              <div className="preview-group-question__meta">
                {groupQuestion.contributor && (
                  <div className="preview-group-question__meta-item">
                    <span className="preview-group-question__meta-label">
                      Người đóng góp:
                    </span>
                    <span className="preview-group-question__meta-value">
                      {groupQuestion.contributor}
                    </span>
                  </div>
                )}
                {groupQuestion.id && (
                  <div className="preview-group-question__meta-item">
                    <span className="preview-group-question__meta-label">
                      ID nhóm:
                    </span>
                    <span className="preview-group-question__meta-value">
                      {groupQuestion.id}
                    </span>
                  </div>
                )}
                {groupQuestion.part && (
                  <div className="preview-group-question__meta-item">
                    <span className="preview-group-question__meta-label">
                      Part:
                    </span>
                    <span className="preview-group-question__meta-value">
                      Part {groupQuestion.part}
                    </span>
                  </div>
                )}
                {groupQuestion.questionRange && (
                  <div className="preview-group-question__meta-item">
                    <span className="preview-group-question__meta-label">
                      Phạm vi:
                    </span>
                    <span className="preview-group-question__meta-value">
                      {groupQuestion.questionRange}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="preview-group-question__footer">
          <button
            className="preview-group-question__btn preview-group-question__btn--close"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
