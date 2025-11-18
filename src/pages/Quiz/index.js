import { HiMiniSpeakerWave } from "react-icons/hi2";
import "./Quiz.scss";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";
import { Button, Modal } from "antd";
import CardFillText from "../../components/CardFillText";
import CardQuiz from "../../components/CardQuiz";
import { useEffect, useState } from "react";
import { getByFlashCard } from "../../services/Vocab/vocabService";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { showErrorMessage, showWaringMessage } from "../../utils/alertHelper";
import { TiDelete } from "react-icons/ti";
import { FaCheckCircle } from "react-icons/fa";

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flashcardId, topicId } = useParams();
  const [cardsList, setCardsList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersStatus, setAnswersStatus] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (location.state && location.state.cards) {
      setCardsList(location.state.cards);
      return;
    }
    const fetchCards = async () => {
      try {
        const res = await getByFlashCard(flashcardId);
        if (res) setCardsList(res);
      } catch (err) {
        showErrorMessage("Failed to fetch cards:", err);
      }
    };
    fetchCards();
  }, [location.state, flashcardId]);

  useEffect(() => {
    if (!cardsList) {
      setQuestions([]);
      setCurrentIndex(0);
      return;
    }

    let pairs = [];

    if (
      cardsList.listCardResponse &&
      Array.isArray(cardsList.listCardResponse)
    ) {
      const responses = cardsList.listCardResponse || [];
      const choices = cardsList.listCardChoice || [];
      pairs = responses.map((resp, i) => ({
        response: resp,
        choice: choices[i] || null,
      }));
    } else if (Array.isArray(cardsList)) {
      pairs = cardsList.map((c) => ({
        response:
          Array.isArray(c.listCardResponse) && c.listCardResponse.length > 0
            ? c.listCardResponse[0]
            : c,
        choice:
          Array.isArray(c.listCardChoice) && c.listCardChoice.length > 0
            ? c.listCardChoice[0]
            : null,
      }));
    } else {
      setQuestions([]);
      setCurrentIndex(0);
      return;
    }

    const doubled = [];
    pairs.forEach((p) => {
      if (p.choice) doubled.push({ _qType: "quiz", payload: p.choice });
      if (p.response) doubled.push({ _qType: "fill", payload: p.response });
    });

    // shuffle
    for (let i = doubled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
    }

    setQuestions(doubled);
    setCurrentIndex(0);
    setAnswersStatus(Array(doubled.length).fill(null));
  }, [cardsList]);

  const handleAnswer = (payload) => {
    setAnswersStatus((prev) => {
      const next = [...prev];
      next[currentIndex] = payload;
      return next;
    });

    if (payload.result === "correct") {
      if (currentIndex + 1 < questions.length) {
        setTimeout(() => setCurrentIndex((ci) => ci + 1), 800);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 === questions.length) {
      const allAnswered = answersStatus.every((a) => a !== null);
      if (!allAnswered) {
        showWaringMessage(
          "Bạn chưa hoàn thành tất cả câu hỏi. Vui lòng trả lời hết các câu trước khi hoàn thành."
        );
        return;
      }
      setShowResultModal(true);
    } else {
      setCurrentIndex((ci) => ci + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((ci) => (ci > 0 ? ci - 1 : ci));
  };

  const correctCount = answersStatus.filter(
    (a) => a?.result === "correct"
  ).length;
  const incorrectCount = answersStatus.filter(
    (a) => a && a.result === "incorrect"
  ).length;

  const handleRetryIncorrect = () => {
    const incorrectQs = questions.filter(
      (_, idx) => answersStatus[idx]?.result === "incorrect"
    );
    if (incorrectQs.length === 0) return;
    setQuestions(incorrectQs);
    setAnswersStatus(Array(incorrectQs.length).fill(null));
    setCurrentIndex(0);
    setShowResultModal(false);
  };

  const handleBackToPractice = () => {
    setShowResultModal(false);
    navigate(
      `/VocabularyTopics/DetailTopic/${topicId}/DetailListFlashCard/${flashcardId}`
    );
  };

  return (
    <div className="MainContainer">
      <div className="Quiz">
        <div className="Quiz__left">
          <div className="Quiz__left-content">
            {questions && questions.length > 0 ? (
              questions[currentIndex]._qType === "quiz" ? (
                <CardQuiz
                  data={questions[currentIndex].payload}
                  index={currentIndex}
                  status={answersStatus[currentIndex] ?? null}
                  onAnswer={handleAnswer}
                />
              ) : (
                <CardFillText
                  data={questions[currentIndex].payload}
                  status={answersStatus[currentIndex] ?? null}
                  onResult={handleAnswer}
                />
              )
            ) : (
              <div>Không có câu hỏi</div>
            )}
          </div>

          <div className="Quiz__footer">
            <button className="Quiz__btn Quiz__btn--prev" onClick={handlePrev}>
              <MdOutlineSkipPrevious className="Quiz__icon" />
              Câu trước
            </button>

            <button className="Quiz__btn Quiz__btn--next" onClick={handleNext}>
              {currentIndex + 1 === questions.length ? "Hoàn thành" : "Câu sau"}
              <MdOutlineSkipNext className="Quiz__icon Quiz__icon--next" />
            </button>
          </div>
        </div>

        <div className="Quiz__right">
          <div className="Quiz__question-list">
            <h3>Danh sách câu hỏi:</h3>
            <div className="Quiz__number-list">
              {questions.map((q, idx) => {
                const stat = answersStatus[idx];
                const cls =
                  stat && stat.result === "correct"
                    ? " answered-correct"
                    : stat && stat.result === "incorrect"
                    ? " answered-incorrect"
                    : "";
                return (
                  <button
                    key={idx}
                    className={`Quiz__number-item${
                      idx === currentIndex ? " active" : ""
                    }${cls}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal kết quả */}
      <Modal
        title="Kết quả luyện tập"
        open={showResultModal}
        footer={null}
        onCancel={() => setShowResultModal(false)}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "40px",
              fontSize: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaCheckCircle style={{ fontSize: "20px", color: "green" }} />
              <span>
                Số câu đúng: {correctCount}/{questions.length}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TiDelete style={{ fontSize: "26px", color: "red" }} />
              <span>
                Số câu sai: {incorrectCount}/{questions.length}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 25,
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {incorrectCount > 0 && (
              <Button
                className="OptionForm__button"
                onClick={handleRetryIncorrect}
              >
                Làm lại những câu sai
              </Button>
            )}
            <Button
              className="OptionForm__button"
              onClick={handleBackToPractice}
            >
              Quay về trang luyện tập
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
