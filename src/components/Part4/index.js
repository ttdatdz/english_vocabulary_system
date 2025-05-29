import { Button, Divider } from "antd";
import "./Part4.scss";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Part4(props) {
  const {
    activeTab,
    setActiveTab,
    questionRefs,
    markedQuestions,
    toggleMarkQuestion,
  } = props;
  const part4Questions = Array.from({ length: 10 }, (_, i) => ({
    id: i, // đoạn hội thoại thứ i
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    image:
      "https://s4-media1.study4.com/media/gg_imgs/test/ed13a798fa9d20bc4c96079b9f94bb0dae8596d4.jpg",
    questions: [
      {
        id: 71 + i * 3,
        text: "What is the woman preparing for?",
        options: [
          "A. A move to a new city",
          "B. A business trip",
          "C. A building tour",
          "D. A meeting with visiting colleagues",
        ],
        correctAnswer: "B",
      },
      {
        id: 71 + i * 3 + 1,
        text: "Who most likely is the man?",
        options: [
          "A. An accountant",
          "B. An administrative assistant",
          "C. A marketing director",
          "D. A company president",
        ],
        correctAnswer: "B",
      },
      {
        id: 71 + i * 3 + 2,
        text: "What does the woman want to pick up on Friday morning?",
        options: [
          "A. A building map",
          "B. A room key",
          "C. An ID card",
          "D. A parking pass",
        ],
        correctAnswer: "C",
      },
    ],
  }));

  return (
    <div className="Part4">
      {part4Questions.map((dialog) => (
        <div key={dialog.id} className="CardPartFour">
          {/* Audio cho mỗi đoạn hội thoại */}
          <div className="CardPartFour__left">
            <audio
              controls
              src={dialog.audio}
              className="CardPartFour__audio"
            />
          </div>
          <div className="CardPartFour__right">
            {dialog.image && (
              <div className="CardPartFour__container-Img">
                <img
                  src={dialog.image}
                  alt="Part 3 Visual"
                  className="CardPartFour__image"
                />
              </div>
            )}
            <div className="CardPartFour__container-question">
              {/* Danh sách 3 câu hỏi */}
              {dialog.questions.map((question) => (
                <div
                  key={question.id}
                  className="CardPartFour__questionBlock"
                  ref={(el) => (questionRefs.current[question.id] = el)}
                >
                  <div
                    className={`CardPartFour__questionNumber ${
                      markedQuestions.includes(question.id) ? "marked" : ""
                    }`}
                    onClick={() => {
                      toggleMarkQuestion(question.id);
                    }}
                  >
                    {question.id}
                  </div>
                  <div>
                    <div className="CardPartFour__questionText">
                      {question.text}
                    </div>
                    <div className="CardPartFour__options">
                      {question.options.map((option) => (
                        <div className="CardPartFour__option" key={option}>
                          <input
                            type="radio"
                            name={`part3-question-${question.id}`}
                            id={`part3-question-${question.id}-option-${option}`}
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
          {dialog.id !== part4Questions.length - 1 ? (
            <Divider className="Part4__divider" />
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
                  setActiveTab("5");
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
