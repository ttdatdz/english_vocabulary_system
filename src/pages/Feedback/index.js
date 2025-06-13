import "./Feedback.scss";
import React, { useEffect, useState } from "react";
import defaultImage from "../../../src/assets/images/user.png";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Pagination,
  Progress,
  Rate,
  Row,
  Select,
  Upload,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  PlusOutlined,
  StarFilled,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import CardItemFeedback from "../../components/CardItemFeedback";
import { del, get, postFormData } from "../../utils/request";
import {
  showErrorMessage,
  showSuccess,
  confirmDelete,
} from "../../utils/alertHelper";

export default function Feedback() {
  const [showForm, setShowForm] = useState(true);

  const [evaluates, setEvaluates] = useState([]);

  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [starFilter, setStarFilter] = useState("");
  const [sortOption, setSortOption] = useState("starDesc");

  const filteredEvaluates = evaluates.filter((e) => {
    return starFilter ? e.star === starFilter : true;
  });

  const sortedEvaluates = [...filteredEvaluates].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createAt) - new Date(a.createAt);
      case "oldest":
        return new Date(a.createAt) - new Date(b.createAt);
      case "starDesc":
        return b.star - a.star;
      case "starAsc":
        return a.star - b.star;
      default:
        return 0;
    }
  });
  const evaluateToShow = sortedEvaluates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const { Option } = Select;
  const loadUserFeedback = async () => {
    console.log("Check token ", localStorage.getItem("accessToken"));
    console.log("Check renewalToken:", localStorage.getItem("renewalToken"));
    try {
      const data = await fetch("http://143.198.83.161/api/evaluate/getByUser", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data.ok) {
        setSubmittedFeedback(await data.json());
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const loadEvaluates = async () => {
    const data = await get("api/evaluate/get");
    if (data) {
      const sortData = [...data].sort((a, b) => b.star - a.star);
      setEvaluates(sortData);
      console.log(sortData);
    }
  };
  useEffect(() => {
    loadUserFeedback();
    loadEvaluates();
  }, []);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          content: values.content,
          star: values.star,
        })
      ); // 👈 phần data JSON

      // Nếu có hình ảnh thì thêm vào formData
      const file = values.upload?.[0]?.originFileObj;
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          showErrorMessage("Ảnh không được vượt quá 10MB");
          return;
        }
        formData.append("image", file);
      }

      const result = await postFormData("api/evaluate/create", formData);
      if (result === true) {
        showSuccess("Gửi đánh giá thành công!");
        setShowForm(false); // Ẩn form sau khi gửi
        await loadEvaluates();
        await loadUserFeedback();
        renderUserFeedback();
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
    }
  };
  console.log("Check showform", showForm);
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };
  function calculateAverageStar(evaluates) {
    if (!evaluates.length) return 0;
    const totalStars = evaluates.reduce((sum, item) => sum + item.star, 0);
    return (totalStars / evaluates.length).toFixed(1); // Giữ 1 số thập phân
  }
  function getStarPercentages(evaluates) {
    const total = evaluates.length;
    const percentages = {};

    // Đếm số lượng từng sao
    for (let star = 1; star <= 5; star++) {
      const count = evaluates.filter((item) => item.star === star).length;
      percentages[star] = total === 0 ? 0 : Math.round((count / total) * 100);
    }

    return percentages; // {1: xx, 2: xx, 3: xx, 4: xx, 5: xx}
  }

  const percentages = getStarPercentages(evaluates);

  const handleDelete = async () => {
    const isConfirmed = await confirmDelete(
      "Bạn có muốn xóa bài đánh giá của bạn?"
    );
    if (isConfirmed) {
      if (submittedFeedback != null) {
        await del(`api/evaluate/delete/${submittedFeedback.id}`);
        message.success("Đã xóa bài đánh giá.");
        setSubmittedFeedback(null);
        setShowForm(true);
        renderUserFeedback();
        await loadEvaluates();
        await loadUserFeedback();
      }
    }
  };
  const renderUserFeedback = () => {
    if (!submittedFeedback) return null;

    return (
      <div className="user-feedback">
        <div className="user-feedback__content">
          {/* Avatar + Header */}
          <div className="user-feedback__header">
            <img
              src={submittedFeedback.avatar || defaultImage}
              alt="User Avatar"
              className="user-feedback__avatar"
            />
            <div
              className="user-feedback__info-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <div
                    className="user-feedback__name"
                    style={{ fontWeight: "bold" }}
                  >
                    {submittedFeedback.fullName || "Ẩn danh"}
                  </div>
                  <div
                    className="user-feedback__time"
                    style={{ color: "#888" }}
                  >
                    {submittedFeedback.createAt
                      ? new Date(submittedFeedback.createAt).toLocaleString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Thời gian không xác định"}
                  </div>
                </div>
              </div>
              <DeleteOutlined
                onClick={() => handleDelete()}
                style={{ color: "#ef4444", cursor: "pointer", fontSize: 20 }}
              />
            </div>
          </div>

          {/* Rating + Comment */}
          <Rate
            disabled
            value={submittedFeedback.star}
            style={{ fontSize: 20 }}
          />
          <p className="user-feedback__comment">{submittedFeedback.content}</p>

          {/* Uploaded Images */}
          <div className="user-feedback__images">
            {submittedFeedback.image && (
              <img
                src={submittedFeedback.image}
                alt="feedback"
                style={{ width: 80, marginRight: 8, borderRadius: 4 }}
              />
            )}
          </div>
        </div>

        {/* Admin Reply */}
        {submittedFeedback.adminReply && (
          <div className="user-feedback__reply">
            <div className="user-feedback__header">
              <img
                src="https://png.pngtree.com/png-vector/20230316/ourmid/pngtree-admin-and-customer-service-job-vacancies-vector-png-image_6650726.png"
                alt="Admin Avatar"
                className="user-feedback__avatar"
              />
              <div className="user-feedback__info">
                <span className="user-feedback__name">Admin</span>
                <span className="user-feedback__time">
                  {submittedFeedback.replyAt
                    ? new Date(submittedFeedback.replyAt).toLocaleString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Thời gian không xác định"}
                </span>
              </div>
            </div>
            <p className="user-feedback__comment">
              {submittedFeedback.adminReply}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="feedback">
      <div className="MainContainer">
        <div className="feedback__container">
          <div className="feedback__form-section">
            <h2 className="feedback__title">
              {showForm ? "Chia sẻ đánh giá của bạn" : "Đánh giá của bạn"}
            </h2>
            {showForm ? (
              <Form
                name="feedback-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                className="feedback__form"
              >
                <Row gutter={[20, 20]}>
                  <Col span={24}>
                    <Form.Item
                      label="Nhận xét"
                      name="content"
                      wrapperCol={{ span: 24 }}
                      rules={[
                        { required: true, message: "Vui lòng nhập nhận xét!" },
                      ]}
                    >
                      <TextArea rows={4} placeholder="Nhập nội dung đánh giá" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[20, 20]}>
                  <Col span={12}>
                    <Form.Item
                      label="Số sao"
                      name="star"
                      rules={[
                        { required: true, message: "Vui lòng chọn số sao!" },
                      ]}
                    >
                      <Rate style={{ fontSize: 26 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Hình ảnh"
                      name="upload"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload action="/upload.do" listType="picture-card">
                        <button
                          style={{
                            color: "inherit",
                            cursor: "inherit",
                            border: 0,
                            background: "none",
                          }}
                          type="button"
                        >
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[20, 20]}>
                  <Col span={24}>
                    <Form.Item wrapperCol={{ span: 24 }}>
                      <Button
                        className="feedback__btnSendFeedback"
                        type="primary"
                        htmlType="submit"
                      >
                        Gửi đánh giá
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            ) : (
              renderUserFeedback()
            )}
          </div>

          <div className="feedback__review-section">
            <h2 className="feedback__title">Đánh giá từ người dùng</h2>
            <div className="feedback__overview">
              <div className="feedback__summary">
                <p className="feedback__label">Tổng quan</p>
                <div className="feedback__ratio">
                  <p className="feedback__score">
                    <StarFilled style={{ color: "#f59e0b" }} />{" "}
                    {calculateAverageStar(evaluates)}
                  </p>
                  <p className="feedback__max">/ 5</p>
                </div>

                <p className="feedback__count">{evaluates.length} nhận xét</p>
              </div>
              <div className="feedback__bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="feedback__bar-row">
                    <span className="feedback__bar-label">
                      {star} <StarFilled style={{ color: "#f59e0b" }} />
                    </span>
                    <Progress
                      percent={percentages[star]}
                      strokeColor="#f97316"
                      showInfo={false}
                      className="feedback__progress"
                    />
                    <span className="feedback__bar-percent">
                      {percentages[star]} %
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginBottom: 20,
                marginTop: 20,
              }}
            >
              <Select
                defaultValue=""
                style={{ width: 160 }}
                onChange={(value) => setStarFilter(value)}
              >
                <Option value="">Tất cả số sao</Option>
                <Option value={5}>5 sao</Option>
                <Option value={4}>4 sao</Option>
                <Option value={3}>3 sao</Option>
                <Option value={2}>2 sao</Option>
                <Option value={1}>1 sao</Option>
              </Select>

              <Select
                defaultValue="starDesc"
                style={{ width: 160 }}
                onChange={(value) => setSortOption(value)}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="oldest">Cũ nhất</Option>
                <Option value="starDesc">Sao cao nhất</Option>
                <Option value="starAsc">Sao thấp nhất</Option>
              </Select>
            </div>

            <div className="feedback__list">
              {!evaluates || evaluates.length === 0 ? (
                <div>Chưa có đánh giá nào</div>
              ) : (
                evaluateToShow.map((item) => <CardItemFeedback data={item} />)
              )}
            </div>
            <Pagination
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
              current={currentPage}
              pageSize={pageSize}
              total={evaluateToShow.length}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
