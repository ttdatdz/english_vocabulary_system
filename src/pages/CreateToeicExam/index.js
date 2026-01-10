import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateToeicExam.scss";
import CanvasExamGuide from "../../canvas/CanvasExamGuide";
import cloudSave from "../../assets/images/check.png";
import { post, get, del, put } from "../../utils/request";
import { useLocation } from "react-router-dom";
import { showSuccess } from "../../utils/alertHelper";


const defaultParts = [
    { id: 1, label: "Part 1", questionCount: 0 },
    { id: 2, label: "Part 2", questionCount: 0 },
    { id: 3, label: "Part 3", questionCount: 0 },
    { id: 4, label: "Part 4", questionCount: 0 },
    { id: 5, label: "Part 5", questionCount: 0 },
    { id: 6, label: "Part 6", questionCount: 0 },
    { id: 7, label: "Part 7", questionCount: 0 },
];

export default function CreateToeicExam() {
    const [duration, setDuration] = useState(120);
    const [parts, setParts] = useState(defaultParts);

    // Khởi tạo mặc định để tránh lỗi khi render trước khi API trả về
    const [data, setData] = useState({ id: null, title: "New Toeic Exam" }); // id đề thi vừa tạo
    const [isCreating, setIsCreating] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
    const [fadeOut, setFadeOut] = useState(false);
    const [overlay, setOverlay] = useState({ open: false, text: "" });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


    // Lưu lại giá trị đã lưu gần nhất để so sánh, tránh gọi API trùng
    const lastSavedRef = useRef({
        name: "New Toeic Exam",
        durationMinutes: 120,
    });

    const navigate = useNavigate();
    const location = useLocation();

    // ===== 1. Tạo draft exam ngay khi vào trang =====
    useEffect(() => {
        const STORAGE_KEY = "toeic:draftExam";

        const boot = async () => {
            const raw = localStorage.getItem(STORAGE_KEY);

            // Nếu đã có draft => dùng lại (không tạo mới)
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed?.id) {
                        setData({ id: parsed.id, title: parsed.title || "New Toeic Exam" });
                        lastSavedRef.current = {
                            name: parsed.title || "New Toeic Exam",
                            durationMinutes: duration,
                        };

                        await fetchExamDataAndUpdateParts(parsed.id);
                        return;
                    }
                } catch (err) {
                    console.warn("Invalid draft in localStorage, removing", err);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }

            // Không có draft => tạo mới + overlay "Đang tạo đề thi" tối thiểu 1s
            try {
                setIsCreating(true);
                setOverlay({ open: true, text: "Đang tạo đề thi..." });

                const apiPromise = post(null, "/api/exam/create/draft", true);
                const min1sPromise = delay(1000);

                const res = await apiPromise;

                setData(res);

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ id: res.id, title: res.title || "New Toeic Exam" })
                );

                lastSavedRef.current = {
                    name: res.title || "New Toeic Exam",
                    durationMinutes: duration,
                };

                await fetchExamDataAndUpdateParts(res.id);

                // đảm bảo overlay hiển thị tối thiểu 1s
                await min1sPromise;
            } catch (error) {
                console.error("Create draft exam error: ", error);
                setSaveStatus("error");
            } finally {
                setOverlay({ open: false, text: "" });
                setIsCreating(false);
            }
        };

        boot();
        const handleVisibilityChange = () => {
            if (!document.hidden && data?.id) {
                fetchExamDataAndUpdateParts(data.id);
            }
        };

        const handleFocus = () => {
            if (data?.id) {
                fetchExamDataAndUpdateParts(data.id);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [data?.id]);

    // Refetch exam data when the user navigates back to this route (ensure counts stay in sync)
    useEffect(() => {
        if (location?.pathname === "/CreateToeicExam" && data?.id) {
            fetchExamDataAndUpdateParts(data.id);
        }
    }, [location?.pathname, data?.id]);


    // === Fetch exam data và cập nhật questionCount per part ===
    const fetchExamDataAndUpdateParts = async (examId) => {
        try {
            const examData = await get(`/api/exam/detail/${examId}`, true);

            // ✅ Tính số lượng câu hỏi từ cả questions và groupQuestions
            const questionCountByPart = {};

            // Đếm từ questions đơn lẻ
            (examData.questions || []).forEach((q) => {
                const partNum = String(q.part);
                questionCountByPart[partNum] = (questionCountByPart[partNum] || 0) + 1;
            });

            // ✅ Đếm thêm từ groupQuestions
            (examData.groupQuestions || []).forEach((group) => {
                const partNum = String(group.part);
                const groupQuestionCount = (group.questions || []).length;
                questionCountByPart[partNum] = (questionCountByPart[partNum] || 0) + groupQuestionCount;
            });

            // Cập nhật parts với questionCount
            setParts((prevParts) =>
                prevParts.map((p) => ({
                    ...p,
                    questionCount: questionCountByPart[String(p.id)] || 0,
                }))
            );

            window.__toeicExamData = examData;
        } catch (err) {
            console.error("Fetch exam data error", err);
        }
    };


    useEffect(() => {
        if (!data?.id) return; // chưa có data.id thì chưa lưu được

        // sử dụng optional chaining để tránh lỗi nếu data đang null/undefined
        const trimmedName = data.title.trim();
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
    }, [data?.title, duration, data?.id]);

    useEffect(() => {
        if (saveStatus === "saved") {
            // Delay 1s rồi bắt đầu fade-out
            const fadeTimer = setTimeout(() => {
                setFadeOut(true);
            }, 1000);

            // Sau khi fade xong (300ms), reset về idle
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

    // --- NEW: hành động dưới canvas: Xác nhận / Hủy ---
    const handleConfirmCanvas = () => {
        // Xoá draft local trong localStorage (khóa dùng ở CreateToeicExam)
        localStorage.removeItem("toeic:draftExam");
        // cập nhật state nếu cần
        setData((prev) => ({ ...prev }));
        setSaveStatus("idle");
        navigate("/ToeicTests");
    };

    const handleCancelCanvas = async () => {
        if (!window.confirm("Bạn chắc chắn muốn huỷ việc tạo đề thi?")) return;

        try {
            // đảm bảo overlay hiện tối thiểu 1s
            const min1sPromise = delay(1000);

            // gọi API xóa draft
            await del(`/api/exam/custom/${data.id}`, true);


            // dọn local + state
            localStorage.removeItem("toeic:draftExam");
            setData((prev) => ({ ...prev }));

            navigate("/ToeicTests");

            // chờ đủ 1s nếu API trả quá nhanh
            await min1sPromise;
            // showSuccess sau khi overlay đóng
            showSuccess("Xóa đề thi thành công!");
        } catch (err) {
            console.error("Cancel draft error", err);

            // cũng đảm bảo đóng overlay nếu lỗi
            setOverlay({ open: false, text: "" });

            alert("Huỷ draft thất bại, kiểm tra console.");
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
            // ✅ Truyền thêm groupQuestions
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
                    partGroups, // ✅ Thêm groups
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

    return (
        <>
            <div className="create-test">
                <div className="create-test__hero">
                    <div className="create-test__hero-left">
                        <h1 className="create-test__title">File</h1>
                        <input
                            className="create-test__title-input"
                            value={data.title}
                            onChange={(e) =>
                                setData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Nhập tên đề thi"
                            disabled={isCreating}
                        />
                        <p className="create-test__subtitle">
                            Thời gian:
                            <input
                                className="create-test__duration-input"
                                type="number"
                                min={1}
                                max={240}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                disabled={isCreating}
                            />
                            <span> phút</span>
                        </p>

                        <div className="create-test__hero-icon" data-tip="All changes saved">
                            <img src={cloudSave} alt="All changes saved" />
                        </div>


                        {/* Trạng thái lưu nhỏ nhỏ */}
                        <p className={`save-status ${fadeOut ? "fade-out" : ""}`}>
                            {isCreating && "Đang tạo đề nháp..."}
                            {!isCreating && saveStatus === "saving" && "Đang lưu thay đổi..."}
                            {!isCreating && saveStatus === "saved" && "Đã lưu tất cả thay đổi"}
                            {!isCreating && saveStatus === "error" && "Lưu thất bại, thử lại sau"}
                        </p>
                    </div>
                </div>

                {/* Parts list */}
                <div className="create-test__content">
                    <div className="create-test_parts">
                        {parts.map((part) => (
                            <button
                                key={part.id}
                                className="create-test__part-row"
                                onClick={() => handleSelectPart(part)}
                                disabled={!data.id} // chưa tạo xong exam thì không cho vào part
                            >
                                <div className="create-test__part-left">
                                    <div className="create-test__part-index">{part.id}</div>
                                    <div className="create-test__part-text">
                                        <span className="create-test__part-label">{part.label}</span>
                                        <span className="create-test__part-count">
                                            {" "}
                                            - {part.questionCount} Câu hỏi
                                        </span>
                                    </div>
                                </div>
                                <div className="create-test__part-info">
                                    <span className="create-test__info-icon">i</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="create-test_teaser">
                        <div className="create-test_teaser-card">
                            <div className="create-test_teaser-media">
                                <CanvasExamGuide />
                            </div>

                            <p className="create-test_teaser-note">
                                Tip: Bạn có thể lưu nháp và quay lại chỉnh sửa bất cứ lúc nào.
                            </p>
                        </div>
                        {/* Actions nằm trong teaser card, dính đáy card */}
                        <div className="create-test_teaser-actions" role="region" aria-label="Exam draft actions">
                            <button
                                type="button"
                                className="create-test__btn create-test__btn--confirm"
                                onClick={handleConfirmCanvas}
                                aria-label="Tạo đề"
                            >
                                Tạo đề
                            </button>
                            <button
                                type="button"
                                className="create-test__btn create-test__btn--cancel"
                                onClick={handleCancelCanvas}
                                aria-label="Hủy"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {overlay.open && (
                <div
                    style={{
                        position: "fixed",
                        top: 64, // chỉnh theo chiều cao menu của bạn
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
            )
            }
        </>
    )
}
