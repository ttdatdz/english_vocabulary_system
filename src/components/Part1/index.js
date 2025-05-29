import { Button, Divider } from "antd";
import "./Part1.scss";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Part1(props) {
  const {
    activeTab,
    setActiveTab,
    questionRefs,
    markedQuestions,
    toggleMarkQuestion,
    onAnswerQuestion,
  } = props;

  const part1Questions = [
    {
      id: 1,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
    },
    {
      id: 2,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
    },
    {
      id: 3,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "D",
    },
    {
      id: 4,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "/audio/part1/q4.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
    },
    {
      id: 5,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "/audio/part1/q5.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
    },
    {
      id: 6,
      image:
        "https://s4-media1.study4.com/media/tez_media1/img/ets_toeic_2022_test_1_1.png",
      audio: "/audio/part1/q6.mp3",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
    },
  ];

  return (
    <div className="Part1">
      {part1Questions.map((question) => (
        <div
          key={question.id}
          className="CardPartOne"
          //khi react render DOM thì nó sẽ đọc qua từng element, nếu element đó có ref thì nó sẽ tạo ra 1 tham chiếu đến element này và truyền nó vào hàm bên trong ref mà ta cung cấp
        >
          <div style={{ display: "flex", gap: "20px", width: "100%" }}>
            <div className="CardPartOne__left">
              <img
                src={question.image}
                alt={`Part 1 Question ${question.id}`}
              />
              <audio
                controls
                src={question.audio}
                style={{ marginTop: "10px", width: "100%" }}
              />
            </div>
            <div className="CardPartOne__right">
              <div
                className={`CardPartOne__questionNumber ${
                  markedQuestions.includes(question.id) ? "marked" : ""
                }`}
                ref={(el) => (questionRefs.current[question.id] = el)}
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
                {question.options.map((label) => (
                  <div className="CardPartOne__option" key={label}>
                    <input
                      type="radio"
                      name={`part1-question-${question.id}`}
                      id={`part1-question-${question.id}-option-${label}`}
                      onChange={() => onAnswerQuestion(question.id)}
                    />
                    <label
                      htmlFor={`part1-question-${question.id}-option-${label}`}
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {question.id !== 6 ? (
            <Divider className="Part1__divider" />
          ) : (
            <div
              style={{ display: "flex", justifyContent: "end", width: "100%" }}
            >
              <Button
                className="btnNext"
                onClick={() => {
                  setActiveTab("2");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Tiếp theo <ArrowRightOutlined />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
