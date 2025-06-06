import { Button, Divider } from "antd";
import "./Part5.scss";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Part5(props) {
  const {
    activeTab,
    setActiveTab,
    questionRefs,
    markedQuestions,
    toggleMarkQuestion,
    onAnswerQuestion,
    saveUserAnswer,
    userAnswers,
    selectedParts,
    mode,
    goToNextPart,
  } = props;
  const part5Questions = Array.from({ length: 30 }, (_, i) => ({
    id: i + 101,
    question: "Mougey Fine Gifts is known for its large range of _____ goods.",
    options: ["A. regional", "B. regionally", "C. region", "D. regions"],
    correctAnswer: "B",
  }));
  const handleChange = (e, question) => {
    onAnswerQuestion(question.id);
    saveUserAnswer(question.id, e.target.value);
  };
  return (
    <div className="PartFive">
      {part5Questions.map((dialog) => (
        <div
          key={dialog.id}
          className="CardPartFive"
          ref={(el) => (questionRefs.current[dialog.id] = el)}
        >
          <div className="CardPartFive__right">
            <div className="CardPartFive__container-question">
              {/* card câu hỏi*/}
              <div
                className={`CardPartFive__questionNumber ${
                  markedQuestions.includes(dialog.id) ? "marked" : ""
                }`}
                onClick={() => {
                  toggleMarkQuestion(dialog.id);
                }}
              >
                {dialog.id}
              </div>
              <div>
                <div className="CardPartFive__questionText">
                  {dialog.question}
                </div>
                <div className="CardPartFive__options">
                  {dialog.options.map((option) => (
                    <div className="CardPartFive__option" key={option}>
                      <input
                        type="radio"
                        name={`part3-question-${dialog.id}`}
                        id={`part3-question-${dialog.id}-option-${option}`}
                        onChange={(e) => handleChange(e, dialog)}
                        value={option}
                        checked={userAnswers[dialog.id] === option}
                      />
                      <label
                        htmlFor={`part3-question-${dialog.id}-option-${option}`}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Divider hoặc nút tiếp theo */}
          {dialog.id !== 130 ? (
            <Divider className="PartFive__divider" />
          ) : (
            // Chỉ hiện nút nếu activeTab KHÔNG phải là phần tử cuối cùng trong selectedParts
            selectedParts[selectedParts.length - 1] !== Number(activeTab) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  width: "100%",
                }}
              >
                <Button
                  className="btnNext"
                  onClick={() => {
                    goToNextPart({
                      selectedParts,
                      activeTab,
                      setActiveTab,
                      mode,
                    });
                  }}
                >
                  Tiếp theo <ArrowRightOutlined />
                </Button>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}
