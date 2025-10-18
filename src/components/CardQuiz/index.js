import React from "react";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import "./CardQuiz.scss";

export default function CardQuiz(props) {
  const { data, status = null, onAnswer, autoNext } = props;
  const [selected, setSelected] = React.useState(null);
  const [isLocked, setIsLocked] = React.useState(false);

  const correctAnswer =
    typeof data.answer === "string" ? data.answer.trim().toLowerCase() : "";

  React.useEffect(() => {
    if (status) {
      setSelected(status.selected);
      setIsLocked(true);
    } else {
      setSelected(null);
      setIsLocked(false);
    }
  }, [status]);

  const handlePronounceClick = () => {
    if (data?.audio) {
      const audio = new Audio(data.audio);
      audio.crossOrigin = "anonymous";
      audio.play().catch(() => {
        const u = new SpeechSynthesisUtterance(data.terminology || "");
        u.lang = "en-US";
        speechSynthesis.speak(u);
      });
    } else if (data?.terminology) {
      const u = new SpeechSynthesisUtterance(data.terminology);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    }
  };

  const clickAnswer = (optionText) => {
    if (isLocked || !optionText) return;

    const selectedValue = optionText.trim().toLowerCase();
    const isCorrect = selectedValue === correctAnswer;

    setSelected(optionText);
    setIsLocked(true);

    // Gửi kết quả lên parent
    onAnswer &&
      onAnswer({
        result: isCorrect ? "correct" : "incorrect",
        selected: optionText,
      });

    // Nếu đúng → tự động qua câu kế tiếp
    if (isCorrect && typeof autoNext === "function") {
      setTimeout(() => autoNext(), 500);
    }
  };

  const getBtnClass = (text) => {
    const value = text.trim().toLowerCase();
    if (!selected) return "";

    if (value === correctAnswer) return "CardQuiz__answer--success";
    if (value === selected.trim().toLowerCase() && value !== correctAnswer)
      return "CardQuiz__answer--error";

    return "";
  };

  return (
    <div className="CardQuiz__content">
      <div className="CardQuiz__question">
        <div className="CardQuiz__header">
          <h2 className="CardQuiz__terminology">{data?.terminology}</h2>
          <HiMiniSpeakerWave
            className="CardQuiz__icon--pronounce"
            title="Nghe phát âm"
            onClick={handlePronounceClick}
          />
        </div>

        {Array.isArray(data?.hint) && data.hint.length > 0 ? (
          <p className="CardQuiz__hint">{data.hint[0]}</p>
        ) : data?.hint ? (
          <p className="CardQuiz__hint">{data.hint}</p>
        ) : null}
      </div>

      <div className="CardQuiz__answers">
        {[
          "cardOptionOne",
          "cardOptionTwo",
          "cardOptionThree",
          "cardOptionFour",
        ].map((k) => {
          const text = (data && data[k]) || "";
          if (!text) return null;
          const btnClass = `CardQuiz__answer ${getBtnClass(text)}`;

          return (
            <button
              key={k}
              className={btnClass}
              onClick={() => clickAnswer(text)}
              disabled={isLocked}
              type="button"
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
