import { Input } from "antd";
import "./CardFillText.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";
export default function CardFillText() {
  return (
    <div className="CardFillText">
      <h2 className="CardFillText__definition">Kỹ thuật viên</h2>
      <HiMiniSpeakerWave
        className="CardFillText__icon--pronounce"
        title="Nghe phát âm"
        // onClick={handlePronounceClick}
      />
      <p className="CardFillText__hint">What does this word mean?</p>
      <Input
        className="CardFillText__input"
        placeholder="Nhập câu trả lời..."
      />
    </div>
  );
}
