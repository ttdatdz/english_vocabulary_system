import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Tabs, Card, Button, Radio, message } from "antd";
import { get, post } from "../../utils/request";
import "./PracticeExam.scss";
import { confirmBasic } from "../../utils/alertHelper";

const { TabPane } = Tabs;

export default function PracticeExam() {
  const location = useLocation();
  const navigate = useNavigate();

  const { examId } = useParams();
  const { selectedParts, practiceTime, mode } = location.state;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(practiceTime * 60); // seconds
  const [activeTab, setActiveTab] = useState("1");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [pendingScrollIndex, setPendingScrollIndex] = useState(null);

  const timerRef = useRef();
  const questionRefs = {};

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };


  const loadQuestions = async () => {
    const data = await get(`api/exam/detail/${examId}`);
    if (!data) return;
    const filtered = data.questions.filter((q) =>
      selectedParts.includes(Number(q.part))
    );
    console.log(selectedParts);
    setQuestions(filtered);
  };

  const groupQuestions = () => {
    const grouped = {};
    questions.forEach((q) => {
      const part = q.part;
      if (!grouped[part]) grouped[part] = {};
      const key = q.conversation || `single-${q.indexNumber}`;
      if (!grouped[part][key]) grouped[part][key] = [];
      grouped[part][key].push(q);
    });
    return grouped;
  };

  const handleSelect = (id, answer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  };


  const handleSubmit = async () => {
    const check =await confirmBasic("Dừng làm bài thi?");
    if (!check) return;
    const usedTime = Math.max(0, practiceTime * 60 - timeLeft);
    const result = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] ?? null
    }));

    const parts = selectedParts.join(", ");

    console.log(selectedParts);
    console.log(parts);

    if (mode === "practice" && result.filter(r => r.answer !== null).length < 0.7 * questions.length) {
      message.error(`Bạn cần trả lời ít nhất 70% số câu hỏi của các phần đã chọn (Phần ${parts}) để nộp bài!`);
      return;
    }
    const payload = {
      examID: examId,
      answers: result,
      selectedPart: parts,
      duration: usedTime,
    };
    const response = await post(payload, "api/exam/submit", true);
    if (response) {
      message.success("Đã nộp bài!");
      navigate(`/DetailExam/${examId}/ResultExam/${response.reviewId}`);
    }
  };

  const scrollToQuestion = (index) => {
    const el = questionRefs[index];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          message.warning("Hết giờ! Bài sẽ được nộp.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (pendingScrollIndex !== null) {
      setTimeout(() => {
        scrollToQuestion(pendingScrollIndex);
        setPendingScrollIndex(null);
      }, 100);
    }
  }, [pendingScrollIndex]);

  const grouped = groupQuestions();

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
              {Object.entries(grouped).map(([part, groups]) => (
                <TabPane tab={`Part ${part}`} key={part}>
                  {Object.values(groups).map((group, idx) => {

                    const first = group[0];
                    return (
                      <Card key={idx} className="ReviewExam__questionGroup">
                        {first.image && (
                          <img
                            src={first.image}
                            className="ReviewExam__image"
                            alt="group"
                          />
                        )}
                        {first.audio && (
                          <audio
                            controls
                            src={first.audio}
                            style={{ marginBottom: 10 }}
                          />
                        )}
                        {group.map((q) => (
                          <Card
                            key={q.indexNumber}
                            title={`Câu ${q.indexNumber}`}
                            className="ReviewExam__questionCard"
                            ref={(el) => (questionRefs[q.indexNumber] = el)}
                          >
                            <p>{q.detail}</p>
                            <Radio.Group
                              value={answers[q.id]}
                              onChange={(e) => handleSelect(q.id, e.target.value)}
                            >
                              {q.options.map((opt) => (
                                <Radio key={opt.mark} value={opt.mark}>
                                  {opt.detail}
                                </Radio>
                              ))}
                            </Radio.Group>

                          </Card>
                        ))}
                      </Card>
                    );
                  })}
                </TabPane>
              ))}
            </Tabs>
          </div>

          <div className="PracticeExam__content-right">
            <Button type="primary" onClick={handleSubmit}>
              Nộp bài
            </Button>
            {Object.entries(grouped).map(([part, groups]) => (
              <div key={part}>
                <h4 className="PracticeExam__title-part">Part {part}</h4>
                {Object.values(groups)
                  .flat()
                  .map((q) => {
                    return (
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

                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
