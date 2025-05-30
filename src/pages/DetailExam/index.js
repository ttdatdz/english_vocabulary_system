import { Button, Divider, Input, Tabs } from "antd";
import "./DetailExam.scss";
import BaseTable from "../../components/BaseTable";
import ListPartSection from "../../components/ListPartSection";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommentItem from "../../components/CommentItem";
const { TabPane } = Tabs;
export default function DetailExam() {
  const [activeTab, setActiveTab] = useState("1");
  const [selectedParts, setSelectedParts] = useState([]);
  const [practiceTime, setPracticeTime] = useState(0);
  const navigate = useNavigate();
  const columns = [
    {
      title: "Ngày làm",
      dataIndex: "date",
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      sorter: {
        compare: (a, b) => a.chinese - b.chinese,
        multiple: 3,
      },
    },
    {
      title: "Thời gian làm bài",
      dataIndex: "time",
      sorter: {
        compare: (a, b) => a.math - b.math,
        multiple: 2,
      },
    },
    {
      title: "Phần thi",
      dataIndex: "part",
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          {/* <IoEye className="Action__Detail" onClick={() => showModal(record)} />
          <MdDelete
            className="Action__Delete"
            onClick={() => confirmDelete()}
          /> */}
          <Link className="viewDetail" to={"/"}>
            Xem chi tiết
          </Link>
        </div>
      ),
    },
  ];
  const data = [
    {
      key: "1",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
    {
      key: "2",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
    {
      key: "3",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
    {
      key: "4",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
    {
      key: "5",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
    {
      key: "6",
      date: "22/3/2025",
      time: "0:15:32s",
      part: "Part 5",
      result: "22/30",
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const parts = [
    { number: 1, title: "Part 1", questions: 6 },
    { number: 2, title: "Part 2", questions: 25 },
    { number: 3, title: "Part 3", questions: 39 },
    { number: 4, title: "Part 4", questions: 30 },
    { number: 5, title: "Part 5", questions: 30 },
    { number: 6, title: "Part 6", questions: 16 },
    { number: 7, title: "Part 7", questions: 54 },
  ];
  const handlePartChange = (partNumber) => {
    setSelectedParts((prev) =>
      prev.includes(partNumber)
        ? prev.filter((p) => p !== partNumber)
        : [...prev, partNumber]
    );
  };
  console.log(">>>>>>>>>>check selectedParts", selectedParts);
  const handleTimeChange = (value) => {
    setPracticeTime(Number(value));
  };
  console.log(">>>>>>>>>>check PracticeTime", practiceTime);
  const renderTopicList = () => {
    switch (activeTab) {
      case "1":
        return (
          <ListPartSection
            parts={parts}
            activeTab={1}
            hasCheckbox={true}
            handleTimeChange={handleTimeChange}
            selectedParts={selectedParts}
            onPartChange={handlePartChange}
          />
        );
      case "2":
        return (
          <ListPartSection
            parts={parts}
            activeTab={2}
            hasCheckbox={false}
            selectedParts={[]} // không cần chọn part khi làm full test
            onPartChange={() => {}}
            handleTimeChange={handleTimeChange}
          />
        );
      default:
        return [];
    }
  };
  const comments = [
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
      replies: [
        {
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
          name: "Trần Tiến Đạt",
          date: "10 - 9 - 2025",
          text: "Thật hả bạn? Mình mới làm được 100 câu thôi.",
        },
      ],
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
      replies: [
        {
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
          name: "Trần Tiến Đạt",
          date: "10 - 9 - 2025",
          text: "Thật hả bạn? Mình mới làm được 100 câu thôi.",
        },
      ],
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
    },
    {
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s",
      name: "Trần Tiến Đạt",
      date: "10 - 9 - 2025",
      text: "Đề này rất hay, mình đã làm được 150 câu trong 120 phút.",
    },
  ];
  const [visibleComments, setVisibleComments] = useState(3);
  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 3);
  };
  return (
    <div className="detail-exam">
      <div className="MainContainer">
        <div className="detail-exam__header">
          <h1 className="detail-exam__title">ETS 2024 - Test 1</h1>
          <p className="detail-exam__description">
            Thời gian làm bài: 120 phút | 7 phần thi | 200 câu hỏi
          </p>
        </div>
        <div className="detail-exam__results">
          <h2 className="detail-exam__subtitle">Kết quả làm bài</h2>
          <BaseTable columns={columns} data={data} onChange={onChange} />
        </div>
        <div className="detail-exam__tab-practice">
          <div className="detail-exam__tab-header">
            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <TabPane tab="Luyện tập" key="1" />
              <TabPane tab="Làm full test" key="2" />
            </Tabs>
          </div>

          <div className="detail-exam__tab-content">
            {renderTopicList()}
            <Button
              className="detail-exam__practice-btn"
              onClick={() => {
                if (activeTab === "1" && selectedParts.length === 0) {
                  alert("Hãy chọn ít nhất một Part!");
                  return;
                }
                navigate("/PracticeExam", {
                  state: {
                    selectedParts:
                      activeTab === "1" ? selectedParts : [1, 2, 3, 4, 5, 6, 7],
                    practiceTime,
                    mode: activeTab === "1" ? "practice" : "fulltest",
                  },
                });
              }}
            >
              Luyện tập
            </Button>
          </div>
        </div>
        <div className="detail-exam__comments">
          <div className="detail-exam__comments-header">
            <h2 className="detail-exam__subtitle">Bình luận</h2>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                className="detail-exam__inputfeedback"
                placeholder="Nhận xét của bạn.."
                allowClear
              />
              <Button className="detail-exam__comment-btn">Gửi</Button>
            </div>
          </div>
          <div className="detail-exam__comments-content">
            {comments.slice(0, visibleComments).map((comment, index) => (
              <CommentItem key={index} {...comment} />
            ))}
            {visibleComments < comments.length && (
              <Button
                onClick={handleLoadMore}
                className="detail-exam__loadmore-btn"
              >
                Xem thêm bình luận
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
