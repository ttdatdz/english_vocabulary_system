import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, Card, Button, Divider } from "antd";
import "./ReviewExam.scss";

const { TabPane } = Tabs;

export default function ReviewExam() {
    const location = useLocation();
    const {
        examTitle,
        createdAt,
        duration,
        correctAnswers,
        totalQuestions,
        questionReviews = [],
    } = location.state || {};

    const getPart = (index) => {
        if (index <= 6) return 1;
        if (index <= 31) return 2;
        if (index <= 70) return 3;
        if (index <= 100) return 4;
        if (index <= 130) return 5;
        if (index <= 146) return 6;
        return 7;
    };

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
    const [pendingScrollIndex, setPendingScrollIndex] = useState(null);

    const grouped = {};
    const questionRefs = {};
    questionReviews.forEach((q) => {
        const part = getPart(q.indexNumber);
        if (!grouped[part]) grouped[part] = [];
        grouped[part].push(q);
    });

    const [activeTab, setActiveTab] = useState("1");

    const scrollToQuestion = (index) => {
        const el = questionRefs[index];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    useEffect(() => {
        if (pendingScrollIndex !== null) {
            setTimeout(() => {
                scrollToQuestion(pendingScrollIndex);
                setPendingScrollIndex(null);
            }, 120); // delay để DOM kịp render
        }
    }, [pendingScrollIndex]);

    const formatDuration = (sec) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="ReviewExam">
            <div className="ReviewExam__header">
                <div className="MainContainer">
                    <h2 className="ReviewExam__header-title">{examTitle} - Xem lại bài làm</h2>
                </div>
            </div>

            <div className="MainContainer">
                <div className="PracticeExam__content">
                    <div className="PracticeExam__content-left">
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                            {Object.keys(grouped).map((part) => (
                                <TabPane tab={`Part ${part}`} key={part}>
                                    {grouped[part].map((q) => (
                                        <div ref={(el) => (questionRefs[q.indexNumber] = el)}>
                                            <Card
                                                key={q.indexNumber}
                                                title={`Câu ${q.indexNumber}`}
                                                ref={(el) => (questionRefs[q.indexNumber] = el)}
                                                className="ReviewExam__questionCard"
                                            >
                                                {q.detail && <p>{q.detail}</p>}
                                                {q.image && (
                                                    <img
                                                        src={q.image}
                                                        alt="img"
                                                        style={{ maxWidth: "100%", marginBottom: 8 }}
                                                    />
                                                )}
                                                {q.audio && (
                                                    <audio controls src={q.audio} style={{ marginBottom: 10 }} />
                                                )}
                                                {q.options.map((opt) => {
                                                    const isUser = opt.mark === q.userAnswer;
                                                    const isCorrect = opt.mark === q.correctAnswer;
                                                    const className = isCorrect
                                                        ? "correct"
                                                        : isUser
                                                            ? "incorrect"
                                                            : "";
                                                    return (
                                                        <div
                                                            key={opt.mark}
                                                            className={`ReviewExam__option ${className}`}
                                                        >
                                                            <strong>{opt.mark}. </strong> {opt.detail}
                                                            {isCorrect && " ✅"}
                                                            {isUser && !isCorrect && " ❌"}
                                                        </div>
                                                    );
                                                })}
                                            </Card>
                                        </div>
                                    ))}
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>

                    <div className="PracticeExam__content-right" >
                        <p className="PracticeExam__practiceTime">
                            Thời gian làm bài: <strong>{formatDuration(duration)}</strong>
                        </p>
                        <p className="PracticeExam__note">
                            Kết quả: {correctAnswers}/{totalQuestions}
                        </p>
                        {Object.entries(grouped).map(([part, questions]) => (
                            <div key={part}>
                                <h4 className="PracticeExam__title-part">Part {part}</h4>
                                {questions.map((q) => {
                                    const isCorrect = q.userAnswer === q.correctAnswer;
                                    const isAnswered = q.userAnswer !== null;
                                    return (
                                        <Button
                                            key={q.indexNumber}
                                            className={`PracticeExam__btnQuestion ${activeQuestionIndex === q.indexNumber ? "answered" : ""
                                                }`}
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
