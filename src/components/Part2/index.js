import { Button, Divider } from "antd";
import "./Part2.scss";
import { ArrowRightOutlined } from "@ant-design/icons";
export default function Part2() {
  const part2Questions = Array.from({ length: 25 }, (_, i) => ({
    id: i + 7,
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    options: ["A", "B", "C", "D"],
    correctAnswer: ["B"],
  }));
  return (
    <div className="Part2">
      {/* <div className="Part2__header">Part 2</div> */}
      {/* danh sách câu hỏi part 1 */}
      {part2Questions.map((question) => (
        <div key={question.id} className="CardPartTwo">
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
              <div className="CardPartTwo__questionNumber">{question.id}</div>
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
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
              }}
            >
              <Button className="btnNext">
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
