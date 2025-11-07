import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Card, Button } from "antd";
import "./ReviewExam.scss";
import { get } from "../../utils/request";

const { TabPane } = Tabs;

export default function ReviewExam() {
    const { examReviewId } = useParams();
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
            const data = await get(`api/exam/result/id/${examReviewId}`);
            if (data) setReviewExam(data);
        };
        loadReviewExam();
    }, [examReviewId]);

    const scrollToQuestion = (index) => {
        const el = questionRefs[index];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const parseAllowedParts = (section) => {
        if (!section || section === "Toàn bộ") return [1, 2, 3, 4, 5, 6, 7];
        return section
            .split(",")
            .map((s) => s.trim().match(/\d+/))
            .filter(Boolean)
            .map((match) => parseInt(match[0], 10));
    };

    if (!reviewExam) return null;

    const allowedParts = parseAllowedParts(reviewExam?.section);

    const grouped = {};
    reviewExam.questionReviews.forEach((q) => {
        const part = getPart(q.indexNumber);
        if (!allowedParts.includes(part)) return;
        const groupKey = q.conversation || `single-${q.indexNumber}`;
        if (!grouped[part]) grouped[part] = {};
        if (!grouped[part][groupKey]) grouped[part][groupKey] = [];
        grouped[part][groupKey].push(q);
    });

    const accuracy =
        reviewExam.totalQuestions > 0
            ? Math.round((reviewExam.correctAnswers / reviewExam.totalQuestions) * 100)
            : 0;

    const formatDuration = (sec) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="ReviewExam">
            {/* Header gradient + summary */}
            <div className="ReviewExam__hero">
                <div className="MainContainer ReviewExam__hero-inner">
                    <div className="ReviewExam__titleBlock">
                        <h2 className="ReviewExam__title">
                            {reviewExam.examTitle} <span>- Xem lại bài làm</span>
                        </h2>
                        <div className="ReviewExam__meta">
                            <span className="chip">Phần: {reviewExam.section || "Toàn bộ"}</span>
                            <span className="chip">Thời gian: {formatDuration(reviewExam.duration)}</span>
                            <span className="chip score">
                                Điểm: {reviewExam.correctAnswers}/{reviewExam.totalQuestions}
                            </span>
                        </div>
                    </div>

                    {/* Progress accuracy */}
                    <div className="ReviewExam__progress">
                        <div className="ReviewExam__progress-bar">
                            <div
                                className="ReviewExam__progress-fill"
                                style={{ width: `${accuracy}%` }}
                            />
                        </div>
                        <div className="ReviewExam__progress-text">{accuracy}% chính xác</div>
                    </div>
                </div>
            </div>

            <div className="MainContainer">
                <div className="PracticeExam__content">
                    <div className="PracticeExam__content-left">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            className="ReviewExam__tabs"
                        >
                            {Object.entries(grouped).map(([part, groups]) => {
                                const isScrollableImage = part === "7";
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
                                                        <div
                                                            className={
                                                                isScrollableImage
                                                                    ? "ReviewExam__imageWrapper--scrollable"
                                                                    : "ReviewExam__imageWrapper"
                                                            }
                                                        >
                                                            {sharedImage && (
                                                                <img
                                                                    src={sharedImage}
                                                                    alt="group"
                                                                    className={`ReviewExam__image ${isScrollableImage ? "scrollable" : ""
                                                                        }`}
                                                                />
                                                            )}
                                                            {sharedAudio && (
                                                                <audio controls src={sharedAudio} style={{ marginTop: 10 }} />
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
                                                            {q.detail && <p className="q-detail">{q.detail}</p>}
                                                            <div className="ReviewExam__options">
                                                                {q.options.map((opt) => {
                                                                    const isUser =
                                                                        q.userAnswer !== null && opt.mark === q.userAnswer;
                                                                    const isCorrect = opt.mark === q.correctAnswer;
                                                                    const cls = isCorrect
                                                                        ? "correct"
                                                                        : isUser
                                                                            ? "incorrect"
                                                                            : "neutral";
                                                                    return (
                                                                        <div key={opt.mark} className={`ReviewExam__option ${cls}`}>
                                                                            <span className="opt-mark">{opt.mark}.</span>
                                                                            <span className="opt-text">{opt.detail}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
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

                    <div className="PracticeExam__content-right ReviewExam__side">
                        <div className="StatCard">
                            <div className="StatCard__item ok">
                                <div className="num">{reviewExam.correctAnswers}</div>
                                <div className="label">Đúng</div>
                            </div>
                            <div className="StatCard__item wrong">
                                <div className="num">{reviewExam.incorrectAnswers}</div>
                                <div className="label">Sai</div>
                            </div>
                            <div className="StatCard__item skip">
                                <div className="num">{reviewExam.nullAnswers}</div>
                                <div className="label">Bỏ qua</div>
                            </div>
                        </div>

                        {Object.entries(grouped).map(([part, groups]) => (
                            <div key={part} className="SidePart">
                                <h4 className="PracticeExam__title-part">Part {part}</h4>
                                {Object.values(groups)
                                    .flat()
                                    .map((q) => (
                                        <Button
                                            key={q.indexNumber}
                                            className={`NumBtn ${activeQuestionIndex === q.indexNumber ? "active" : ""} ${q.userAnswer !== null ? "answered" : ""
                                                }`}
                                            onClick={() => {
                                                setActiveTab(String(part));
                                                setActiveQuestionIndex(q.indexNumber);
                                                setPendingScrollIndex(q.indexNumber);
                                                setTimeout(() => scrollToQuestion(q.indexNumber), 80);
                                            }}
                                        >
                                            {q.indexNumber}
                                        </Button>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
