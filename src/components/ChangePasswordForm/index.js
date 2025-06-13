import "./ChangePasswordForm.scss";
import { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import { showSuccess, showErrorMessage } from "../../utils/alertHelper";
import { post, put } from "../../utils/request";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const { Option } = Select;
export default function ChangePasswordForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { logout } = useAuth();
  const validateData = (values) => {
    // Mật khẩu
    if (values.newPassword.length < 5) {
      showErrorMessage("Mật khẩu mới phải có ít nhất 5 ký tự!");
      return false;
    }
    return true;
  };
  const onFinish = async (values) => {
    if (!validateData(values)) return;
    setLoading(true);
    try {
      const updateData = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
      const data = await post(updateData, "/api/user/reset-password", true);
      if (data) {
        setLoading(false);
        showSuccess("Cập nhật thông tin thành công!");
        setIsEditing(false);
        form.resetFields();
        logout();
        navigate("/Login");
      } else {
        // const test = data.
        // json();
        // showErrorMessage("Có lỗi xảy ra khi đổi mật khẩu", test.detail);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error.message);
    }
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
        className="ChangePasswordForm"
        form={form}
        name="ChangePasswordForm"
        labelAlign="left"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        style={{ maxWidth: "100%" }}
        initialValues={{}}
        onFinish={onFinish}
        autoComplete="off"
        // Khóa tất cả input khi không chỉnh sửa
      >
        <Row gutter={24}>
          <Col span={14}>
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
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
