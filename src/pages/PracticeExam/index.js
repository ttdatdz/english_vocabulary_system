import { Button } from "antd";
import "./PracticeExam.scss";
import Part1 from "../../components/Part1";
import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "antd";
import Part2 from "../../components/Part2";
import Part3 from "../../components/Part3";
import Part4 from "../../components/Part4";
import Part5 from "../../components/Part5";
import PartSix from "../../components/PartSix";
import PartSeven from "../../components/PartSeven";
import { useLocation } from "react-router-dom";
const { TabPane } = Tabs;

export default function PracticeExam() {
  // useRef() dùng để lưu trữ một giá trị bất kỳ (số, chuỗi, object, hàm, DOM element,...) mà không gây re-render khi giá trị đó thay đổi
  // . useRef() luôn Luôn trả về một object có thuộc tính current.
  //  Và chính .current là nơi bạn lưu giá trị của mình.
  // Khi lưu object hoặc DOM element,.current giữ một tham chiếu đến giá trị gốc, tức là thay đổi giá trị gốc ở nơi khác thì .current cũng thấy thay đổi, và ngược lại.
  const questionRefs = useRef({});

  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  // cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  //useLocation giúp bạn lấy thông tin về route hiện tại, đặc biệt là lấy lại dữ liệu đã truyền qua navigate bằng thuộc tính state.
  const location = useLocation();
  const {
    selectedParts = [1, 2, 3, 4, 5, 6, 7],
    practiceTime = 0,
    mode = "fulltest",
  } = location.state || {};

  const [activeTab, setActiveTab] = useState(
    selectedParts.length > 0 ? selectedParts[0].toString() : "1"
  );

  useEffect(() => {
    if (selectedParts.length > 0) {
      setActiveTab(selectedParts[0].toString());
    }
  }, [selectedParts]);

  // hàm chuyển qua part tiếp theo
  function goToNextPart({ selectedParts, activeTab, setActiveTab, mode }) {
    if (mode === "fulltest") {
      setActiveTab((prev) => (Number(prev) + 1).toString());
    } else {
      const currentIndex = selectedParts.indexOf(Number(activeTab));
      const nextPart = selectedParts[currentIndex + 1];
      if (nextPart) {
        setActiveTab(nextPart.toString());
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // Tính thời gian làm bài
  let displayTime;
  if (mode === "fulltest") {
    displayTime = 120; // 120 phút cho full test
  } else {
    displayTime = practiceTime > 0 ? practiceTime : null; // null = vô hạn
  }

  //Biến lưu trữ số giây còn lại
  const [secondsLeft, setSecondsLeft] = useState(
    displayTime ? displayTime * 60 : null
  );
  //thời gian đã trôi qua
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // useEffect cho timer
  useEffect(() => {
    if (secondsLeft === null) return; // Không giới hạn thời gian
    if (secondsLeft <= 0) {
      // Hết giờ, xử lý nộp bài hoặc thông báo ở đây
      alert("Hết thời gian làm bài!");
      // Bạn có thể tự động gọi hàm nộp bài ở đây nếu muốn
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  useEffect(() => {
    if (displayTime !== null) return; // Chỉ chạy khi không giới hạn thời gian
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [displayTime]);
  //Hàm format thời gian
  const formatTime = (secondsLeft) => {
    const m = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const scrollToQuestion = (id) => {
    const el = questionRefs.current[id];
    if (el) {
      // scrollIntoView dùng để cuộn đến phần tử
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleMarkQuestion = (id) => {
    setMarkedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };
  const onAnswerQuestion = (questionId) => {
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };
  const saveUserAnswer = (questionId, value) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  // console.log(">>>>>>>>>check UserAnswers", userAnswers);

  const renderPart = () => {
    switch (activeTab) {
      case "1":
        return (
          <Part1
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "2":
        return (
          <Part2
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "3":
        return (
          <Part3
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "4":
        return (
          <Part4
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "5":
        return (
          <Part5
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "6":
        return (
          <PartSix
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
            selectedParts={selectedParts}
            mode={mode}
            goToNextPart={goToNextPart}
          />
        );
      case "7":
        return (
          <PartSeven
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
            markedQuestions={markedQuestions}
            toggleMarkQuestion={toggleMarkQuestion}
            onAnswerQuestion={onAnswerQuestion}
            saveUserAnswer={saveUserAnswer}
            userAnswers={userAnswers}
          />
        );
      default:
        return [];
    }
  };
  // Chỉ render các tab part được chọn
  const partTabs = [
    { key: "1", label: "Part 1" },
    { key: "2", label: "Part 2" },
    { key: "3", label: "Part 3" },
    { key: "4", label: "Part 4" },
    { key: "5", label: "Part 5" },
    { key: "6", label: "Part 6" },
    { key: "7", label: "Part 7" },
  ].filter((tab) => selectedParts.includes(Number(tab.key)));
  const getPartByQuestion = (id) => {
    if (id <= 6) return "1";
    if (id <= 31) return "2";
    if (id <= 70) return "3";
    if (id <= 100) return "4";
    if (id <= 130) return "5";
    if (id <= 146) return "6";
    return "7";
  };
  const partQuestionRanges = {
    1: [1, 6],
    2: [7, 31],
    3: [32, 70],
    4: [71, 100],
    5: [101, 130],
    6: [131, 146],
    7: [147, 200],
  };
  const filteredQuestionOrder = selectedParts
    .map((part) => {
      const [start, end] = partQuestionRanges[part];
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })
    .flat();
  return (
    <div className="PracticeExam">
      <div className="PracticeExam__header">
        <div className="MainContainer">
          <h2 className="PracticeExam__header-title">ETS 2024 - Test 1</h2>
          <Button className="PracticeExam__btnExit">Thoát</Button>
        </div>
      </div>
      <div className="MainContainer">
        <div className="PracticeExam__content">
          <div className="PracticeExam__content-left">
            <Tabs
              defaultActiveKey={partTabs[0].key}
              activeKey={activeTab}
              onChange={setActiveTab}
            >
              {partTabs.map((tab) => (
                <TabPane tab={tab.label} key={tab.key} />
              ))}
            </Tabs>
            <div className="VocabularyTopic-page__listTopic">
              {renderPart()}
            </div>
          </div>
          <div className="PracticeExam__content-right">
            <p className="PracticeExam__practiceTime">
              {displayTime === null
                ? "Thời gian làm bài :"
                : "Thời gian còn lại :"}{" "}
              <strong style={{ fontSize: "19px" }}>
                {" "}
                {displayTime === null
                  ? `${formatElapsed(elapsedSeconds)}`
                  : `${formatTime(secondsLeft)}`}
              </strong>
            </p>
            <Button className="PracticeExam__btnSubmit">Nộp bài</Button>
            <p className="PracticeExam__note">
              Chú ý: bạn có thể click vào số thứ tự câu hỏi trong bài để đánh
              dấu review
            </p>
            <div>
              {filteredQuestionOrder.map((item) => (
                <React.Fragment key={item}>
                  {item === 1 && (
                    <h3 className="PracticeExam__title-part">Part 1</h3>
                  )}
                  {item === 7 && (
                    <h3 className="PracticeExam__title-part">Part 2</h3>
                  )}
                  {item === 32 && (
                    <h3 className="PracticeExam__title-part">Part 3</h3>
                  )}
                  {item === 71 && (
                    <h3 className="PracticeExam__title-part">Part 4</h3>
                  )}
                  {item === 101 && (
                    <h3 className="PracticeExam__title-part">Part 5</h3>
                  )}
                  {item === 131 && (
                    <h3 className="PracticeExam__title-part">Part 6</h3>
                  )}
                  {item === 147 && (
                    <h3 className="PracticeExam__title-part">Part 7</h3>
                  )}
                  <Button
                    className={`PracticeExam__btnQuestion ${
                      markedQuestions.includes(item) ? "marked" : ""
                    } ${answeredQuestions[item] ? "answered" : ""}`}
                    onClick={() => {
                      const part = getPartByQuestion(item);
                      setActiveTab(part);
                      setTimeout(() => {
                        scrollToQuestion(item);
                      }, 300);
                    }}
                  >
                    {item}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
