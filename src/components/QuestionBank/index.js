import React, { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoMdSearch, IoMdInformationCircle } from "react-icons/io";
import PreviewToeicQuestion from "../PreviewToeicQuestion";
import PreviewGroupToeicQuestion from "../PreviewGroupToeicQuestion";
import "./QuestionBank.scss";

const QuestionBank = ({ open, onClose, partNumber }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPart, setSelectedPart] = useState(
    partNumber ? `Part ${partNumber}` : "Tất cả"
  );
  const [filterStatus, setFilterStatus] = useState("Áp dụng");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());

  // Preview modals state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'single' or 'group'

  // Mock data - thay bằng data thật từ API
  const mockQuestions = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: 150 + i,
      detail: "What is the main topic of the conversation?",
      contributor: "Nguyen Van A",
    }));

  const totalPages = 10;

  const handleToggleQuestion = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === mockQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(
        new Set(mockQuestions.map((q, i) => `${q.id}-${i}`))
      );
    }
  };

  const handleAddSelectedQuestions = () => {
    // TODO: Implement logic to add selected questions
    console.log("Selected questions:", selectedQuestions);
    onClose();
  };

  // Xử lý xem chi tiết câu hỏi
  const handleViewDetail = (question) => {
    // Xác định loại câu hỏi dựa trên part
    const part = question.part || partNumber;
    const isGroupQuestion = ["3", "4", "6", "7", 3, 4, 6, 7].includes(part);

    setPreviewQuestion(question);
    setPreviewType(isGroupQuestion ? "group" : "single");
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewQuestion(null);
    setPreviewType(null);
  };

  if (!open) return null;

  return (
    <div className="question-bank">
      <div className="question-bank__overlay" onClick={onClose} />

      <div className="question-bank__container">
        {/* Header */}
        <div className="question-bank__header">
          <h2 className="question-bank__title">Ngân hàng câu hỏi</h2>
          <button
            onClick={onClose}
            className="question-bank__close-btn"
            aria-label="Đóng"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="question-bank__filters">
          <div className="question-bank__search">
            <div className="question-bank__search-input-wrapper">
              <input
                type="text"
                placeholder="Tìm câu hỏi"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="question-bank__search-input"
              />
              <IoMdSearch className="question-bank__search-icon" size={20} />
            </div>
            <button className="question-bank__search-btn">Tìm kiếm</button>
          </div>

          <div className="question-bank__filter-row">
            <span className="question-bank__filter-label">Part:</span>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="question-bank__select"
            >
              <option>Tất cả</option>
              <option>Part 1</option>
              <option>Part 2</option>
              <option>Part 3</option>
              <option>Part 4</option>
              <option>Part 5</option>
              <option>Part 6</option>
              <option>Part 7</option>
            </select>

            <div className="question-bank__filter-buttons">
              <button
                onClick={() => setFilterStatus("Áp dụng")}
                className={`question-bank__filter-btn ${
                  filterStatus === "Áp dụng"
                    ? "question-bank__filter-btn--active"
                    : ""
                }`}
              >
                Áp dụng
              </button>
              <button
                onClick={() => setFilterStatus("Chưa áp dụng")}
                className={`question-bank__filter-btn ${
                  filterStatus === "Chưa áp dụng"
                    ? "question-bank__filter-btn--active"
                    : ""
                }`}
              >
                Chưa áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="question-bank__table-wrapper">
          <table className="question-bank__table">
            <thead className="question-bank__table-head">
              <tr>
                <th className="question-bank__table-header question-bank__table-header--checkbox">
                  <input
                    type="checkbox"
                    checked={
                      selectedQuestions.size === mockQuestions.length &&
                      mockQuestions.length > 0
                    }
                    onChange={handleSelectAll}
                    className="question-bank__checkbox"
                  />
                </th>
                <th className="question-bank__table-header question-bank__table-header--id">
                  ID
                </th>
                <th className="question-bank__table-header">Câu hỏi</th>
                <th className="question-bank__table-header question-bank__table-header--contributor">
                  Người đóng góp
                </th>
                <th className="question-bank__table-header question-bank__table-header--action">
                  Chọn
                </th>
              </tr>
            </thead>
            <tbody className="question-bank__table-body">
              {mockQuestions.map((q, index) => {
                const questionKey = `${q.id}-${index}`;
                const isSelected = selectedQuestions.has(questionKey);

                return (
                  <tr key={questionKey} className="question-bank__table-row">
                    <td className="question-bank__table-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleQuestion(questionKey)}
                        className="question-bank__checkbox"
                      />
                    </td>
                    <td className="question-bank__table-cell">{q.id}</td>
                    <td className="question-bank__table-cell">{q.detail}</td>
                    <td className="question-bank__table-cell">
                      {q.contributor}
                    </td>
                    <td className="question-bank__table-cell">
                      <button
                        className="question-bank__infor-btn"
                        onClick={() => handleViewDetail(q)}
                        title="Xem chi tiết"
                      >
                        <IoMdInformationCircle />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="question-bank__pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="question-bank__page-btn"
          >
            Trước
          </button>

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`question-bank__page-btn ${
                currentPage === page ? "question-bank__page-btn--active" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <span className="question-bank__page-ellipsis">...</span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="question-bank__page-btn"
          >
            Sau
          </button>
        </div>

        {/* Footer Actions */}
        <div className="question-bank__footer">
          <span className="question-bank__footer-text">
            Đã chọn: <strong>{selectedQuestions.size}</strong> câu hỏi
          </span>
          <div className="question-bank__footer-actions">
            <button
              onClick={onClose}
              className="question-bank__footer-btn question-bank__footer-btn--cancel"
            >
              Hủy
            </button>
            <button
              disabled={selectedQuestions.size === 0}
              onClick={handleAddSelectedQuestions}
              className="question-bank__footer-btn question-bank__footer-btn--submit"
            >
              Thêm câu hỏi đã chọn
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modals */}
      {previewType === "single" && (
        <PreviewToeicQuestion
          open={showPreviewModal}
          onClose={handleClosePreview}
          question={previewQuestion}
        />
      )}

      {previewType === "group" && (
        <PreviewGroupToeicQuestion
          open={showPreviewModal}
          onClose={handleClosePreview}
          groupQuestion={previewQuestion}
        />
      )}
    </div>
  );
};

export default QuestionBank;
