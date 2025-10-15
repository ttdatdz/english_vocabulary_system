import { HiMiniSpeakerWave } from "react-icons/hi2";
import "./Quiz.scss";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";
import { Button } from "antd";
import CardFillText from "../../components/CardFillText";
import CardQuiz from "../../components/CardQuiz";
export default function Quiz() {
  return (
    <div className="MainContainer">
      <div className="Quiz">
        <div className="Quiz__left">
          {/* <CardFillText /> */}
          <CardQuiz />
          <div className="Quiz__footer">
            <button className="Quiz__btn Quiz__btn--prev">
              <MdOutlineSkipPrevious className="Quiz__icon" />
              Câu trước
            </button>
            <button className="Quiz__btn Quiz__btn--next">
              Câu sau
              <MdOutlineSkipNext className="Quiz__icon Quiz__icon--next" />
            </button>
          </div>
        </div>
        <div className="Quiz__right">
          <div className="Quiz__question-list">
            <h3>Danh sách câu hỏi:</h3>
            <div className="Quiz__number-list">
              {[...Array(200)].map((_, idx) => (
                <button
                  key={idx}
                  className={`Quiz__number-item${idx === 1 ? " active" : ""}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
