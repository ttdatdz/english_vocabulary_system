import "./CardPractice.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { FaRandom } from "react-icons/fa";
import { useState } from "react";

export default function CardPractice({ data }) {
  const [flipped, setFlipped] = useState(false);

  const levelMap = {
    1: "Dễ",
    2: "Trung bình",
    3: "Khó",
  };

  // Click vào thẻ thì lật
  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  // Click vào icon loa hoặc label thì không lật, ngăn sự kiện lan ra ngoài
  const stopFlip = (e) => {
    e.stopPropagation();
  };

  // Xử lý khi click vào loa (ví dụ phát âm)
  //   const handlePronounceClick = (e) => {
  //     e.stopPropagation(); // Ngăn lật thẻ
  //     if (data.audio) {
  //       const audio = new Audio(data.audio);
  //       audio.play();
  //     }
  //   };

  const handlePronounceClick = (e) => {
    e.stopPropagation();
    if (data?.audio) {
      const audio = new Audio(data.audio);
      audio.crossOrigin = "anonymous";
      audio.play().catch(() => {
        const u = new SpeechSynthesisUtterance(data.terminology || "");
        u.lang = "en-US";
        speechSynthesis.speak(u);
      });
    } else if (data?.terminology) {
      const u = new SpeechSynthesisUtterance(data.terminology);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    }
  };
  return (
    <div className="CardPractice" onClick={handleFlip}>
      {/* Icon random không ngăn sự kiện nên click vào sẽ lật */}
      <FaRandom
        className="CardPractice__icon CardPractice__icon--random"
        title="Lật thẻ"
      />

      {/* Label, ngăn không cho lật */}
      <p className="CardPractice__label" onClick={stopFlip}>
        {levelMap[data.level]}
      </p>

      <div className="CardPractice__flip">
        <div className={`flip__inner ${flipped ? "flipped" : ""}`}>
          {/* Mặt trước */}
          <div className="flip__face flip__front">
            <div className="flip__content">
              <div className="CardPractice__word-container">
                <h2 className="CardPractice__word">
                  {data.terminology} ({data.partOfSpeech})
                </h2>
                <HiMiniSpeakerWave
                  className="CardPractice__icon CardPractice__icon--pronounce"
                  title="Nghe phát âm"
                  onClick={handlePronounceClick}
                />
              </div>
              <h2 className="CardPractice__phonetic">{data?.pronounce}</h2>
            </div>
          </div>

          {/* Mặt sau */}
          <div className="flip__face flip__back">
            <div className="flip__content flip__back-content">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "65%",
                  fontSize: "16px",
                }}
              >
                <h3>Định nghĩa:</h3>
                <p>{data.definition}</p>

                <h3>Ví dụ:</h3>
                <p>{data.example ? data.example : "Không có ví dụ."}</p>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={data.image}
                  alt="minh họa"
                  className="CardPractice__img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
