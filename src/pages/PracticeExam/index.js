import { Button } from "antd";
import "./PracticeExam.scss";
import Part1 from "../../components/Part1";
import React, { useRef, useState } from "react";
import { Tabs } from "antd";
import Part2 from "../../components/Part2";
import Part3 from "../../components/Part3";
import Part4 from "../../components/Part4";
import Part5 from "../../components/Part5";
import PartSix from "../../components/PartSix";
import PartSeven from "../../components/PartSeven";
const { TabPane } = Tabs;

export default function PracticeExam() {
  // useRef() dùng để lưu trữ một giá trị bất kỳ (số, chuỗi, object, hàm, DOM element,...) mà không gây re-render khi giá trị đó thay đổi
  // . useRef() luôn Luôn trả về một object có thuộc tính current.
  //  Và chính .current là nơi bạn lưu giá trị của mình.
  // Khi lưu object hoặc DOM element,.current giữ một tham chiếu đến giá trị gốc, tức là thay đổi giá trị gốc ở nơi khác thì .current cũng thấy thay đổi, và ngược lại.
  const questionRefs = useRef({});

  const questionOrder = Array.from({ length: 200 }, (_, i) => i + 1);
  const [activeTab, setActiveTab] = useState("1");

  const scrollToQuestion = (id) => {
    const el = questionRefs.current[id];
    if (el) {
      // scrollIntoView dùng để cuộn đến phần tử
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const renderPart = () => {
    switch (activeTab) {
      case "1":
        return (
          <Part1
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "2":
        return (
          <Part2
            aactiveTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "3":
        return (
          <Part3
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "4":
        return (
          <Part4
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "5":
        return (
          <Part5
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "6":
        return (
          <PartSix
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      case "7":
        return (
          <PartSeven
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            questionRefs={questionRefs}
          />
        );
      default:
        return [];
    }
  };

  const getPartByQuestion = (id) => {
    if (id <= 6) return "1";
    if (id <= 31) return "2";
    if (id <= 70) return "3";
    if (id <= 100) return "4";
    if (id <= 130) return "5";
    if (id <= 146) return "6";
    return "7";
  };

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
              defaultActiveKey="1"
              activeKey={activeTab}
              onChange={setActiveTab}
            >
              <TabPane tab="Part 1" key="1" />
              <TabPane tab="Part 2" key="2" />
              <TabPane tab="Part 3" key="3" />
              <TabPane tab="Part 4" key="4" />
              <TabPane tab="Part 5" key="5" />
              <TabPane tab="Part 6" key="6" />
              <TabPane tab="Part 7" key="7" />
            </Tabs>
            <div className="VocabularyTopic-page__listTopic">
              {renderPart()}
            </div>
          </div>
          <div className="PracticeExam__content-right">
            <p className="PracticeExam__practiceTime">
              Thời gian làm bài:{" "}
              <strong style={{ fontSize: "19px" }}> 05:20s</strong>
            </p>
            <Button className="PracticeExam__btnSubmit">Nộp bài</Button>
            <p className="PracticeExam__note">
              Chú ý: bạn có thể click vào số thứ tự câu hỏi trong bài để đánh
              dấu review
            </p>
            <div>
              {questionOrder.map((item) => (
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
                    className="PracticeExam__btnQuestion"
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
