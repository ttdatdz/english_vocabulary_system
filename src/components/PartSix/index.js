import { Button, Divider } from "antd";
import "./PartSix.scss";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function PartSix(props) {
  const {
    activeTab,
    setActiveTab,
    questionRefs,
    markedQuestions,
    toggleMarkQuestion,
    onAnswerQuestion,
    saveUserAnswer,
    userAnswers,
  } = props;
  const partSixQuestions = Array.from({ length: 4 }, (_, i) => ({
    id: i, // đoạn hội thoại thứ i
    reading: `NOTICE
To continue providing the highest level of ----- (131) to our corporate tenants, we have scheduled the south lobby restrooms for maintenance this weekend, May 13 and May 14. ----- (132) this time, the restrooms will be out of order, so tenants and their guests should instead use the facilities in the north lobby.
We ----- (133) for any inconvenience this might cause. -----(134).
Denville Property Management Partners`,
    questions: [
      {
        id: 131 + i * 4,
        options: ["A. serve", "B. served", "C. server", "D. service"],
        correctAnswer: "B",
      },
      {
        id: 131 + i * 4 + 1,
        options: ["A. Along", "B. During", "C. Without", "D. Between"],
        correctAnswer: "B",
      },
      {
        id: 131 + i * 4 + 2,
        options: ["A. apolozie", "B. organize", "C. realize", "D. recognize"],
        correctAnswer: "C",
      },
      {
        id: 131 + i * 4 + 3,
        options: [
          "A. If you would like to join our property management team, call us today.",
          "B. Thank you for your patience while the main lobby is being painted.",
          "C. Please do not attempt to access the north lobby on these days.",
          "D. Questions or comments may be directed to the Management office.",
        ],
        correctAnswer: "C",
      },
    ],
  }));
  const handleChange = (e, question) => {
    onAnswerQuestion(question.id);
    saveUserAnswer(question.id, e.target.value);
  };
  return (
    <div className="PartSix">
      {partSixQuestions.map((dialog) => (
        <div key={dialog.id} className="CardPartSix">
          {/* Audio cho mỗi đoạn hội thoại */}
          <div className="CardPartSix__content">
            <div className="CardPartSix__reading">{dialog.reading}</div>
            <div className="CardPartSix__container-question">
              {/* Danh sách 4 câu hỏi */}
              {dialog.questions.map((question) => (
                <div
                  key={question.id}
                  className="CardPartSix__questionBlock"
                  ref={(el) => (questionRefs.current[question.id] = el)}
                >
                  <div className="CardPartSix__container-questionNumber">
                    <div
                      className={`CardPartSix__questionNumber ${
                        markedQuestions.includes(question.id) ? "marked" : ""
                      }`}
                      onClick={() => {
                        toggleMarkQuestion(question.id);
                      }}
                    >
                      {question.id}
                    </div>
                  </div>

                  <div className="CardPartSix__container-options">
                    <div className="CardPartSix__options">
                      {question.options.map((option) => (
                        <div className="CardPartSix__option" key={option}>
                          <input
                            type="radio"
                            name={`part3-question-${question.id}`}
                            id={`part3-question-${question.id}-option-${option}`}
                            onChange={(e) => handleChange(e, question)}
                            value={option}
                            checked={userAnswers[question.id] === option}
                          />
                          <label
                            htmlFor={`part3-question-${question.id}-option-${option}`}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Divider hoặc nút tiếp theo */}
          {dialog.id !== partSixQuestions.length - 1 ? (
            <Divider className="PartSix__divider" />
          ) : (
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
                  setActiveTab("7");
                  window.scrollTo({ top: 0, behavior: "smooth" }); // khi chuyển tab xong thì cuộn lên đầu trang
                }}
              >
                Tiếp theo
                <ArrowRightOutlined className="iconNext" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
