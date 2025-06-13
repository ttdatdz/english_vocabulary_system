import { Button, Divider, Input, Tabs } from "antd";
import "./DetailExam.scss";
import BaseTable from "../../components/BaseTable";
import ListPartSection from "../../components/ListPartSection";
import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import CommentItem from "../../components/CommentItem";
import {
  CreateComment,
  GetAllComment,
  GetDetailExam,
} from "../../services/Exam/commentExamService";
import {
  showErrorMessage,
  showSuccess,
  showWaringMessage,
} from "../../utils/alertHelper";
import { useAuth } from "../../utils/AuthContext";

import{get} from '../../utils/request';
const { TabPane } = Tabs;
export default function DetailExam() {
  const [activeTab, setActiveTab] = useState("1");
  const [selectedParts, setSelectedParts] = useState([]);
  const [practiceTime, setPracticeTime] = useState(120);
  const [comments, setComments] = useState([]);
  const [detailExam, setDetailExam] = useState({});
  const [commentContent, setCommentContent] = useState("");
  const { id } = useParams();
  const [data,setData]=useState([]);
  const { user } = useAuth(); // Lấy user từ AuthContext
  const currentUserId = user?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const isResultExam = location.pathname.includes("ResultExam"); // Kiểm tra có ở ResultExam không
  // console.log(">>>.check id", id);
  const columns = [
    {
      title: "Ngày làm",
      dataIndex: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => `${record.correctAnswers}/${record.totalQuestions}`,
      sorter: (a, b) => a.correctAnswers - b.correctAnswers,
    },
    {
      title: "Thời gian làm bài (phút)",
      dataIndex: "duration",
      render: (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
      },
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: "Phần thi",
      dataIndex: "section",
      sorter: (a, b) => a.section.localeCompare(b.section),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          <Link
            className="viewDetail"
            to={`/DetailExam/${id}/ResultExam/${record.key}`}
          >
            Xem chi tiết
          </Link>
        </div>
      ),
    },
  ];


  const loadExamResults = async () => {
    if (localStorage.getItem("accessToken") == null) {
      return;
    }
    const results = await get(`api/exam/result/getAllByExam/${id}`);
    if (results)
      setData(results);
    console.log(results);

  }

  useEffect(() => {
    loadExamResults();
  }, []);

  const onChange = (pagination, filters, sorter, extra) => {
    // console.log("params", pagination, filters, sorter, extra);
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
    setSelectedParts((prev) => {
      let newParts;
      if (prev.includes(partNumber)) {
        newParts = prev.filter((p) => p !== partNumber);
      } else {
        newParts = [...prev, partNumber];
      }
      // Sắp xếp tăng dần
      return newParts.sort((a, b) => a - b);
    });
  };
  // console.log(">>>>>>>>>>check selectedParts", selectedParts);
  const handleTimeChange = (value) => {
    setPracticeTime(Number(value));
  };
  // console.log(">>>>>>>>>>check PracticeTime", practiceTime);
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
            onPartChange={() => { }}
            handleTimeChange={handleTimeChange}
          />
        );
      default:
        return [];
    }
  };
  useEffect(() => {
    const getData = async () => {
      const result = await GetAllComment(id);
      if (!result) {
        return;
      } else {
        setComments(result);
      }
    };
    getData();
  }, [id]);

  useEffect(() => {
    const getData = async () => {
      const result = await GetDetailExam(id);
      if (!result) {
        return;
      } else {
        setDetailExam(result);
      }
    };

    getData();
  }, [id]);


  const ReloadListComment = async () => {
    const result = await GetAllComment(id);
    if (!result) {
      return;
    } else {
      setComments(result);
    }
  };
  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleSend = async () => {
    try {
      // Kiểm tra nội dung comment không được rỗng
      if (!commentContent.trim()) {
        showErrorMessage(
          "Nội dung không được để trống.Vui lòng nhập nội dung bình luận"
        );
        return;
      }
      const values = {
        examID: id,
        content: commentContent,
      };

      const result = await CreateComment(values); // Truyền values vào hàm CreateComment
      if (!result) return;

      showSuccess("Bình luận thành công");
      setCommentContent(""); // Reset input sau khi gửi thành công
      ReloadListComment();
    } catch (error) {
      showErrorMessage("Gửi bình luận thất bại! ", error);
    }
  };

  // console.log(">>>>>>>>>>.check comment", comments);
  // console.log(">>>>>>>>>>.check commentContent", commentContent);
  const [visibleComments, setVisibleComments] = useState(3);
  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 3);
  };
  return (
    <div className="detail-exam">
      <div className="MainContainer">
        {/* Chỉ hiển thị khi không ở ResultExam */}
        {!isResultExam && (
          <>
            <div className="detail-exam__header">
              <h1 className="detail-exam__title">{detailExam.title}</h1>
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
                      showWaringMessage("Hãy chọn ít nhất một Part!");
                      return;
                    }
                    navigate(`/PracticeExam/${detailExam.id}`, {
                      state: {
                        selectedParts:
                          activeTab === "1"
                            ? selectedParts
                            : [1, 2, 3, 4, 5, 6, 7],
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
          </>
        )}
        {/* Hiển thị ResultExam nếu có */}
        <Outlet />
        {/* Luôn hiển thị phần bình luận */}
        <div className="detail-exam__comments">
          <div className="detail-exam__comments-header">
            <h2 className="detail-exam__subtitle">Bình luận</h2>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                className="detail-exam__inputfeedback"
                placeholder="Nhận xét của bạn.."
                allowClear
                value={commentContent}
                onChange={handleCommentChange}
              />
              <Button className="detail-exam__comment-btn" onClick={handleSend}>
                Gửi
              </Button>
            </div>
          </div>
          <div className="detail-exam__comments-content">
            {comments.slice(0, visibleComments).map((comment, index) => (
              <CommentItem
                key={index}
                {...comment}
                ReloadListComment={ReloadListComment}
                currentUserId={currentUserId}
              />
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
