import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DetailToeicCustomExam.scss";
import CanvasExamGuide from "../../canvas/CanvasExamGuide";
import cloudSave from "../../assets/images/check.png";
import { get, del, put } from "../../utils/request";
import { useLocation } from "react-router-dom";
import { showSuccess, showErrorMessage } from "../../utils/alertHelper";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const defaultParts = [
    { id: 1, label: "Part 1", questionCount: 0 },
    { id: 2, label: "Part 2", questionCount: 0 },
    { id: 3, label: "Part 3", questionCount: 0 },
    { id: 4, label: "Part 4", questionCount: 0 },
    { id: 5, label: "Part 5", questionCount: 0 },
    { id: 6, label: "Part 6", questionCount: 0 },
    { id: 7, label: "Part 7", questionCount: 0 },
];

export default function DetailToeicCustomExam() {
    const { id } = useParams(); // Lấy id từ URL
    const [duration, setDuration] = useState(120);
    const [parts, setParts] = useState(defaultParts);
    const [data, setData] = useState({ id: null, title: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
    const [fadeOut, setFadeOut] = useState(false);
    const [overlay, setOverlay] = useState({ open: false, text: "" });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Lưu lại giá trị đã lưu gần nhất để so sánh, tránh gọi API trùng
    const lastSavedRef = useRef({
        name: "",
        durationMinutes: 120,
    });

    const navigate = useNavigate();
    const location = useLocation();

    // ===== 1. Load exam data khi vào trang =====
    useEffect(() => {
        const loadExamData = async () => {
            if (!id) {
                showErrorMessage("Không tìm thấy ID đề thi");
                navigate("/ToeicTests");
                return;
            }

            try {
                setIsLoading(true);
                const examData = await get(`/api/exam/detail/${id}`, true);

                if (!examData) {
                    showErrorMessage("Không tìm thấy đề thi");
                    navigate("/ToeicTests");
                    return;
                }

                // Set data
                setData({
                    id: examData.id,
                    title: examData.title || "Untitled Exam",
                });
                setDuration(examData.duration || 120);

                // Cập nhật lastSavedRef
                lastSavedRef.current = {
                    name: examData.title || "Untitled Exam",
                    durationMinutes: examData.duration || 120,
                };

                // Tính số lượng câu hỏi từng part
                updateQuestionCounts(examData);

                // Lưu vào window để dùng khi navigate
                window.__toeicExamData = examData;
            } catch (error) {
                console.error("Load exam data error:", error);
                showErrorMessage("Lỗi khi tải dữ liệu đề thi");
                navigate("/ToeicTests");
            } finally {
                setIsLoading(false);
            }
        };

        loadExamData();
    }, [id, navigate]);

    // Refetch khi quay lại trang
    useEffect(() => {
        if (location?.pathname?.includes("DetailCustomToeicExam") && id) {
            fetchExamDataAndUpdateParts(id);
        }
    }, [location?.pathname, id]);

    // Listen for visibility change and focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && id) {
                fetchExamDataAndUpdateParts(id);
            }
        };

        const handleFocus = () => {
            if (id) {
                fetchExamDataAndUpdateParts(id);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [id]);

    // === Fetch exam data và cập nhật questionCount per part ===
    const fetchExamDataAndUpdateParts = async (examId) => {
        try {
            const examData = await get(`/api/exam/detail/${examId}`, true);
            updateQuestionCounts(examData);
            window.__toeicExamData = examData;
        } catch (err) {
            console.error("Fetch exam data error", err);
        }
    };

    // === Tính và cập nhật số lượng câu hỏi từng part ===
    const updateQuestionCounts = (examData) => {
        const questionCountByPart = {};

        // Đếm từ questions đơn lẻ
        (examData.questions || []).forEach((q) => {
            const partNum = String(q.part);
            questionCountByPart[partNum] = (questionCountByPart[partNum] || 0) + 1;
        });

        // Đếm từ groupQuestions
        (examData.groupQuestions || []).forEach((group) => {
            const partNum = String(group.part);
            const groupQuestionCount = (group.questions || []).length;
            questionCountByPart[partNum] =
                (questionCountByPart[partNum] || 0) + groupQuestionCount;
        });

        // Cập nhật parts với questionCount
        setParts((prevParts) =>
            prevParts.map((p) => ({
                ...p,
                questionCount: questionCountByPart[String(p.id)] || 0,
            }))
        );
    };

    // ===== Auto-save khi thay đổi title hoặc duration =====
    useEffect(() => {
        if (!data?.id || isLoading) return;

        const trimmedName = data.title?.trim() || "";
        const safeDuration = Number(duration) || 0;

        // Không hợp lệ thì không gọi API
        if (!trimmedName || safeDuration <= 0) return;

        // Nếu không đổi gì so với lần lưu gần nhất thì thôi
        const hasChanges =
            trimmedName !== lastSavedRef.current.name ||
            safeDuration !== lastSavedRef.current.durationMinutes;

        if (!hasChanges) return;

        setSaveStatus("saving");

        const timeoutId = window.setTimeout(async () => {
            try {
                await put(`/api/exam/custom/${data.id}`, {
                    title: trimmedName,
                    duration: safeDuration,
                });

                lastSavedRef.current = {
                    name: trimmedName,
                    durationMinutes: safeDuration,
                };
                setSaveStatus("saved");
            } catch (error) {
                console.error("Update exam meta error: ", error);
                setSaveStatus("error");
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [data?.title, duration, data?.id, isLoading]);

    // Fade out animation cho save status
    useEffect(() => {
        if (saveStatus === "saved") {
            const fadeTimer = setTimeout(() => {
                setFadeOut(true);
            }, 1000);

            const resetTimer = setTimeout(() => {
                setSaveStatus("idle");
                setFadeOut(false);
            }, 1300);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(resetTimer);
            };
        }
    }, [saveStatus]);

    // --- Actions ---
    const handleSaveAndBack = () => {
        showSuccess("Đã lưu đề thi thành công!");
        navigate("/ToeicTests");
    };

    const handleDeleteExam = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa đề thi này?")) return;

        try {
            setOverlay({ open: true, text: "Đang xóa đề thi..." });
            const min1sPromise = delay(1000);

            await del(`/api/exam/custom/${data.id}`, true);

            await min1sPromise;
            setOverlay({ open: false, text: "" });

            showSuccess("Xóa đề thi thành công!");
            navigate("/ToeicTests");
        } catch (err) {
            console.error("Delete exam error", err);
            setOverlay({ open: false, text: "" });
            showErrorMessage("Xóa đề thi thất bại!");
        }
    };

    const handleSelectPart = (part) => {
        if (!data.id) return;

        const isGroupPart = part.id === 3 || part.id === 4 || part.id === 7;

        const examData = window.__toeicExamData || {};
        const partQuestions = (examData.questions || []).filter(
            (q) => String(q.part) === String(part.id)
        );

        if (isGroupPart) {
            const partGroups = (examData.groupQuestions || []).filter(
                (g) => String(g.part) === String(part.id)
            );

            navigate(`/PartDetailGroup/${data.id}/parts/${part.id}/group`, {
                state: {
                    examName: data.title,
                    durationMinutes: duration,
                    partLabel: part.label,
                    mode: "GROUP",
                    partQuestions,
                    partGroups,
                },
            });
        } else {
            navigate(`/PartDetail/${data.id}/parts/${part.id}/single`, {
                state: {
                    examName: data.title,
                    durationMinutes: duration,
                    partLabel: part.label,
                    mode: "SINGLE",
                    partQuestions,
                },
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="detail-custom-exam detail-custom-exam--loading">
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                    tip="Đang tải dữ liệu đề thi..."
                />
            </div>
        );
    }

    return (
        <>
            <div className="detail-custom-exam">
                <div className="detail-custom-exam__hero">
                    <div className="detail-custom-exam__hero-left">
                        <input
                            className="detail-custom-exam__title-input"
                            value={data.title}
                            onChange={(e) =>
                                setData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Nhập tên đề thi"
                        />
                        <p className="detail-custom-exam__subtitle">
                            Thời gian:
                            <input
                                className="detail-custom-exam__duration-input"
                                type="number"
                                min={1}
                                max={240}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <span> phút</span>
                        </p>

                        <div
                            className="detail-custom-exam__hero-icon"
                            data-tip="All changes saved"
                        >
                            <img src={cloudSave} alt="All changes saved" />
                        </div>
                    </div>

                    {/* Trạng thái lưu */}
                    <p className={`save-status ${fadeOut ? "fade-out" : ""}`}>
                        {saveStatus === "saving" && "Đang lưu thay đổi..."}
                        {saveStatus === "saved" && "Đã lưu tất cả thay đổi"}
                        {saveStatus === "error" && "Lưu thất bại, thử lại sau"}
                    </p>
                </div>

                {/* Parts list */}
                <div className="detail-custom-exam__content">
                    <div className="detail-custom-exam__parts">
                        {parts.map((part) => (
                            <button
                                key={part.id}
                                className="detail-custom-exam__part-row"
                                onClick={() => handleSelectPart(part)}
                            >
                                <div className="detail-custom-exam__part-left">
                                    <div className="detail-custom-exam__part-index">{part.id}</div>
                                    <div className="detail-custom-exam__part-text">
                                        <span className="detail-custom-exam__part-label">
                                            {part.label}
                                        </span>
                                        <span className="detail-custom-exam__part-count">
                                            {" "}{" "}
                                            {part.questionCount} Câu hỏi
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-custom-exam__part-info">
                                    <span className="detail-custom-exam__info-icon">i</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="detail-custom-exam__teaser">
                        <div className="detail-custom-exam__teaser-card">
                            <div className="detail-custom-exam__teaser-media">
                                <CanvasExamGuide />
                            </div>

                            <p className="detail-custom-exam__teaser-note">
                                Tip: Các thay đổi sẽ được tự động lưu khi bạn chỉnh sửa.
                            </p>
                        </div>

                        {/* Actions */}
                        <div
                            className="detail-custom-exam__teaser-actions"
                            role="region"
                            aria-label="Exam edit actions"
                        >
                            <button
                                type="button"
                                className="detail-custom-exam__btn detail-custom-exam__btn--confirm"
                                onClick={handleSaveAndBack}
                                aria-label="Lưu và quay lại"
                            >
                                Lưu và quay lại
                            </button>
                            <button
                                type="button"
                                className="detail-custom-exam__btn detail-custom-exam__btn--cancel"
                                onClick={handleDeleteExam}
                                aria-label="Xóa đề thi"
                            >
                                Xóa đề thi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {overlay.open && (
                <div
                    style={{
                        position: "fixed",
                        top: 64,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.35)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    <div
                        style={{
                            background: "#111827",
                            color: "white",
                            padding: "18px 22px",
                            borderRadius: 12,
                            minWidth: 360,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                            {overlay.text}
                        </div>
                        <div style={{ fontSize: 13, opacity: 0.85 }}>
                            Vui lòng đợi trong giây lát
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}