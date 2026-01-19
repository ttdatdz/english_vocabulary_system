import React, { useState, useEffect, useCallback } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoMdSearch, IoMdInformationCircle, IoMdCheckmarkCircle } from "react-icons/io";
import { get, post } from "../../utils/request";
import PreviewToeicQuestion from "../PreviewToeicQuestion";
import PreviewGroupToeicQuestion from "../PreviewGroupToeicQuestion";
import "./QuestionBank.scss";

/**
 * QuestionBank Component
 * 
 * Props:
 * - open: boolean - hiển thị modal
 * - onClose: () => void - đóng modal
 * - partNumber: string | number - part hiện tại (1-7)
 * - examId: number - ID của exam đang làm việc
 * - onQuestionsAdded: () => void - callback sau khi thêm câu hỏi thành công
 * - usedBankQuestionIds: number[] - danh sách bank question IDs đã dùng trong exam (cho single)
 * - usedBankGroupIds: number[] - danh sách bank group IDs đã dùng trong exam (cho group)
 */
const QuestionBank = ({
  open,
  onClose,
  partNumber,
  examId,
  onQuestionsAdded,
  usedBankQuestionIds = [],
  usedBankGroupIds = [],
}) => {
  // Xác định loại câu hỏi dựa vào part
  const isGroupPart = ["3", "4", "6", "7", 3, 4, 6, 7].includes(partNumber);

  // State
  const [searchText, setSearchText] = useState("");
  const [selectedPart, setSelectedPart] = useState(
    partNumber ? String(partNumber) : "all"
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Tạo Set để check nhanh
  const usedIdsSet = new Set(
    isGroupPart
      ? usedBankGroupIds.map(id => Number(id))
      : usedBankQuestionIds.map(id => Number(id))
  );

  // Fetch questions từ bank
  const fetchQuestions = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    setError(null);

    try {
      // Build search params
      const searchParams = [];
      
      // Filter theo part (nếu không phải "all")
      if (selectedPart && selectedPart !== "all") {
        searchParams.push(`part:${selectedPart}`);
      }

      // Search theo keyword (nếu có)
      if (searchText.trim()) {
        searchParams.push(`detail:${searchText.trim()}`);
      }

      const params = new URLSearchParams({
        pageNo: currentPage,
        pageSize: pageSize,
        isGroup: isGroupPart,
      });

      // Thêm search params
      searchParams.forEach(s => params.append("search", s));

      const response = await get(`/api/question-bank?${params.toString()}`, true);

      if (response) {
        setQuestions(response.items || []);
        setTotalPages(response.totalPage || 0);
      }
    } catch (err) {
      console.error("Fetch bank questions error:", err);
      setError("Không thể tải danh sách câu hỏi từ ngân hàng");
    } finally {
      setLoading(false);
    }
  }, [open, currentPage, pageSize, selectedPart, searchText, isGroupPart]);

  // Fetch khi mở modal hoặc thay đổi filter
  useEffect(() => {
    if (open) {
      fetchQuestions();
    }
  }, [open, fetchQuestions]);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setCurrentPage(0);
      setSearchText("");
      setError(null);
    }
  }, [open]);

  // Reset page khi đổi filter
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedPart, searchText]);

  // Handlers
  const handleSearch = () => {
    setCurrentPage(0);
    fetchQuestions();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleToggleQuestion = (questionId) => {
    // Không cho chọn câu đã dùng
    if (usedIdsSet.has(Number(questionId))) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    // Lọc bỏ những câu đã dùng
    const selectableQuestions = questions.filter(
      q => !usedIdsSet.has(Number(q.id))
    );

    if (selectedIds.size === selectableQuestions.length && selectableQuestions.length > 0) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all (chỉ những câu chưa dùng)
      setSelectedIds(new Set(selectableQuestions.map(q => q.id)));
    }
  };

  const handleViewDetail = (question) => {
    // Map data cho preview modal
    const previewData = isGroupPart
      ? mapGroupForPreview(question)
      : mapSingleForPreview(question);

    setPreviewQuestion(previewData);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewQuestion(null);
  };

  const handleAddSelectedQuestions = async () => {
    if (selectedIds.size === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const ids = Array.from(selectedIds);

      const endpoint = isGroupPart
        ? "/api/question-bank/group"
        : "/api/question-bank/single";

      const payload = {
        ids: ids,
        examId: Number(examId),
      };

      await post(payload, endpoint, true);

      // Success - gọi callback và đóng modal
      if (onQuestionsAdded) {
        onQuestionsAdded();
      }

      onClose();
    } catch (err) {
      console.error("Add questions from bank error:", err);
      
      // Handle specific error messages
      const errorMsg = err?.message || err?.response?.data?.message || "";
      
      if (errorMsg.includes("already exist")) {
        setError("Một số câu hỏi đã tồn tại trong đề thi này");
      } else {
        setError("Thêm câu hỏi thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper: Map single question cho preview
  const mapSingleForPreview = (q) => ({
    id: q.id,
    part: q.part,
    detail: q.detail,
    result: q.result,
    clarify: q.clarify,
    images: q.images || [],
    audio: q.audio,
    options: (q.options || []).map(o => ({
      mark: o.mark,
      detail: o.detail,
    })),
    indexNumber: q.id,
  });

  // Helper: Map group question cho preview
  const mapGroupForPreview = (g) => ({
    id: g.id,
    part: g.part,
    title: `Part ${g.part} - Nhóm ${g.id}`,
    content: g.content,
    images: g.images || [],
    audios: g.audios || [],
    questions: (g.questions || []).map(q => ({
      id: q.id,
      indexNumber: q.indexNumber,
      detail: q.detail,
      result: q.result,
      clarify: q.clarify,
      options: (q.options || []).map(o => ({
        mark: o.mark,
        detail: o.detail,
      })),
    })),
    questionRange: g.questions?.length > 0
      ? `${g.questions[0]?.indexNumber || 1}-${g.questions[g.questions.length - 1]?.indexNumber || g.questions.length}`
      : "",
  });

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="question-bank__pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="question-bank__page-btn"
        >
          Trước
        </button>

        {startPage > 0 && (
          <>
            <button
              onClick={() => handlePageChange(0)}
              className="question-bank__page-btn"
            >
              1
            </button>
            {startPage > 1 && <span className="question-bank__page-ellipsis">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`question-bank__page-btn ${
              currentPage === page ? "question-bank__page-btn--active" : ""
            }`}
          >
            {page + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="question-bank__page-ellipsis">...</span>}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              className="question-bank__page-btn"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="question-bank__page-btn"
        >
          Sau
        </button>
      </div>
    );
  };

  // Count selectable questions
  const selectableCount = questions.filter(q => !usedIdsSet.has(Number(q.id))).length;

  if (!open) return null;

  return (
    <div className="question-bank">
      <div className="question-bank__overlay" onClick={onClose} />

      <div className="question-bank__container">
        {/* Header */}
        <div className="question-bank__header">
          <h2 className="question-bank__title">
            Ngân hàng câu hỏi
            {isGroupPart ? " (Nhóm câu hỏi)" : " (Câu hỏi đơn)"}
          </h2>
          <button
            onClick={onClose}
            className="question-bank__close-btn"
            aria-label="Đóng"
            disabled={submitting}
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
                placeholder="Tìm câu hỏi theo nội dung..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="question-bank__search-input"
              />
              <IoMdSearch className="question-bank__search-icon" size={20} />
            </div>
            <button
              className="question-bank__search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              Tìm kiếm
            </button>
          </div>

          <div className="question-bank__filter-row">
            <span className="question-bank__filter-label">Part:</span>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="question-bank__select"
            >
              <option value="all">Tất cả</option>
              {isGroupPart ? (
                <>
                  <option value="3">Part 3</option>
                  <option value="4">Part 4</option>
                  <option value="6">Part 6</option>
                  <option value="7">Part 7</option>
                </>
              ) : (
                <>
                  <option value="1">Part 1</option>
                  <option value="2">Part 2</option>
                  <option value="5">Part 5</option>
                </>
              )}
            </select>

            <span className="question-bank__filter-info">
              {loading ? "Đang tải..." : `${questions.length} câu hỏi`}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="question-bank__error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Table */}
        <div className="question-bank__table-wrapper">
          {loading ? (
            <div className="question-bank__loading">
              <span>Đang tải danh sách câu hỏi...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="question-bank__empty">
              <span>Không tìm thấy câu hỏi nào trong ngân hàng</span>
            </div>
          ) : (
            <table className="question-bank__table">
              <thead className="question-bank__table-head">
                <tr>
                  <th className="question-bank__table-header question-bank__table-header--checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === selectableCount && selectableCount > 0}
                      onChange={handleSelectAll}
                      className="question-bank__checkbox"
                      disabled={selectableCount === 0}
                    />
                  </th>
                  <th className="question-bank__table-header question-bank__table-header--id">
                    ID
                  </th>
                  <th className="question-bank__table-header question-bank__table-header--part">
                    Part
                  </th>
                  <th className="question-bank__table-header">
                    {isGroupPart ? "Nội dung nhóm" : "Câu hỏi"}
                  </th>
                  {isGroupPart && (
                    <th className="question-bank__table-header question-bank__table-header--count">
                      Số câu
                    </th>
                  )}
                  <th className="question-bank__table-header question-bank__table-header--status">
                    Trạng thái
                  </th>
                  <th className="question-bank__table-header question-bank__table-header--action">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="question-bank__table-body">
                {questions.map((q) => {
                  const isUsed = usedIdsSet.has(Number(q.id));
                  const isSelected = selectedIds.has(q.id);

                  return (
                    <tr
                      key={q.id}
                      className={`question-bank__table-row ${
                        isUsed ? "question-bank__table-row--used" : ""
                      } ${isSelected ? "question-bank__table-row--selected" : ""}`}
                    >
                      <td className="question-bank__table-cell">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleQuestion(q.id)}
                          className="question-bank__checkbox"
                          disabled={isUsed}
                        />
                      </td>
                      <td className="question-bank__table-cell question-bank__table-cell--id">
                        {q.id}
                      </td>
                      <td className="question-bank__table-cell question-bank__table-cell--part">
                        Part {q.part}
                      </td>
                      <td className="question-bank__table-cell question-bank__table-cell--content">
                        <div className="question-bank__content-preview">
                          {isGroupPart
                            ? (q.content || "Chưa có nội dung").substring(0, 100)
                            : (q.detail || "Chưa có nội dung").substring(0, 100)}
                          {((isGroupPart ? q.content : q.detail) || "").length > 100 && "..."}
                        </div>
                      </td>
                      {isGroupPart && (
                        <td className="question-bank__table-cell question-bank__table-cell--count">
                          {q.questions?.length || 0}
                        </td>
                      )}
                      <td className="question-bank__table-cell question-bank__table-cell--status">
                        {isUsed ? (
                          <span className="question-bank__status question-bank__status--used">
                            <IoMdCheckmarkCircle /> Đã dùng
                          </span>
                        ) : (
                          <span className="question-bank__status question-bank__status--available">
                            Có thể dùng
                          </span>
                        )}
                      </td>
                      <td className="question-bank__table-cell">
                        <button
                          className="question-bank__info-btn"
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
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Footer Actions */}
        <div className="question-bank__footer">
          <span className="question-bank__footer-text">
            Đã chọn: <strong>{selectedIds.size}</strong> {isGroupPart ? "nhóm" : "câu hỏi"}
          </span>
          <div className="question-bank__footer-actions">
            <button
              onClick={onClose}
              className="question-bank__footer-btn question-bank__footer-btn--cancel"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              disabled={selectedIds.size === 0 || submitting}
              onClick={handleAddSelectedQuestions}
              className="question-bank__footer-btn question-bank__footer-btn--submit"
            >
              {submitting
                ? "Đang thêm..."
                : `Thêm ${selectedIds.size} ${isGroupPart ? "nhóm" : "câu hỏi"} đã chọn`}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modals */}
      {!isGroupPart && (
        <PreviewToeicQuestion
          open={showPreviewModal}
          onClose={handleClosePreview}
          question={previewQuestion}
        />
      )}

      {isGroupPart && (
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