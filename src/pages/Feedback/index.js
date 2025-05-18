
import "./Feedback.scss";
import React from 'react';
import { Button, Checkbox, Form, Input, Progress, Rate, Upload } from 'antd';
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, StarFilled } from "@ant-design/icons"
import CardItemFeedback from "../../components/CardItemFeedback";

export default function Feedback() {


    const onFinish = values => {
        console.log('Success:', values);
    };
    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };
    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e === null || e === void 0 ? void 0 : e.fileList;
    };
    return (
        <>
            <div className="feedback-page">
                <div className="MainContainer">
                    <div>
                        <h2>Chia sẻ đánh giá của bạn</h2>
                        <Form
                            name="basic"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ maxWidth: 1600 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Nhận xét"
                                name="username"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <TextArea rows={4} />

                            </Form.Item>

                            <Form.Item
                                label="Số sao"
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Rate />
                            </Form.Item>
                            <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile}>
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

                            <Form.Item label={null}>
                                <Button type="primary" htmlType="submit">
                                    Gửi đánh giá
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                    <div>
                        <h2>Đánh giá từ người dùng</h2>
                        <div>
                            <div>
                                <p>Tổng quan</p>
                                <p className="score">
                                    <StarFilled style={{ color: "#f59e0b" }} /> 4.8
                                </p>
                                <p className="total">/ 5</p>
                                <p className="count">44 nhận xét</p>
                            </div>
                            <div>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="bar-row">
                                        <span>{star} ★</span>
                                        <Progress
                                            percent={100}
                                            strokeColor="#f97316"
                                            showInfo={false}
                                        />
                                        <span>100%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <CardItemFeedback />
                            <CardItemFeedback />
                            <CardItemFeedback />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}