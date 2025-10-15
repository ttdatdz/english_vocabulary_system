import { HiMiniSpeakerWave } from "react-icons/hi2";
import "./CardQuiz.scss";

export default function CardQuiz() {
  const handlePronounceClick = (e) => {
    // e.stopPropagation(); // Ngăn lật thẻ
    // if (data.audio) {
    //   const audio = new Audio(data.audio);
    //   audio.play();
    // }
  };
  return (
    <div className="CardQuiz__content">
      <div className="CardQuiz__question">
        <div className="CardQuiz__header">
          <h2 className="CardQuiz__terminology">technician</h2>
          <HiMiniSpeakerWave
            className="CardQuiz__icon--pronounce"
            title="Nghe phát âm"
            onClick={handlePronounceClick}
          />
        </div>
        <p className="CardQuiz__hint">What does this word mean?</p>
      </div>

      <div className="CardQuiz__answers">
        <button className="CardQuiz__answer">A. Kỹ thuật viên</button>
        <button className="CardQuiz__answer">B. Kỹ sư</button>
        <button className="CardQuiz__answer">C. Bác sĩ</button>
        <button className="CardQuiz__answer">D. Giáo viên</button>
      </div>
    </div>
  );
}
