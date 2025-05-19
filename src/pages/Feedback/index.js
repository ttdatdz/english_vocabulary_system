import "./Feedback.scss";
import React, { useState } from 'react';

import { Button, Col, Form, Input, Progress, Rate, Row, Upload } from 'antd';
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, StarFilled } from "@ant-design/icons";
import CardItemFeedback from "../../components/CardItemFeedback";

export default function Feedback() {
    const [showForm, setShowForm] = useState(true);
    // const [submittedFeedback, setSubmittedFeedback] = useState(null);
    const [submittedFeedback, setSubmittedFeedback] = useState({
        userName: "Nguyễn Văn A",
        userAvatar: "/path/to/avatar.jpg",
        rating: 5,
        comment: "Dịch vụ rất tuyệt vời!",
        images: [], // hoặc mảng file upload
        time: "19/05/2025 10:34",

        reply: "Cảm ơn bạn rất nhiều!",
        replyTime: "19/05/2025 11:00",
    });
    const onFinish = values => {
        setSubmittedFeedback({
            comment: values.comment,
            rating: values.rating,
            images: values.upload || [],
            reply: "Cảm ơn bạn rất nhiều!", // Giả sử admin chưa trả lời
        });
        setShowForm(false); // Ẩn form sau khi gửi
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    const normFile = e => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };
    const renderUserFeedback = () => {
        if (!submittedFeedback) return null;

        return (
            <div className="user-feedback">
                <div className="user-feedback__content">
                    {/* Avatar + Header */}
                    <div className="user-feedback__header">
                        <img
                            src={submittedFeedback.userAvatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"}
                            alt="User Avatar"
                            className="user-feedback__avatar"
                        />
                        <div className="user-feedback__info">
                            <span className="user-feedback__name">{submittedFeedback.userName || "Người dùng ẩn danh"}</span>
                            <span className="user-feedback__time">{submittedFeedback.time || "Vừa xong"}</span>
                        </div>
                    </div>

                    {/* Rating + Comment */}
                    <Rate disabled value={submittedFeedback.rating} style={{ fontSize: 20 }} />
                    <p className="user-feedback__comment">{submittedFeedback.comment}</p>

                    {/* Uploaded Images */}
                    <div className="user-feedback__images">
                        {submittedFeedback.images?.map((file, idx) => (
                            <img
                                key={idx}
                                src={file.thumbUrl || file.url}
                                alt="feedback"
                                style={{ width: 80, marginRight: 8, borderRadius: 4 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Admin Reply */}
                {submittedFeedback.reply && (
                    <div className="user-feedback__reply">
                        <div className="user-feedback__header">
                            <img
                                src="https://png.pngtree.com/png-vector/20230316/ourmid/pngtree-admin-and-customer-service-job-vacancies-vector-png-image_6650726.png"
                                alt="Admin Avatar"
                                className="user-feedback__avatar"
                            />
                            <div className="user-feedback__info">
                                <span className="user-feedback__name">Admin</span>
                                <span className="user-feedback__time">{submittedFeedback.replyTime || "1 giờ trước"}</span>
                            </div>
                        </div>
                        <p className="user-feedback__comment">{submittedFeedback.reply}</p>
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
                        {showForm ? (<Form
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
                                        name="comment"
                                        wrapperCol={{ span: 24 }}
                                        rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                                    >
                                        <TextArea rows={4} placeholder="Nhập nội dung đánh giá" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[20, 20]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Số sao"
                                        name="rating"
                                        rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
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
                                                style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
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
                                        <Button className="feedback__btnSendFeedback" type="primary" htmlType="submit">
                                            Gửi đánh giá
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>

                        </Form>) : (renderUserFeedback())}

                    </div>

                    <div className="feedback__review-section">
                        <h2 className="feedback__title">Đánh giá từ người dùng</h2>
                        <div className="feedback__overview">
                            <div className="feedback__summary">
                                <p className="feedback__label">Tổng quan</p>
                                <div className="feedback__ratio">
                                    <p className="feedback__score">
                                        <StarFilled style={{ color: "#f59e0b" }} /> 4.8
                                    </p>
                                    <p className="feedback__max">/ 5</p>
                                </div>

                                <p className="feedback__count">44 nhận xét</p>
                            </div>
                            <div className="feedback__bars">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="feedback__bar-row">
                                        <span className="feedback__bar-label">{star} <StarFilled style={{ color: "#f59e0b" }} /></span>
                                        <Progress
                                            percent={100}
                                            strokeColor="#f97316"
                                            showInfo={false}
                                            className="feedback__progress"
                                        />
                                        <span className="feedback__bar-percent">100%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="feedback__list">
                            <CardItemFeedback />
                            <CardItemFeedback />
                            <CardItemFeedback />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
