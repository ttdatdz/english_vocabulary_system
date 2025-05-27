import { Button, Divider } from "antd";
import "./Part5.scss";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Part5() {
  const part5Questions = Array.from({ length: 30 }, (_, i) => ({
    id: i + 101,
    question: "Mougey Fine Gifts is known for its large range of _____ goods.",
    options: ["A. regional", "B. regionally", "C. region", "D. regions"],
    correctAnswer: "B",
  }));

  return (
    <div className="PartFive">
      {/* <div className="PartFive__header">Part 3</div> */}

      {part5Questions.map((dialog) => (
        <div key={dialog.id} className="CardPartFive">
          {/* Audio cho mỗi đoạn hội thoại */}
          <div className="CardPartFive__right">
            <div className="CardPartFive__container-question">
              {/* card câu hỏi*/}
              <div className="CardPartFive__questionNumber">{dialog.id}</div>
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
