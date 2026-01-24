import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Radio, Spin, Modal, Progress } from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    MenuOutlined,
    CloseOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
} from "@ant-design/icons";
import "./DisorderPracticePage.scss";
import { get, post } from "../../utils/request";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

/**
 * Trang làm bài / xem đáp án cho đề thi Disorder
 * 
 * Modes:
 * - "practice": Làm bài thi (mặc định)
 * - "review": Xem đáp án (sau khi submit hoặc từ lịch sử)
 */
export default function DisorderPracticePage() {
    const { examId, reviewId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định mode dựa vào URL
    const isReviewMode = location.pathname.includes("/review/") && reviewId;

    // Exam data
    const [examTitle, setExamTitle] = useState("");
    const [examDuration, setExamDuration] = useState(60);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Practice state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    // Review state (from API)
    const [reviewData, setReviewData] = useState(null);

    // Timer & Sidebar
    const [timerActive, setTimerActive] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ==================== LOAD DATA ====================

    useEffect(() => {
        if (isReviewMode) {
            loadReviewData();
        } else {
            loadExamDetail();
        }
    }, [examId, reviewId, isReviewMode]);

    /**
     * Load exam detail for practice mode
     */
    const loadExamDetail = async () => {
        setLoading(true);
        try {
            const res = await get(`/api/disorder-exam/${examId}`, true);
            if (res) {
                setExamTitle(res.title || "Đề thi");
                setExamDuration(res.duration || 60);
                setTimeLeft((res.duration || 60) * 60);
                setItems(res.items || []);
                setTimerActive(true);
                setStartTime(Date.now());
            }
        } catch (err) {
            console.error("Load exam error:", err);
            showErrorMessage("Không thể tải đề thi");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load review data for review mode
     */
    const loadReviewData = async () => {
        setLoading(true);
        try {
            // Load review result
            const reviewRes = await get(`/api/exam/result/id/${reviewId}`, true);
            if (reviewRes) {
                setReviewData(reviewRes);
                setExamTitle(reviewRes.examTitle || "Đề thi");

                // Build answers map from review
                const answersMap = {};
                (reviewRes.questionReviews || []).forEach((qr) => {
                    if (qr.userAnswer) {
                        answersMap[qr.questionId] = qr.userAnswer;
                    }
                });
                setAnswers(answersMap);

                // Build result for display
                setResult({
                    correct: reviewRes.correctAnswers,
                    total: reviewRes.totalQuestions,
                    percentage: Math.round((reviewRes.correctAnswers / reviewRes.totalQuestions) * 100),
                    timeTaken: reviewRes.duration,
                    details: (reviewRes.questionReviews || []).map((qr) => ({
                        questionId: qr.questionId,
                        userAnswer: qr.userAnswer,
                        correctAnswer: qr.correctAnswer,
                        isCorrect: qr.correct,
                        clarify: qr.clarify,
                    })),
                });
            }

            // Load exam items for display
            const examRes = await get(`/api/disorder-exam/${examId}`, true);
            if (examRes) {
                setItems(examRes.items || []);
            }
        } catch (err) {
            console.error("Load review error:", err);
            showErrorMessage("Không thể tải dữ liệu bài làm");
        } finally {
            setLoading(false);
        }
    };

    // ==================== TIMER ====================

    useEffect(() => {
        if (!timerActive || timeLeft <= 0 || isReviewMode) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timerActive, isReviewMode]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // ==================== FLATTEN QUESTIONS ====================

    const flatQuestions = useMemo(() => {
        const result = [];
        items.forEach((item) => {
            if (item.type === "single") {
                result.push({
                    type: "single",
                    questionId: item.id,
                    detail: item.detail,
                    options: item.options || [],
                    images: item.images || [],
                    audio: item.audio,
                    result: item.result,
                    clarify: item.clarify,
                });
            } else if (item.type === "group") {
                (item.questions || []).forEach((q) => {
                    result.push({
                        type: "group-child",
                        questionId: q.id,
                        detail: q.detail,
                        options: q.options || [],
                        images: q.images || [],
                        audio: q.audio,
                        result: q.result,
                        clarify: q.clarify,
                        groupId: item.id,
                        groupTitle: item.title,
                        groupContent: item.content,
                        groupImages: item.groupImages || [],
                        groupAudios: item.groupAudios || [],
                    });
                });
            }
        });
        return result;
    }, [items]);

    const totalQuestions = flatQuestions.length;
    const currentQuestion = flatQuestions[currentIndex] || null;

    // ==================== NAVIGATION ====================

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleJumpTo = (index) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentIndex(index);
        }
    };

    // ==================== ANSWER ====================

    const handleSelectAnswer = (questionId, mark) => {
        // Không cho chọn trong review mode
        if (isReviewMode || showResult) return;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: mark,
        }));
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    // ==================== SUBMIT ====================

    const handleSubmit = async () => {
        if (isSubmitting || isReviewMode) return;

        const unanswered = totalQuestions - getAnsweredCount();
        if (unanswered > 0 && timeLeft > 0) {
            Modal.confirm({
                title: "Xác nhận nộp bài",
                content: `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
                okText: "Nộp bài",
                cancelText: "Tiếp tục làm",
                onOk: () => submitExam(),
            });
        } else {
            submitExam();
        }
    };

    const submitExam = async () => {
        setIsSubmitting(true);
        setTimerActive(false);

        try {
            // Tính thời gian làm bài
            const durationSeconds = startTime
                ? Math.floor((Date.now() - startTime) / 1000)
                : (examDuration * 60) - timeLeft;

            // Build request
            const submitRequest = {
                examID: parseInt(examId),
                selectedPart: "ALL",
                duration: durationSeconds,
                answers: flatQuestions.map((q) => ({
                    questionId: q.questionId,
                    answer: answers[q.questionId] || null,
                })),
            };

            // Call API
            const response = await post(submitRequest, "/api/exam/submit", true);

            if (response) {
                // Build result from API response
                setResult({
                    reviewId: response.reviewId,
                    correct: response.correctAnswers,
                    total: response.totalQuestions,
                    percentage: Math.round((response.correctAnswers / response.totalQuestions) * 100),
                    timeTaken: response.duration,
                    details: (response.questionReviews || []).map((qr) => ({
                        questionId: qr.questionId,
                        userAnswer: qr.userAnswer,
                        correctAnswer: qr.correctAnswer,
                        isCorrect: qr.correct,
                    })),
                });

                setShowResult(true);
                showSuccess("Nộp bài thành công!");
            }
        } catch (err) {
            console.error("Submit error:", err);
            showErrorMessage("Nộp bài thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==================== REVIEW HELPERS ====================

    /**
     * Lấy thông tin đáp án cho câu hỏi hiện tại
     */
    const getQuestionResult = (questionId) => {
        if (!result || !result.details) return null;
        return result.details.find((d) => d.questionId === questionId);
    };

    /**
     * Kiểm tra option có phải đáp án đúng không
     */
    const isCorrectOption = (questionId, mark) => {
        const qResult = getQuestionResult(questionId);
        return qResult && qResult.correctAnswer === mark;
    };

    /**
     * Kiểm tra option có phải đáp án user chọn không
     */
    const isUserSelectedOption = (questionId, mark) => {
        return answers[questionId] === mark;
    };

    /**
     * Lấy class cho option trong review mode
     */
    const getOptionClass = (questionId, mark) => {
        if (!isReviewMode && !showResult) return "";

        const isCorrect = isCorrectOption(questionId, mark);
        const isSelected = isUserSelectedOption(questionId, mark);

        if (isCorrect && isSelected) return "option--correct-selected";
        if (isCorrect) return "option--correct";
        if (isSelected) return "option--incorrect-selected";
        return "";
    };

    // ==================== RENDER ====================

    if (loading) {
        return (
            <div className="disorder-practice disorder-practice--loading">
                <Spin size="large" />
                <p>Đang tải {isReviewMode ? "bài làm" : "đề thi"}...</p>
            </div>
        );
    }

    // Result screen after submit (not in review mode from history)
    if (showResult && result && !isReviewMode) {
        return (
            <div className="disorder-practice disorder-practice--result">
                <div className="result-card">
                    <h1 className="result-card__title">Kết quả làm bài</h1>
                    <div className="result-card__score">
                        <Progress
                            type="circle"
                            percent={result.percentage}
                            format={() => `${result.correct}/${result.total}`}
                            size={140}
                            strokeColor={
                                result.percentage >= 70 ? "#52c41a"
                                    : result.percentage >= 50 ? "#fa8c16"
                                        : "#ff4d4f"
                            }
                        />
                    </div>
                    <div className="result-card__stats">
                        <div className="stat-item">
                            <span className="stat-item__label">Số câu đúng</span>
                            <span className="stat-item__value">{result.correct}/{result.total}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__label">Thời gian làm bài</span>
                            <span className="stat-item__value">{formatTime(result.timeTaken)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-item__label">Tỷ lệ đúng</span>
                            <span className="stat-item__value">{result.percentage}%</span>
                        </div>
                    </div>
                    <div className="result-card__actions">
                        <Button onClick={() => navigate(`/disorder-exam/${examId}/detail`)}>
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                // Chuyển sang review mode với reviewId
                                if (result.reviewId) {
                                    navigate(`/disorder-exam/${examId}/review/${result.reviewId}`);
                                }
                            }}
                        >
                            Xem đáp án
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`disorder-practice ${isReviewMode ? "disorder-practice--review" : ""}`}>
            {/* HEADER */}
            <div className="disorder-practice__header">
                <div className="header-left">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(`/disorder-exam/${examId}/detail`)}
                        className="back-btn"
                    >
                        {isReviewMode ? "Quay lại" : "Thoát"}
                    </Button>
                    <h2 className="exam-title">{examTitle}</h2>
                    {isReviewMode && (
                        <span className="review-badge">Xem đáp án</span>
                    )}
                </div>
                <div className="header-right">
                    {!isReviewMode && (
                        <>
                            <div className={`timer ${timeLeft < 300 ? "timer--warning" : ""}`}>
                                <ClockCircleOutlined />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                className="submit-btn"
                            >
                                Nộp bài
                            </Button>
                        </>
                    )}
                    <Button
                        type="text"
                        icon={sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="toggle-sidebar-btn"
                    />
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="disorder-practice__body">
                {/* Question Panel */}
                <div className={`question-panel ${!sidebarOpen ? "question-panel--full" : ""}`}>
                    {currentQuestion && (
                        <>
                            {/* Group info */}
                            {currentQuestion.type === "group-child" && (
                                <div className="group-info">
                                    <div className="group-info__title">{currentQuestion.groupTitle}</div>
                                    {currentQuestion.groupContent && (
                                        <div className="group-info__content">
                                            <pre>{currentQuestion.groupContent}</pre>
                                        </div>
                                    )}
                                    {currentQuestion.groupAudios?.length > 0 && (
                                        <div className="group-info__audios">
                                            {currentQuestion.groupAudios.map((url, idx) => (
                                                <audio key={idx} src={url} controls />
                                            ))}
                                        </div>
                                    )}
                                    {currentQuestion.groupImages?.length > 0 && (
                                        <div className="group-info__images">
                                            {currentQuestion.groupImages.map((url, idx) => (
                                                <img key={idx} src={url} alt={`group-img-${idx}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Question */}
                            <div className="question">
                                <div className="question__header">
                                    <span className="question__number">Câu {currentIndex + 1}</span>
                                    {currentQuestion.type === "group-child" && (
                                        <span className="question__badge">Nhóm</span>
                                    )}
                                </div>

                                <div className="question__detail">{currentQuestion.detail}</div>

                                {currentQuestion.audio && (
                                    <div className="question__audio">
                                        <audio src={currentQuestion.audio} controls />
                                    </div>
                                )}

                                {currentQuestion.images?.length > 0 && (
                                    <div className="question__images">
                                        {currentQuestion.images.map((url, idx) => (
                                            <img key={idx} src={url} alt={`q-img-${idx}`} />
                                        ))}
                                    </div>
                                )}

                                {/* Options */}
                                <div className="question__options">
                                    <Radio.Group
                                        value={answers[currentQuestion.questionId] || null}
                                        onChange={(e) => handleSelectAnswer(currentQuestion.questionId, e.target.value)}
                                        disabled={isReviewMode || showResult}
                                    >
                                        {currentQuestion.options.map((opt, idx) => {
                                            const optionClass = getOptionClass(currentQuestion.questionId, opt.mark);
                                            const isCorrect = isCorrectOption(currentQuestion.questionId, opt.mark);
                                            const isSelected = isUserSelectedOption(currentQuestion.questionId, opt.mark);

                                            return (
                                                <Radio
                                                    key={idx}
                                                    value={opt.mark}
                                                    className={`option-item ${optionClass}`}
                                                >
                                                    <span className="option-item__mark">{opt.mark}.</span>
                                                    <span className="option-item__detail">{opt.detail}</span>

                                                    {/* Icons for review mode */}
                                                    {(isReviewMode || showResult) && isCorrect && (
                                                        <CheckCircleFilled className="option-item__icon option-item__icon--correct" />
                                                    )}
                                                    {(isReviewMode || showResult) && isSelected && !isCorrect && (
                                                        <CloseCircleFilled className="option-item__icon option-item__icon--incorrect" />
                                                    )}
                                                </Radio>
                                            );
                                        })}
                                    </Radio.Group>
                                </div>

                                {/* Clarify (explanation) in review mode */}
                                {(isReviewMode || showResult) && currentQuestion.clarify && (
                                    <div className="question__clarify">
                                        <strong>Giải thích:</strong> {currentQuestion.clarify}
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="question-nav">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                >
                                    Câu trước
                                </Button>
                                <span className="question-nav__progress">
                                    {currentIndex + 1} / {totalQuestions}
                                </span>
                                <Button
                                    icon={<ArrowRightOutlined />}
                                    onClick={handleNext}
                                    disabled={currentIndex === totalQuestions - 1}
                                >
                                    Câu sau
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar - Question Map */}
                {sidebarOpen && (
                    <div className="sidebar">
                        <div className="sidebar__header">
                            <span>Danh sách câu hỏi</span>
                            {!isReviewMode && (
                                <span className="sidebar__progress">
                                    {getAnsweredCount()}/{totalQuestions}
                                </span>
                            )}
                            {isReviewMode && result && (
                                <span className="sidebar__progress">
                                    {result.correct}/{result.total}
                                </span>
                            )}
                        </div>
                        <div className="sidebar__grid">
                            {flatQuestions.map((q, idx) => {
                                const isAnswered = answers[q.questionId] != null;
                                const isCurrent = idx === currentIndex;

                                let resultClass = "";
                                if (isReviewMode || showResult) {
                                    const qResult = getQuestionResult(q.questionId);
                                    resultClass = qResult?.isCorrect ? "item--correct" : "item--incorrect";
                                }

                                return (
                                    <button
                                        key={q.questionId}
                                        className={`sidebar__item ${isCurrent ? "item--current" : ""} ${!isReviewMode && !showResult && isAnswered ? "item--answered" : ""} ${resultClass}`}
                                        onClick={() => handleJumpTo(idx)}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="sidebar__legend">
                            {!isReviewMode && !showResult && (
                                <>
                                    <div className="legend-item">
                                        <span className="legend-dot legend-dot--answered"></span>
                                        <span>Đã trả lời</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot"></span>
                                        <span>Chưa trả lời</span>
                                    </div>
                                </>
                            )}
                            {(isReviewMode || showResult) && (
                                <>
                                    <div className="legend-item">
                                        <span className="legend-dot legend-dot--correct"></span>
                                        <span>Đúng</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-dot legend-dot--incorrect"></span>
                                        <span>Sai</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}