import { Divider } from "antd";
import "./PartSeven.scss";

export default function PartSeven(props) {
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
  const partSevenQuestions = Array.from({ length: 18 }, (_, i) => ({
    id: i, // đoạn hội thoại thứ i
    images: [
      `https://s4-media1.study4.com/media/e24/images_fixed2/image306.png`,
      `https://s4-media1.study4.com/media/e24/images_fixed2/image201.png`,
    ],
    questions: [
      {
        id: 147 + i * 3,
        text: "What is true about the Savan Business Center?",
        options: [
          "A. It works with small businesses.",
          "B. It publishes a weekly newsletter.",
          "C. It recently launched a new Web site.",
          "D. It is seeking suggestions for webinar topics.",
        ],
        correctAnswer: "B",
      },
      {
        id: 147 + i * 3 + 1,
        text: "What will Mr. Higgins ask the technical team to look into?",
        options: [
          "A. Improving the Web site’s response rate",
          "B. Providing an option to send receipts to multiple e-mail addresses",
          "C. Placing a link to customers’ order history on the home page",
          "D. Making return labels printable from any device",
        ],
        correctAnswer: "B",
      },
      {
        id: 147 + i * 3 + 2,
        text: "What is true about the Savan Business Center?",
        options: [
          "A. It works with small businesses.",
          "B. It publishes a weekly newsletter.",
          "C. It recently launched a new Web site.",
          "D. It is seeking suggestions for webinar topics.",
        ],
        correctAnswer: "B",
      },
    ],
  }));
  const handleChange = (e, question) => {
    onAnswerQuestion(question.id);
    saveUserAnswer(question.id, e.target.value);
  };
  return (
    <div className="PartSeven">
      {partSevenQuestions.map((dialog) => (
        <div key={dialog.id} className="CardPartSeven">
          {/* Audio cho mỗi đoạn hội thoại */}
          <div className="CardPartSeven__content">
            <div className="CardPartSeven__container-images">
              {/* danh sách ảnh bài đọc */}
              {dialog.images.map((item, index) => {
                return (
                  <div key={index}>
                    <img
                      src={item}
                      alt="ảnh bài đọc"
                      className="CardPartSeven__image"
                    />
                  </div>
                );
              })}
            </div>
            <div className="CardPartSeven__container-question">
              {/* Danh sách câu hỏi */}
              {dialog.questions.map((question) => (
                <div
                  key={question.id}
                  className="CardPartSeven__questionBlock"
                  ref={(el) => (questionRefs.current[question.id] = el)}
                >
                  <div className="CardPartSeven__container-questionNumber">
                    <div
                      className={`CardPartSeven__questionNumber ${
                        markedQuestions.includes(question.id) ? "marked" : ""
                      }`}
                      onClick={() => {
                        toggleMarkQuestion(question.id);
                      }}
                    >
                      {question.id}
                    </div>
                  </div>

                  <div className="CardPartSeven__container-options">
                    <div className="CardPartSeven__question-text">
                      {question.text}
                    </div>
                    <div className="CardPartSeven__options">
                      {question.options.map((option) => (
                        <div className="CardPartSeven__option" key={option}>
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
          {dialog.id !== partSevenQuestions.length - 1 && (
            <Divider className="PartSeven__divider" />
          )}
        </div>
      ))}
    </div>
  );
}
