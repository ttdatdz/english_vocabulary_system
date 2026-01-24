import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table, Spin } from "antd";
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import "./DisorderExamDetailPage.scss";
import { get } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";

/**
 * Trang chi tiết đề thi Disorder
 * - Hiển thị thông tin đề (tên, số câu, thời gian)
 * - Hiển thị bảng lịch sử các lần thi
 * - Nút làm bài thi
 */
export default function DisorderExamDetailPage() {
    const { examId } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [examInfo, setExamInfo] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);

    // ==================== LOAD DATA ====================

    useEffect(() => {
        loadExamInfo();
        loadExamResults();
    }, [examId]);

    const loadExamInfo = async () => {
        setLoading(true);
        try {
            const res = await get(`/api/disorder-exam/${examId}`, true);
            if (res) {
                setExamInfo({
                    id: res.id,
                    title: res.title || "Đề thi tự do",
                    duration: res.duration || 60,
                    totalQuestions: res.totalQuestions || 0,
                });
            }
        } catch (err) {
            console.error("Load exam info error:", err);
            showErrorMessage("Không thể tải thông tin đề thi");
        } finally {
            setLoading(false);
        }
    };

    const loadExamResults = async () => {
        setLoadingResults(true);
        try {
            const res = await get(`/api/exam/result/getAllByExam/${examId}`, true);
            if (res) {
                // Map data với key cho table
                const resultsWithKey = res.map((item, index) => ({
                    ...item,
                    key: item.reviewId || index,
                    stt: index + 1,
                }));
                setExamResults(resultsWithKey);
            }
        } catch (err) {
            console.error("Load exam results error:", err);
            // Không show error vì user có thể chưa có kết quả nào
        } finally {
            setLoadingResults(false);
        }
    };

    // ==================== HANDLERS ====================

    const handleStartExam = () => {
        navigate(`/disorder-exam/${examId}/practice`);
    };

    const handleViewReview = (reviewId) => {
        navigate(`/disorder-exam/${examId}/review/${reviewId}`);
    };

    const handleBack = () => {
        navigate("/ToeicTests");
    };

    // ==================== FORMAT HELPERS ====================

    const formatDuration = (seconds) => {
        if (!seconds) return "--:--";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ==================== TABLE COLUMNS ====================

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
        },
        {
            title: "Điểm",
            key: "score",
            width: 100,
            align: "center",
            render: (_, record) => (
                <span className="score-cell">
                    {record.correctAnswers}/{record.totalQuestions}
                </span>
            ),
            sorter: (a, b) => a.correctAnswers - b.correctAnswers,
        },
        {
            title: "Thời gian làm",
            key: "duration",
            width: 120,
            align: "center",
            render: (_, record) => formatDuration(record.duration),
            sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
        },
        {
            title: "Ngày thi",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            align: "center",
            render: (text) => formatDate(text),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: "descend",
        },
        {
            title: "",
            key: "action",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Button
                    type="link"
                    className="view-detail-btn"
                    onClick={() => handleViewReview(record.reviewId)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    // ==================== RENDER ====================

    if (loading) {
        return (
            <div className="disorder-detail disorder-detail--loading">
                <Spin size="large" />
                <p>Đang tải thông tin đề thi...</p>
            </div>
        );
    }

    return (
        <div className="disorder-detail">
            {/* Header */}
            <div className="disorder-detail__header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    className="back-btn"
                >
                    Quay lại
                </Button>
            </div>

            <div className="disorder-detail__content">
                {/* Exam Info Card */}
                <div className="exam-info-card">
                    <h1 className="exam-info-card__title">
                        {examInfo?.title || "Đề thi tự do"}
                    </h1>

                    <div className="exam-info-card__stats">
                        <div className="stat-item">
                            <FileTextOutlined className="stat-item__icon" />
                            <div className="stat-item__content">
                                <span className="stat-item__value">{examInfo?.totalQuestions || 0}</span>
                                <span className="stat-item__label">Câu hỏi</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <ClockCircleOutlined className="stat-item__icon" />
                            <div className="stat-item__content">
                                <span className="stat-item__value">{examInfo?.duration || 60}</span>
                                <span className="stat-item__label">Phút</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStartExam}
                        className="start-exam-btn"
                        disabled={!examInfo?.totalQuestions}
                    >
                        Làm bài thi
                    </Button>

                    {!examInfo?.totalQuestions && (
                        <p className="no-questions-warning">
                            Đề thi chưa có câu hỏi. Vui lòng thêm câu hỏi trước khi làm bài.
                        </p>
                    )}
                </div>

                {/* Results History */}
                <div className="results-section">
                    <h2 className="results-section__title">Lịch sử làm bài</h2>

                    {loadingResults ? (
                        <div className="results-section__loading">
                            <Spin />
                        </div>
                    ) : examResults.length === 0 ? (
                        <div className="results-section__empty">
                            <p>Bạn chưa có lần thi nào cho đề này.</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={examResults}
                            pagination={{
                                pageSize: 5,
                                showSizeChanger: false,
                                showTotal: (total) => `Tổng ${total} lần thi`,
                            }}
                            className="results-table"
                            size="middle"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}