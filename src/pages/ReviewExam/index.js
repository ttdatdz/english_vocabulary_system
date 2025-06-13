import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Card, Button } from "antd";
import "./ReviewExam.scss";
import { get } from "../../utils/request";

const { TabPane } = Tabs;

export default function ReviewExam() {
    const { reviewExamId } = useParams();
    const [reviewExam, setReviewExam] = useState(null);
    const [activeTab, setActiveTab] = useState("1");
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
    const [pendingScrollIndex, setPendingScrollIndex] = useState(null);
    const questionRefs = {};

    const getPart = (index) => {
        if (index <= 6) return 1;
        if (index <= 31) return 2;
        if (index <= 70) return 3;
        if (index <= 100) return 4;
        if (index <= 130) return 5;
        if (index <= 146) return 6;
        return 7;
    };

    useEffect(() => {
        const loadReviewExam = async () => {
            const data = await get(`api/exam/result/id/18`);
            if (data) setReviewExam(data);
        };
        loadReviewExam();
    }, [reviewExamId]);

    const scrollToQuestion = (index) => {
        const el = questionRefs[index];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    useEffect(() => {
        if (pendingScrollIndex !== null) {
            setTimeout(() => {
                scrollToQuestion(pendingScrollIndex);
                setPendingScrollIndex(null);
            }, 120);
        }
    }, [pendingScrollIndex]);

    const formatDuration = (sec) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    if (!reviewExam) return null;

    const grouped = {};
    reviewExam.questionReviews.forEach((q) => {
        const part = getPart(q.indexNumber);
        const groupKey = q.conversation || `single-${q.indexNumber}`;
        if (!grouped[part]) grouped[part] = {};
        if (!grouped[part][groupKey]) grouped[part][groupKey] = [];
        grouped[part][groupKey].push(q);
    });

    return (
        <div className="ReviewExam">
            <div className="ReviewExam__header">
                <div className="MainContainer">
                    <h2 className="ReviewExam__header-title">
                        {reviewExam.examTitle} - Xem lại bài làm
                    </h2>
                </div>
            </div>

            <div className="MainContainer">
                <div className="PracticeExam__content">
                    <div className="PracticeExam__content-left">
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                            {Object.entries(grouped).map(([part, groups]) => {
                                const isScrollableImage = part === "7"; // chỉ Part 7 scroll ảnh
                                return (
                                    <TabPane tab={`Part ${part}`} key={part}>
                                        {Object.values(groups).map((group, idx) => {
                                            const firstQuestion = group[0];
                                            const sharedImage = firstQuestion.image;
                                            const sharedAudio = firstQuestion.audio;

                                            return (
                                                <Card
                                                    key={`group-${idx}`}
                                                    className="ReviewExam__questionGroup"
                                                    style={{ marginBottom: 24 }}
                                                >
                                                    {(sharedImage || sharedAudio) && (
                                                        <div className={isScrollableImage ? "ReviewExam__imageWrapper--scrollable" : "ReviewExam__imageWrapper"}>
                                                            {sharedImage && (
                                                                <img
                                                                    src={sharedImage}
                                                                    alt="group"
                                                                    className={`ReviewExam__image ${isScrollableImage ? "scrollable" : ""}`}
                                                                />
                                                            )}
                                                            {sharedAudio && (
                                                                <audio
                                                                    controls
                                                                    src={sharedAudio}
                                                                    style={{ marginTop: 10 }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {group.map((q) => (
                                                        <Card
                                                            key={q.indexNumber}
                                                            title={`Câu ${q.indexNumber}`}
                                                            className="ReviewExam__questionCard"
                                                            ref={(el) => (questionRefs[q.indexNumber] = el)}
                                                            style={{ marginBottom: 16 }}
                                                        >
                                                            {q.detail && <p>{q.detail}</p>}
                                                            {q.options.map((opt) => {
                                                                const isUser =q.userAnswer !== null && opt.mark === q.userAnswer;
                                                                const isCorrect = opt.mark === q.correctAnswer;
                                                                const className = isCorrect
                                                                    ? "correct"
                                                                    : isUser
                                                                        ? "incorrect"
                                                                        : "";
                                                                return (
                                                                    <div key={opt.mark} className={`ReviewExam__option ${className}`}>
                                                                        <strong>{opt.mark}. </strong> {opt.detail}
                                                                        {isCorrect && " ✅"}
                                                                        {isUser && !isCorrect && " ❌"}
                                                                    </div>
                                                                );
                                                            })}
                                                        </Card>
                                                    ))}
                                                </Card>
                                            );
                                        })}
                                    </TabPane>
                                );
                            })}

                        </Tabs>
                    </div>

                    <div className="PracticeExam__content-right">
                        <p className="PracticeExam__practiceTime">
                            Thời gian làm bài: <strong>{formatDuration(reviewExam.duration)}</strong>
                        </p>
                        <p className="PracticeExam__note">
                            Kết quả: {reviewExam.correctAnswers}/{reviewExam.totalQuestions}
                        </p>
                        <p className="PracticeExam__note" style={{ color: "red" }}>
                            Câu sai: {reviewExam.incorrectAnswers}
                        </p>
                        <p className="PracticeExam__note" style={{ color: "blue" }}>
                            Bỏ qua: {reviewExam.nullAnswers}
                        </p>
                        {Object.entries(grouped).map(([part, groups]) => (
                            <div key={part}>
                                <h4 className="PracticeExam__title-part">Part {part}</h4>
                                {Object.values(groups).flat().map((q) => {
                                    return (
                                        <Button
                                            key={q.indexNumber}
                                            className={`PracticeExam__btnQuestion ${activeQuestionIndex === q.indexNumber ? "answered" : ""}`}
                                            onClick={() => {
                                                setActiveTab(String(part));
                                                setActiveQuestionIndex(q.indexNumber);
                                                setPendingScrollIndex(q.indexNumber);
                                            }}
                                        >
                                            {q.indexNumber}
                                        </Button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
