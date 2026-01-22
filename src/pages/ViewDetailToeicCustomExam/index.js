import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./ViewDetailToeicCustomExam.scss";
import CanvasExamGuide from "../../canvas/CanvasExamGuide";
import { get } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const defaultParts = [
  { id: 1, label: "Part 1", questionCount: 0 },
  { id: 2, label: "Part 2", questionCount: 0 },
  { id: 3, label: "Part 3", questionCount: 0 },
  { id: 4, label: "Part 4", questionCount: 0 },
  { id: 5, label: "Part 5", questionCount: 0 },
  { id: 6, label: "Part 6", questionCount: 0 },
  { id: 7, label: "Part 7", questionCount: 0 },
];

export default function ViewDetailToeicCustomExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [duration, setDuration] = useState(120);
  const [parts, setParts] = useState(defaultParts);
  const [data, setData] = useState({ id: null, title: "" });
  const [isLoading, setIsLoading] = useState(true);

  // ===== Load exam data =====
  useEffect(() => {
    const loadExamData = async () => {
      if (!id) {
        showErrorMessage("Không tìm thấy ID đề thi");
        navigate("/ToeicTests");
        return;
      }

      try {
        setIsLoading(true);
        const examData = await get(`/api/exam/detail/${id}`, true);

        if (!examData) {
          showErrorMessage("Không tìm thấy đề thi");
          navigate("/ToeicTests");
          return;
        }

        setData({
          id: examData.id,
          title: examData.title || "Untitled Exam",
        });

        setDuration(examData.duration || 120);
        updateQuestionCounts(examData);

        window.__toeicExamData = examData;
      } catch (error) {
        console.error("Load exam data error:", error);
        showErrorMessage("Lỗi khi tải dữ liệu đề thi");
        navigate("/ToeicTests");
      } finally {
        setIsLoading(false);
      }
    };

    loadExamData();
  }, [id, navigate]);

  // Refetch khi quay lại tab
  useEffect(() => {
    if (location?.pathname?.includes("DetailCustomToeicExam") && id) {
      fetchExamDataAndUpdateParts(id);
    }
  }, [location?.pathname, id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        fetchExamDataAndUpdateParts(id);
      }
    };

    const handleFocus = () => {
      if (id) {
        fetchExamDataAndUpdateParts(id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]);

  const fetchExamDataAndUpdateParts = async (examId) => {
    try {
      const examData = await get(`/api/exam/detail/${examId}`, true);
      updateQuestionCounts(examData);
      window.__toeicExamData = examData;
    } catch (err) {
      console.error("Fetch exam data error", err);
    }
  };

  // ===== Count questions per part =====
  const updateQuestionCounts = (examData) => {
    const questionCountByPart = {};

    (examData.questions || []).forEach((q) => {
      const partNum = String(q.part);
      questionCountByPart[partNum] = (questionCountByPart[partNum] || 0) + 1;
    });

    (examData.groupQuestions || []).forEach((group) => {
      const partNum = String(group.part);
      const count = (group.questions || []).length;
      questionCountByPart[partNum] =
        (questionCountByPart[partNum] || 0) + count;
    });

    setParts((prev) =>
      prev.map((p) => ({
        ...p,
        questionCount: questionCountByPart[String(p.id)] || 0,
      })),
    );
  };

  // ===== View part detail (READ ONLY) =====
  const handleSelectPart = (part) => {
    if (!data.id) return;

    const isGroupPart = part.id === 3 || part.id === 4 || part.id === 7;

    const examData = window.__toeicExamData || {};
    const partQuestions = (examData.questions || []).filter(
      (q) => String(q.part) === String(part.id),
    );

    if (isGroupPart) {
      const partGroups = (examData.groupQuestions || []).filter(
        (g) => String(g.part) === String(part.id),
      );

      navigate(`/PartDetailGroup/${data.id}/parts/${part.id}/group`, {
        state: {
          examName: data.title,
          durationMinutes: duration,
          partLabel: part.label,
          mode: "GROUP",
          partQuestions,
          partGroups,
          isAdmin: true, // 🔴 IMPORTANT
        },
      });
    } else {
      navigate(`/PartDetail/${data.id}/parts/${part.id}/single`, {
        state: {
          examName: data.title,
          durationMinutes: duration,
          partLabel: part.label,
          mode: "SINGLE",
          partQuestions,
          isAdmin: true, // 🔴 IMPORTANT
        },
      });
    }
  };

  // ===== Loading =====
  if (isLoading) {
    return (
      <div className="detail-custom-exam detail-custom-exam--loading">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Đang tải dữ liệu đề thi..."
        />
      </div>
    );
  }

  return (
    <>
      <div className="detail-custom-exam">
        {/* ===== HERO ===== */}
        <div className="detail-custom-exam__hero">
          <div className="detail-custom-exam__hero-left">
            <button
              className="detail-custom-exam__back-btn"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
            <h2 className="detail-custom-exam__title-text">{data.title}</h2>

            <p className="detail-custom-exam__subtitle">
              Thời gian: <strong>{duration} phút</strong>
            </p>
          </div>
        </div>

        {/* ===== PARTS ===== */}
        <div className="detail-custom-exam__content">
          <div className="detail-custom-exam__parts">
            {parts.map((part) => (
              <button
                key={part.id}
                className="detail-custom-exam__part-row"
                onClick={() => handleSelectPart(part)}
              >
                <div className="detail-custom-exam__part-left">
                  <div className="detail-custom-exam__part-index">
                    {part.id}
                  </div>
                  <div className="detail-custom-exam__part-text">
                    <span className="detail-custom-exam__part-label">
                      {part.label}
                    </span>
                    <span className="detail-custom-exam__part-count">
                      {part.questionCount} Câu hỏi
                    </span>
                  </div>
                </div>
                <div className="detail-custom-exam__part-info">
                  <span className="detail-custom-exam__info-icon">i</span>
                </div>
              </button>
            ))}
          </div>

          {/* ===== GUIDE ===== */}
          <div className="detail-custom-exam__teaser">
            <div className="detail-custom-exam__teaser-card">
              <div className="detail-custom-exam__teaser-media">
                <CanvasExamGuide />
              </div>

              <p className="detail-custom-exam__teaser-note">
                Admin chỉ có quyền xem nội dung đề để kiểm duyệt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
