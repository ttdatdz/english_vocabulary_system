import "./ChangePasswordForm.scss";
import { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import { showSuccess } from "../../utils/alertHelper";
const { Option } = Select;
export default function ChangePasswordForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsEditing(false); // quay lại chế độ xem
      showSuccess("Đổi mật khẩu thành công!"); // Hiển thị thông báo thành công
    }, 2000);
  };

  const onCancel = () => {
    setIsEditing(false);
    form.resetFields(); // Reset lại giá trị form về ban đầu
    setFileList([]);
    setPreviewUrl(null);
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
    const file = fileList[0]?.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onGenderChange = (value) => {
    form.setFieldsValue({ gender: value });
  };
  return (
    <>
      <Form
        className="PersonalInformationForm"
        form={form}
        name="basic"
        labelAlign="left"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        style={{ maxWidth: 1300 }}
        initialValues={{}}
        onFinish={onFinish}
        autoComplete="off"
        // Khóa tất cả input khi không chỉnh sửa
      >
        <Row gutter={24}>
          <Col span={14}>
            <Form.Item
              label="Mật khẩu cũ"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password disabled={!isEditing} />
            </Form.Item>
          </Col>

          {isEditing && (
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 0 }} // không có label
                wrapperCol={{ offset: 8, span: 24 }} // canh thẳng hàng với input
              >
                <div className="UserForm__Contain-Button">
                  <Button
                    className="UserForm__Cancel"
                    danger
                    onClick={onCancel}
                  >
                    Hủy
                  </Button>
                  <Button
                    loading={loading}
                    className="UserForm__Accept"
                    type="primary"
                    htmlType="submit"
                  >
                    Xác nhận
                  </Button>
                </div>
              </Form.Item>
            </Col>
          )}
          {!isEditing && (
            <Col span={24}>
              <Button
                className="ButtonIsEdit"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Đổi mật khẩu
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </>
  );
}
