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

    /**
     * Xác định Part dựa trên indexNumber (TOEIC standard)
     */
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
            if (data) {
                console.log("Review data:", data);
                setReviewExam(data);
            }
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

    /**
     * Group questions để hiển thị
     * - Sử dụng groupId từ QuestionReviewResponse
     * - Single questions (không có groupId): mỗi câu là 1 group riêng
     * - Group questions: các câu cùng groupId gộp lại
     */
    const groupQuestionsForDisplay = () => {
        const grouped = {};

        reviewExam.questionReviews.forEach((q) => {
            // Xác định part từ indexNumber hoặc từ field part
            const part = q.part ? Number(q.part) : getPart(q.indexNumber);
            if (!allowedParts.includes(part)) return;

            if (!grouped[part]) grouped[part] = {};

            // Key: groupId nếu có, hoặc single-{indexNumber}
            const groupKey = q.groupId ? `group-${q.groupId}` : `single-${q.indexNumber}`;

            if (!grouped[part][groupKey]) {
                grouped[part][groupKey] = {
                    groupId: q.groupId,
                    groupContent: q.groupContent,
                    groupQuestionRange: q.groupQuestionRange,
                    groupImages: q.groupImages || [],
                    groupAudios: q.groupAudios || [],
                    questions: []
                };
            }
            grouped[part][groupKey].questions.push(q);
        });

        // Sort questions trong mỗi group theo indexNumber
        Object.values(grouped).forEach(partGroups => {
            Object.values(partGroups).forEach(group => {
                group.questions.sort((a, b) => (a.indexNumber || 0) - (b.indexNumber || 0));
            });
        });

        return grouped;
    };

    const grouped = groupQuestionsForDisplay();

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

    /**
     * Render media cho group (images + audios + content)
     */
    const renderGroupMedia = (groupData, isScrollableImage = false) => {
        const { groupImages, groupAudios, groupContent } = groupData;
        const hasMedia = (groupImages && groupImages.length > 0) ||
            (groupAudios && groupAudios.length > 0) ||
            groupContent;

        if (!hasMedia) return null;

        return (
            <div className={`ReviewExam__groupMedia ${isScrollableImage ? 'scrollable' : ''}`}>
                {/* Group Content (passage/conversation) */}
                {groupContent && (
                    <div className="ReviewExam__groupContent">
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                            {groupContent}
                        </pre>
                    </div>
                )}

                {/* Group Images */}
                {groupImages && groupImages.length > 0 && (
                    <div className={isScrollableImage ? "ReviewExam__imageWrapper--scrollable" : "ReviewExam__imageWrapper"}>
                        {groupImages.map((imgUrl, idx) => (
                            <img
                                key={idx}
                                src={imgUrl}
                                alt={`group-img-${idx}`}
                                className={`ReviewExam__image ${isScrollableImage ? 'scrollable' : ''}`}
                            />
                        ))}
                    </div>
                )}

                {/* Group Audios */}
                {groupAudios && groupAudios.length > 0 && (
                    <div className="ReviewExam__audioWrapper">
                        {groupAudios.map((audioUrl, idx) => (
                            <audio key={idx} controls src={audioUrl} style={{ marginTop: 10, width: '100%' }} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render media cho single question (images + audio riêng của câu)
     */
    const renderSingleMedia = (question) => {
        const hasMedia = (question.images && question.images.length > 0) || question.audio;
        if (!hasMedia) return null;

        return (
            <div className="ReviewExam__questionMedia">
                {question.images && question.images.length > 0 && (
                    <div className="ReviewExam__imageWrapper">
                        {question.images.map((imgUrl, idx) => (
                            <img key={idx} src={imgUrl} alt={`q-img-${idx}`} className="ReviewExam__image" />
                        ))}
                    </div>
                )}
                {question.audio && (
                    <audio controls src={question.audio} style={{ marginTop: 10, width: '100%' }} />
                )}
            </div>
        );
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
                                const isScrollableImage = part === "7" || part === "6";

                                return (
                                    <TabPane tab={`Part ${part}`} key={part}>
                                        {Object.entries(groups).map(([groupKey, groupData]) => {
                                            const { groupId, questions: groupQuestions } = groupData;
                                            const isGroup = !!groupId;

                                            return (
                                                <Card
                                                    key={groupKey}
                                                    className="ReviewExam__questionGroup"
                                                    style={{ marginBottom: 24 }}
                                                >
                                                    {/* Render group media nếu là group question */}
                                                    {isGroup && renderGroupMedia(groupData, isScrollableImage)}

                                                    {/* Render từng câu hỏi trong group */}
                                                    {groupQuestions.map((q) => (
                                                        <Card
                                                            key={q.indexNumber}
                                                            title={`Câu ${q.indexNumber}`}
                                                            className="ReviewExam__questionCard"
                                                            ref={(el) => (questionRefs[q.indexNumber] = el)}
                                                            style={{ marginBottom: 16 }}
                                                        >
                                                            {/* Single question media (nếu không phải group) */}
                                                            {!isGroup && renderSingleMedia(q)}

                                                            {/* Question detail */}
                                                            {q.detail && <p className="q-detail">{q.detail}</p>}

                                                            {/* Options với highlight đúng/sai */}
                                                            <div className="ReviewExam__options">
                                                                {q.options && q.options.map((opt) => {
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

                                                            {/* Clarify/Giải thích (nếu có) */}
                                                            {q.clarify && (
                                                                <div className="ReviewExam__clarify">
                                                                    <strong>Giải thích:</strong>
                                                                    <p>{q.clarify}</p>
                                                                </div>
                                                            )}
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
                                    .flatMap(g => g.questions)
                                    .map((q) => {
                                        // Xác định trạng thái của câu hỏi
                                        let statusClass = "";
                                        if (q.userAnswer === null) {
                                            statusClass = "skipped";
                                        } else if (q.isCorrect) {
                                            statusClass = "correct";
                                        } else {
                                            statusClass = "incorrect";
                                        }

                                        return (
                                            <Button
                                                key={q.indexNumber}
                                                className={`NumBtn ${activeQuestionIndex === q.indexNumber ? "active" : ""} ${statusClass}`}
                                                onClick={() => {
                                                    setActiveTab(String(part));
                                                    setActiveQuestionIndex(q.indexNumber);
                                                    setPendingScrollIndex(q.indexNumber);
                                                    setTimeout(() => scrollToQuestion(q.indexNumber), 80);
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