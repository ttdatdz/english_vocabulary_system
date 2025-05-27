import { Button } from "antd";
import "./PracticeExam.scss";
import Part1 from "../../components/Part1";
import React from "react";
import Part2 from "../../components/Part2";
import Part3 from "../../components/Part3";
export default function PracticeExam() {
  const questionOrder = Array.from({ length: 200 }, (_, i) => i + 1);
  return (
    <>
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
              {/* part1 - > part 7 */}
              <Part1 />
              <Part2 />
              <Part3 />
            </div>
            <div className="PracticeExam__content-right">
              <p className="PracticeExam__practiceTime">
                Thời gian làm bài:
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
                    <Button className="PracticeExam__btnQuestion">
                      {item}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
