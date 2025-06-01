import { useState, useEffect } from "react"; // Thêm useEffect ở đây
import { Button, Input, Rate, Form, Image } from "antd";
import "./DetailFeedbackForm.scss";
import { EditOutlined } from "@ant-design/icons";

export default function DetailFeedbackForm({ feedback, onReply }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  // Đặt useEffect ở đầu hàm component, không nằm trong điều kiện nào
  useEffect(() => {
    form.resetFields();
    setIsEditing(false);
  }, [feedback, form]);

  if (!feedback) return null; // Đặt sau hook

  const onFinish = (values) => {
    console.log("Success:", values);

    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setIsEditing(false); // Gửi xong thì quay lại chế độ xem
    }, 2000);
  };
  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  return (
    <div className="DetailFeedbackForm">
      <div className="DetailFeedbackForm__info">
        <div className="DetailFeedbackForm__header">
          <div>
            <strong>
              {feedback.userName} ({feedback.email})
            </strong>
          </div>
          <div>{feedback.date}</div>
        </div>
        <div style={{ margin: "8px 0" }}>
          <Rate disabled value={feedback.rating} />
        </div>
        <div className="DetailFeedbackForm__content">{feedback.content}</div>
        {feedback.image && (
          <div className="DetailFeedbackForm__image">
            <Image width={120} src={feedback.image} />
          </div>
        )}
      </div>
      <div className="DetailFeedbackForm__reply" style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ reply: "" }}
        >
          <Form.Item
            label="Phản hồi người dùng:"
            name="reply"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung phản hồi!" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung phản hồi..."
              disabled={!isEditing}
            />
          </Form.Item>
          {!isEditing && (
            <Button
              className="ButtonIsEdit"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa thông tin phản hồi
            </Button>
          )}
          {isEditing && (
            <div className="UserForm__Contain-Button">
              <Button
                danger
                onClick={handleCancel}
                className="UserForm__Cancel"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="UserForm__Accept"
                loading={confirmLoading}
              >
                Xác nhận
              </Button>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
