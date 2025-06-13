import { useNavigate, useParams } from "react-router-dom";
import "./ResultExam.scss";
import { Button } from "antd";
import { FaCheck } from "react-icons/fa6";
import { FaBullseye } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { FaMinusCircle } from "react-icons/fa";
import { get } from "../../utils/request";
import { useEffect, useState } from "react";
const ResultExam = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const loadExamResults = async () => {
    const data = await get(`api/exam/result/id/${resultId}`);
    if (data)
      setResult(data);
    console.log(data);
  }
  useEffect(() => {
    loadExamResults();
  }, []);
  const handleReviewDetailResult = () => {
    navigate(`/ReviewExam/${resultId}`);
  }
  const handleReturnDetailExam = (id) => {
    navigate(`/DetailExam/${id}`);
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  if (!result) return null;
  return (
    <div className="result-exam">
      <div className="result-exam__header">
        <h1 className="result-exam__title">
          Kết quả luyện tập: Practice {result?.examCollection} - {result?.examTitle} - {result?.section}
        </h1>
        <div className="result-exam__buttons">
          <Button onClick={() => handleReviewDetailResult()} className="result-exam__button result-exam__button--review">
            Xem chi tiết đáp án
          </Button>
          <Button onClick={() => handleReturnDetailExam(result.examID)} className="result-exam__button result-exam__button--back">
            Quay về trang đề thi
          </Button>
        </div>
      </div>
      <div className="result-exam__stats">
        <div className="result-exam__stat result-exam__stat--bg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 30,
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 30,
                justifyContent: "center",
                alignItems: "start",
              }}
            >
              <FaCheck className="result-exam__icon" />
              <span className="result-exam__label">
                Kết quả làm <br /> bài
              </span>
              <span className="result-exam__value">{result?.correctAnswers}/{result?.totalQuestions}</span>
            </div>

            <div className="result-exam__progress">
              <FaBullseye className="result-exam__icon" />
              <span className="result-exam__label">
                Độ chính xác <br /> (đúng/tổng)
              </span>
              <span className="result-exam__value">{((result?.correctAnswers / result?.totalQuestions) * 100).toFixed(1)}%</span>
            </div>
            <div className="result-exam__time-complete">
              <IoMdTime className="result-exam__icon" />
              <span className="result-exam__label">
                Thời gian hoàn <br /> thành
              </span>
              <span className="result-exam__value">{formatTime(result?.duration)}</span>
            </div>
          </div>
        </div>
        <div className="result-exam__stat">
          <FaCheckCircle className="result-exam__icon result-exam__icon--correct" />

          <span className="result-exam__label result-exam__label--correct">
            Trả lời đúng
          </span>
          <span className="result-exam__title">{result?.correctAnswers}</span>
          <span className="result-exam__subTitle">câu hỏi</span>
        </div>
        <div className="result-exam__stat">
          <FaTimesCircle className="result-exam__icon result-exam__icon--incorrect" />

          <span className="result-exam__label result-exam__label--incorrect">
            Trả lời sai
          </span>
          <span className="result-exam__title">{result?.incorrectAnswers}</span>
          <span className="result-exam__subTitle">câu hỏi</span>
        </div>
        <div className="result-exam__stat">
          <FaMinusCircle className="result-exam__icon result-exam__icon--skipped" />

          <span className="result-exam__label result-exam__label--skipped">
            Bỏ qua
          </span>
          <span className="result-exam__title">{result?.nullAnswers}</span>
          <span className="result-exam__subTitle">câu hỏi</span>
        </div>
      </div>
    </div>
  );
};

export default ResultExam;
