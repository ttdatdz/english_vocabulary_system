import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateToeicExam.scss";
import CanvasExamGuide from "../../canvas/CanvasExamGuide";
import cloudSave from "../../assets/images/check.png";

// import { post, put } from "../../utils/request"; // nếu bạn có utils riêng thì bật dòng này lên

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
    const [name, setName] = useState("New Toeic Exam");
    const [duration, setDuration] = useState(120);
    const [parts, setParts] = useState(defaultParts);

    const [examId, setExamId] = useState(null);      // id đề thi vừa tạo
    const [isCreating, setIsCreating] = useState(false);
    const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
    const [fadeOut, setFadeOut] = useState(false);

    // Lưu lại giá trị đã lưu gần nhất để so sánh, tránh gọi API trùng
    const lastSavedRef = useRef({
        name: "New Toeic Exam",
        durationMinutes: 120,
    });

    const navigate = useNavigate();

    // ===== 1. Tạo draft exam ngay khi vào trang =====
    useEffect(() => {
        const createDraftExam = async () => {
            try {
                setIsCreating(true);

                // TODO: gọi API thật ở đây
                // const res = await post("/api/exams", {
                //   name,
                //   durationMinutes: duration,
                //   parts: defaultParts,
                // });
                // setExamId(res.id);

                // demo tạm: giả lập có examId = 1
                const fakeResponse = { id: 1 };
                setExamId(fakeResponse.id);

                // set mốc đã lưu
                lastSavedRef.current = {
                    name,
                    durationMinutes: duration,
                };
            } catch (error) {
                console.error("Create draft exam error: ", error);
                setSaveStatus("error");
            } finally {
                setIsCreating(false);
            }
        };

        createDraftExam();
    }, []); // chỉ chạy 1 lần khi mount

    // ===== 2. Auto-save (debounce) khi name / duration đổi =====
    useEffect(() => {
        if (!examId) return; // chưa có examId thì chưa lưu được

        const trimmedName = name.trim();
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
                // TODO: gọi API update meta
                // await put(`/api/exams/${examId}`, {
                //   name: trimmedName,
                //   durationMinutes: safeDuration,
                // });

                // Nếu API thành công thì cập nhật mốc lastSaved
                lastSavedRef.current = {
                    name: trimmedName,
                    durationMinutes: safeDuration,
                };
                setSaveStatus("saved");
            } catch (error) {
                console.error("Update exam meta error: ", error);
                setSaveStatus("error");
            }
        }, 800); // 800ms sau khi user ngừng gõ

        return () => clearTimeout(timeoutId);
    }, [name, duration, examId]);

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


    const handleSelectPart = (part) => {
        // Sau này có thể dùng examId + part.id để điều hướng sang trang chi tiết part
        // ví dụ: navigate(`/admin/toeic/exams/${examId}/parts/${part.id}`);
        if (part.id == 1 || part.id == 2 || part.id == 4) {
            navigate("/PartDetail");
        }
    };

    return (
        <div className="create-test">
            <div className="create-test__hero">
                <div className="create-test__hero-left">
                    <h1 className="create-test__title">File</h1>
                    <input
                        className="create-test__title-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                            disabled={!examId} // chưa tạo xong exam thì không cho vào part
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
                </div>
            </div>
        </div>
    );
}
