import React, { useEffect, useState, useRef } from "react";
import { Input, Button } from "antd";
import "./CardFillText.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";

export default function CardFillText(props) {
  const { data, onResult /* onCorrect may still be provided by parent */ } =
    props;
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'success' | 'error'
  const [hintLen, setHintLen] = useState(0);
  const inputRef = useRef(null);

  // sync when data or status prop changes (preserve review state)
  useEffect(() => {
    // reset base on new card
    setValue("");
    setStatus("idle");
    setHintLen(0);
    if (inputRef.current) inputRef.current.focus?.();

    // if parent passed a previous result in props.status, apply it
    const propStatus = props.status;
    if (propStatus && typeof propStatus === "object") {
      // nếu có selected trước đó, hiển thị trong input
      if (propStatus.selected) {
        setValue(propStatus.selected);
      }
      if (propStatus.result === "correct") setStatus("success");
      else if (propStatus.result === "incorrect") setStatus("error");
    }
  }, [data, props.status]);

  const normalize = (s) =>
    typeof s === "string" ? s.trim().toLowerCase() : String(s || "");

  const checkAnswer = () => {
    const correct = normalize(data?.terminology);
    const answer = normalize(value);
    if (!correct) {
      setStatus("error");
      onResult && onResult({ result: "incorrect", selected: value });
      return;
    }
    if (answer === correct) {
      setStatus("success");
      onResult && onResult({ result: "correct", selected: value });
    } else {
      setStatus("error");
      onResult && onResult({ result: "incorrect", selected: value });
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (status !== "idle") setStatus("idle");
  };

  const handlePressEnter = () => {
    checkAnswer();
  };

  const handleHint = () => {
    const term = data?.terminology || "";
    const next = Math.min(term.length, hintLen + 1);
    setHintLen(next);
    setStatus("error");
  };

  const revealed = (data?.terminology || "").slice(0, hintLen);

  const handlePlayAudio = () => {
    if (data?.audio && typeof data.audio === "string" && data.audio.trim()) {
      try {
        const audio = new Audio(data.audio);
        audio.crossOrigin = "anonymous";
        audio.play().catch(() => {
          const u = new SpeechSynthesisUtterance(data.terminology || "");
          u.lang = "en-US";
          speechSynthesis.speak(u);
        });
      } catch {
        const u = new SpeechSynthesisUtterance(data.terminology || "");
        u.lang = "en-US";
        speechSynthesis.speak(u);
      }
    } else if (data?.terminology) {
      const u = new SpeechSynthesisUtterance(data.terminology);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    }
  };

  return (
    <div className="CardFillText">
      <div className="CardFillText__top">
        <h2 className="CardFillText__definition">{data?.definition}</h2>
        <HiMiniSpeakerWave
          className="CardFillText__icon--pronounce"
          title="Nghe phát âm"
          onClick={handlePlayAudio}
        />
      </div>

      {Array.isArray(data?.hint) && data.hint.length > 0 && (
        <ul className="CardFillText__hint-list">
          {data.hint.map((h, idx) => (
            <li key={idx} className="CardFillText__hint-item">
              {h}
            </li>
          ))}
        </ul>
      )}

      <Input
        ref={inputRef}
        className={`CardFillText__input ${
          status === "success"
            ? "CardFillText__input--success"
            : status === "error"
            ? "CardFillText__input--error"
            : ""
        }`}
        placeholder="Nhập câu trả lời..."
        value={value}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        allowClear
      />

      <div className="CardFillText__feedback">
        {status === "error" && value.trim().length > 0 && (
          <>
            <p className="CardFillText__feedback-text">
              Bạn nhập sai rồi{revealed ? `, bắt đầu bằng "${revealed}"` : "."}
            </p>
            <Button
              type="default"
              className="CardFillText__hint-btn"
              onClick={handleHint}
              disabled={hintLen >= (data?.terminology || "").length}
            >
              Gợi ý
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
