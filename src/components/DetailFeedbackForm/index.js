import { useState, useEffect } from "react"; // Thêm useEffect ở đây
import { Button, Input, Rate, Form, Image } from "antd";
import "./DetailFeedbackForm.scss";
import { EditOutlined } from "@ant-design/icons";
import { UpdateEvaluate } from "../../services/Evaluate/evaluateService";
import { showSuccess } from "../../utils/alertHelper";

export default function DetailFeedbackForm({ feedback, onReply }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  console.log("feedback", feedback);
  // Đặt useEffect ở đầu hàm component, không nằm trong điều kiện nào
  useEffect(() => {
    if (feedback) {
      form.setFieldsValue({
        adminReply: feedback.adminReply || "", // set giá trị cho trường adminReply
      });
      setIsEditing(false);
    }
  }, [feedback, form]);

  if (!feedback) return null; // Đặt sau hook

  const onFinish = async (values) => {
    console.log("values", values);
    try {
      setConfirmLoading(true);
      const result = await UpdateEvaluate(values, feedback.id);
      if (!result) {
        setTimeout(() => {
          setConfirmLoading(false);
        }, 2000);
        return;
      } else {
        setTimeout(() => {
          setConfirmLoading(false);
          setIsEditing(false);
          showSuccess("Cập nhật phản hồi thành công!");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi cập nhật phản hồi:", error);
    }
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
              {feedback.fullName} ({feedback.email})
            </strong>
          </div>
          <div>{feedback.date}</div>
        </div>
        <div style={{ margin: "8px 0" }}>
          <Rate disabled value={feedback.star} />
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
          initialValues={feedback}
        >
          <Form.Item
            label="Phản hồi người dùng:"
            name="adminReply"
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
