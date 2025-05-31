import { Button, Divider } from "antd";
import "./Part2.scss";
import { ArrowRightOutlined } from "@ant-design/icons";
export default function Part2(props) {
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
  const part2Questions = Array.from({ length: 25 }, (_, i) => ({
    id: i + 7,
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    options: ["A", "B", "C", "D"],
    correctAnswer: ["B"],
  }));
  const handleChange = (e, question) => {
    onAnswerQuestion(question.id);
    saveUserAnswer(question.id, e.target.value);
  };
  return (
    <div className="Part2">
      {/* danh sách câu hỏi part 2 */}
      {part2Questions.map((question) => (
        <div
          key={question.id}
          className="CardPartTwo"
          ref={(el) => (questionRefs.current[question.id] = el)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "100%",
            }}
          >
            <div className="CardPartTwo__left">
              <audio
                controls
                src={question.audio}
                style={{ marginTop: "10px" }}
                className="CardPartTwo__audio"
              />
            </div>
            <div className="CardPartTwo__right">
              <div
                className={`CardPartTwo__questionNumber ${
                  markedQuestions.includes(question.id) ? "marked" : ""
                }`}
                onClick={() => {
                  toggleMarkQuestion(question.id);
                }}
              >
                {question.id}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* danh sách đáp án */}
                {question.options.map((label) => (
                  <div className="CardPartTwo__option" key={label}>
                    <input
                      type="radio"
                      name={`part2-question-${question.id}`}
                      id={`part2-question-${question.id}-option-${label}`}
                      onChange={(e) => handleChange(e, question)}
                      value={label}
                      checked={userAnswers[question.id] === label}
                    />
                    <label
                      htmlFor={`part2-question-${question.id}-option-${label}`}
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {question.id !== 31 ? (
            <Divider className="Part2__divider" />
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
