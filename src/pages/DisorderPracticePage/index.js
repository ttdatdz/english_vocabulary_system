import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Radio, Spin, Modal, Progress } from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    MenuOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import "./DisorderPracticePage.scss";
import { get } from "../../utils/request";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

/**
 * Trang làm bài cho đề thi Disorder (isRandom = true)
 * UI: Background trắng, điểm nhấn cam sáng, không gradient
 */
export default function DisorderPracticePage() {
    const { examId } = useParams();
    const navigate = useNavigate();

    // Exam data
    const [examTitle, setExamTitle] = useState("");
    const [examDuration, setExamDuration] = useState(60);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Practice state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    // Timer & Sidebar
    const [timerActive, setTimerActive] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ==================== LOAD DATA ====================

    useEffect(() => {
        loadExamDetail();
    }, [examId]);

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
            }
        } catch (err) {
            console.error("Load exam error:", err);
            showErrorMessage("Không thể tải đề thi");
        } finally {
            setLoading(false);
        }
    };

    // ==================== TIMER ====================

    useEffect(() => {
        if (!timerActive || timeLeft <= 0) return;

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
    }, [timerActive]);

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
        if (isSubmitting) return;

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
            let correct = 0;
            const details = flatQuestions.map((q) => {
                const userAnswer = answers[q.questionId] || null;
                const isCorrect = userAnswer === q.result;
                if (isCorrect) correct++;
                return {
                    questionId: q.questionId,
                    userAnswer,
                    correctAnswer: q.result,
                    isCorrect,
                    clarify: q.clarify,
                };
            });

            setResult({
                correct,
                total: totalQuestions,
                percentage: Math.round((correct / totalQuestions) * 100),
                timeTaken: (examDuration * 60) - timeLeft,
                details,
            });

            setShowResult(true);
            showSuccess("Nộp bài thành công!");
        } catch (err) {
            console.error("Submit error:", err);
            showErrorMessage("Nộp bài thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==================== RENDER ====================

    if (loading) {
        return (
            <div className="disorder-practice disorder-practice--loading">
                <Spin size="large" />
                <p>Đang tải đề thi...</p>
            </div>
        );
    }

    if (showResult && result) {
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
                            strokeColor={result.percentage >= 70 ? "#52c41a" : result.percentage >= 50 ? "#fa8c16" : "#ff4d4f"}
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
                        <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        <Button type="primary" onClick={() => {
                            setShowResult(false);
                            setCurrentIndex(0);
                        }}>
                            Xem đáp án
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="disorder-practice">
            {/* HEADER */}
            <div className="disorder-practice__header">
                <div className="header-left">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="back-btn"
                    >
                        Thoát
                    </Button>
                    <h2 className="exam-title">{examTitle}</h2>
                </div>
                <div className="header-right">
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
                                    >
                                        {currentQuestion.options.map((opt, idx) => (
                                            <Radio key={idx} value={opt.mark} className="option-item">
                                                <span className="option-item__mark">{opt.mark}.</span>
                                                <span className="option-item__detail">{opt.detail}</span>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </div>

                                {/* Result after submit */}
                                {showResult && result && (
                                    <div className="question__result">
                                        {(() => {
                                            const detail = result.details.find(d => d.questionId === currentQuestion.questionId);
                                            return (
                                                <>
                                                    <div className={`result-status ${detail?.isCorrect ? "result-status--correct" : "result-status--incorrect"}`}>
                                                        {detail?.isCorrect ? "✓ Đúng" : "✗ Sai"}
                                                    </div>
                                                    <div className="result-answer">
                                                        Đáp án đúng: <strong>{detail?.correctAnswer}</strong>
                                                    </div>
                                                    {currentQuestion.clarify && (
                                                        <div className="result-clarify">
                                                            <strong>Giải thích:</strong> {currentQuestion.clarify}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
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
                            <span className="sidebar__progress">
                                {getAnsweredCount()}/{totalQuestions}
                            </span>
                        </div>
                        <div className="sidebar__grid">
                            {flatQuestions.map((q, idx) => {
                                const isAnswered = answers[q.questionId] != null;
                                const isCurrent = idx === currentIndex;
                                let resultClass = "";
                                if (showResult && result) {
                                    const detail = result.details.find(d => d.questionId === q.questionId);
                                    resultClass = detail?.isCorrect ? "item--correct" : "item--incorrect";
                                }
                                return (
                                    <button
                                        key={q.questionId}
                                        className={`sidebar__item ${isCurrent ? "item--current" : ""} ${isAnswered ? "item--answered" : ""} ${resultClass}`}
                                        onClick={() => handleJumpTo(idx)}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="sidebar__legend">
                            <div className="legend-item">
                                <span className="legend-dot legend-dot--answered"></span>
                                <span>Đã trả lời</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot"></span>
                                <span>Chưa trả lời</span>
                            </div>
                            {showResult && (
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