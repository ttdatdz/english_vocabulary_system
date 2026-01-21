import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Tabs, Card, Button, Radio, message } from "antd";
import { get, post } from "../../utils/request";
import "./PracticeExam.scss";
import { confirmBasic } from "../../utils/alertHelper";

const { TabPane } = Tabs;

const SS_KEY = "PracticeExam:init";

/** Guard rời trang: reload, Back/Forward, click Link nội bộ */
function useNavigationGuard(when, dialogText) {
  const pushedRef = useRef(false);
  const ignoringPopRef = useRef(false);

  useEffect(() => {
    if (!when) return;

    if (!pushedRef.current) {
      try {
        window.history.pushState({ __GUARD__: true }, "", window.location.href);
        pushedRef.current = true;
      } catch { }
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      if (ignoringPopRef.current) {
        ignoringPopRef.current = false;
        return;
      }
      const ok = window.confirm(dialogText);
      if (!ok) {
        ignoringPopRef.current = true;
        window.history.go(1);
      }
    };

    const handleClickCapture = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank") return;

      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin) {
        const ok = window.confirm(dialogText);
        if (!ok) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [when, dialogText]);
}

export default function PracticeExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId } = useParams();

  // ===== Safe state + fallback =====
  const navState = useMemo(() => {
    const st = location.state && typeof location.state === "object" ? location.state : null;
    if (st) {
      try { sessionStorage.setItem(SS_KEY, JSON.stringify(st)); } catch { }
      return st;
    }
    try {
      const saved = sessionStorage.getItem(SS_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return {};
  }, [location.state]);

  const selectedParts = Array.isArray(navState.selectedParts) ? navState.selectedParts : [];
  const practiceTime = Number.isFinite(navState.practiceTime) ? navState.practiceTime : 45;
  const mode = typeof navState.mode === "string" ? navState.mode : "practice";

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(practiceTime * 60);
  const [activeTab, setActiveTab] = useState("1");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [pendingScrollIndex, setPendingScrollIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // toggle hiện/ẩn nút pudding
  const [showBackTop, setShowBackTop] = useState(false);

  const timerRef = useRef();
  const questionRefs = {};

  // Pudding button visibility
  useEffect(() => {
    const target = window;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.pageYOffset || document.documentElement.scrollTop || 0;
          setShowBackTop(y > 280);
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  /**
   * Load questions từ API mới
   * - questions: Single questions (Part 1, 2, 5)
   * - groupQuestions: Group questions (Part 3, 4, 6, 7) với child questions
   */
  const loadQuestions = async () => {
    const data = await get(`api/exam/detail/${examId}`);
    if (!data) return;
    console.log("Exam data:", data);

    let allQuestions = [];

    // 1. Single questions (Part 1, 2, 5) - không thuộc group
    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach(q => {
        allQuestions.push({
          ...q,
          // Không có group info
          groupId: null,
          groupContent: null,
          groupQuestionRange: null,
          groupImages: null,
          groupAudios: null
        });
      });
    }

    // 2. Group questions (Part 3, 4, 6, 7) - flatten các child questions
    if (data.groupQuestions && Array.isArray(data.groupQuestions)) {
      data.groupQuestions.forEach(group => {
        if (group.questions && Array.isArray(group.questions)) {
          group.questions.forEach(q => {
            allQuestions.push({
              ...q,
              // Attach group info vào mỗi câu hỏi con
              groupId: group.id,
              groupContent: group.content,
              groupQuestionRange: group.questionRange,
              groupImages: group.images || [],
              groupAudios: group.audios || []
            });
          });
        }
      });
    }

    // Sort theo indexNumber
    allQuestions.sort((a, b) => (a.indexNumber || 0) - (b.indexNumber || 0));

    // Filter theo selected parts
    const filtered = selectedParts.length
      ? allQuestions.filter(q => selectedParts.includes(Number(q.part)))
      : allQuestions;

    setQuestions(filtered);

    // Set active tab to first available part
    if (filtered.length > 0) {
      const firstPart = filtered[0].part;
      setActiveTab(String(firstPart));
    }
  };

  /**
   * Group questions để hiển thị
   * - Single questions: mỗi câu là 1 group riêng
   * - Group questions: các câu cùng groupId gộp lại
   */
  const groupQuestionsForDisplay = () => {
    const grouped = {};

    questions.forEach(q => {
      const part = q.part;
      if (!grouped[part]) grouped[part] = {};

      // Key: groupId nếu có, hoặc single-{indexNumber}
      const key = q.groupId ? `group-${q.groupId}` : `single-${q.indexNumber}`;

      if (!grouped[part][key]) {
        grouped[part][key] = {
          groupId: q.groupId,
          groupContent: q.groupContent,
          groupImages: q.groupImages,
          groupAudios: q.groupAudios,
          questions: []
        };
      }
      grouped[part][key].questions.push(q);
    });

    // Sort questions trong mỗi group theo indexNumber
    Object.values(grouped).forEach(partGroups => {
      Object.values(partGroups).forEach(group => {
        group.questions.sort((a, b) => (a.indexNumber || 0) - (b.indexNumber || 0));
      });
    });

    return grouped;
  };

  const handleSelect = (id, answer) => setAnswers((p) => ({ ...p, [id]: answer }));

  const handleSubmit = async (force = false) => {
    const check = force ? true : await confirmBasic("Dừng làm bài thi?");
    if (!check) return;

    // ---- TÍNH 70%: chỉ tính câu có thể trả lời ----
    const answerable = questions.filter(
      (q) => Array.isArray(q.options) && q.options.length > 0
    );
    const answeredCount = answerable.reduce(
      (acc, q) => acc + (answers[q.id] != null ? 1 : 0),
      0
    );
    const total = answerable.length;
    const minRequired = Math.ceil(0.7 * total);

    // Chỉ chặn khi người dùng tự nộp (force === false)
    if (!force && total > 0 && answeredCount < minRequired) {
      const parts = (Array.isArray(selectedParts) && selectedParts.length)
        ? ` (Phần ${selectedParts.join(",")})` : "";
      message.error(
        `Bạn cần trả lời ít nhất ${minRequired}/${total} câu${parts} trước khi nộp bài!`
      );
      return;
    }
    // -----------------------------------------------

    const usedTime = Math.max(0, practiceTime * 60 - timeLeft);
    const result = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? null,
    }));

    const payload = {
      examID: examId,
      answers: result,
      selectedPart: (Array.isArray(selectedParts) ? selectedParts.join(",") : ""),
      duration: usedTime,
    };

    const response = await post(payload, "api/exam/submit", true);
    if (response) {
      message.success("Đã nộp bài!");
      setIsSubmitted(true);
      navigate(`/DetailExam/${examId}/ResultExam/${response.reviewId}`);
    }
  };

  const scrollToQuestion = (index) => {
    const el = questionRefs[index];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => { loadQuestions(); }, [examId]); // eslint-disable-line

  // timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          message.warning("Hết giờ! Bài sẽ được nộp.");
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll pending to question
  useEffect(() => {
    if (pendingScrollIndex !== null) {
      setTimeout(() => {
        scrollToQuestion(pendingScrollIndex);
        setPendingScrollIndex(null);
      }, 100);
    }
  }, [pendingScrollIndex]);

  // Activate guard (until submitted)
  useNavigationGuard(
    !isSubmitted,
    "Bạn đang làm bài thi. Nếu rời trang, bài làm sẽ bị mất. Bạn có chắc muốn rời trang không?"
  );

  const grouped = groupQuestionsForDisplay();

  /**
   * Render media cho group (images + audios)
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
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
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
   * Render media cho single question
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
    <div className="PracticeExam">
      <div className="PracticeExam__header">
        <div className="MainContainer">
          <h2 className="PracticeExam__title">Luyện thi TOEIC</h2>
          <p className="PracticeExam__timer">⏳ Còn lại: {formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="MainContainer">
        <div className="PracticeExam__content">
          <div className="PracticeExam__content-left">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {Object.entries(grouped).map(([part, groups]) => {
                const isScrollableImage = part === "7" || part === "6";

                return (
                  <TabPane tab={`Part ${part}`} key={part}>
                    {Object.entries(groups).map(([groupKey, groupData]) => {
                      const { groupId, questions: groupQuestions } = groupData;
                      const isGroup = !!groupId;

                      return (
                        <Card key={groupKey} className="ReviewExam__questionGroup">
                          {/* Render group media nếu là group question */}
                          {isGroup && renderGroupMedia(groupData, isScrollableImage)}

                          {/* Render từng câu hỏi trong group */}
                          {groupQuestions.map((q) => (
                            <Card
                              key={q.indexNumber}
                              title={`Câu ${q.indexNumber}`}
                              className="ReviewExam__questionCard"
                              ref={(el) => (questionRefs[q.indexNumber] = el)}
                            >
                              {/* Single question media (nếu không phải group) */}
                              {!isGroup && renderSingleMedia(q)}

                              {/* Question detail */}
                              {q.detail && <p className="q-detail">{q.detail}</p>}

                              {/* Options */}
                              <Radio.Group
                                value={answers[q.id]}
                                onChange={(e) => handleSelect(q.id, e.target.value)}
                              >
                                {q.options && q.options.map((opt) => (
                                  <Radio key={opt.mark} value={opt.mark}>
                                    <span className="opt-mark">{opt.mark}.</span> {opt.detail}
                                  </Radio>
                                ))}
                              </Radio.Group>
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
            <Button type="primary" onClick={() => handleSubmit(false)} className="btn btn-primary">
              Nộp bài
            </Button>
            {Object.entries(grouped).map(([part, groups]) => (
              <div key={part}>
                <h4 className="PracticeExam__title-part">Part {part}</h4>
                {Object.values(groups)
                  .flatMap(g => g.questions)
                  .map((q) => (
                    <Button
                      key={q.id}
                      className={`PracticeExam__btnQuestion ${activeQuestionIndex === q.indexNumber ? "active" : ""
                        } ${answers[q.id] ? "answered" : ""}`}
                      onClick={() => {
                        setActiveTab(String(part));
                        setActiveQuestionIndex(q.indexNumber);
                        setPendingScrollIndex(q.indexNumber);
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

      {/* Nút "pudding" giữa đáy */}
      {showBackTop && (
        <button
          className="PracticeExam__pudding"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Cuộn lên đầu trang"
          title="Cuộn lên đầu trang"
        >
          <svg className="PracticeExam__puddingIcon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Về đầu trang</span>
        </button>
      )}
    </div>
  );
}