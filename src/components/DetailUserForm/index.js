import { useState } from "react";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import "./DetailUserForm.scss";
import dayjs from "dayjs";
import { Button, Col, DatePicker, Form, Input, Row, Upload } from "antd";
import { UpdateUser } from "../../services/User/userService";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function DetailUserForm(props) {
  const { onOk, confirmLoading, selectedUser } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  const initialValues = {
    ...selectedUser,
    birthday: selectedUser?.birthday ? dayjs(selectedUser.birthday) : null,
  };
  const [form] = Form.useForm();

  const fetchData = async (values) => {
    try {
      // Xử lý ngày sinh về dạng string nếu cần
      const data = {
        ...values,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
        id: selectedUser.id, // Thêm id vào data gửi lên
      };
      console.log(">>>>check data:", data);
      const result = await UpdateUser(data);
      if (result) {
        showSuccess("Cập nhật thành công!");
        setIsEditing(false);
        onOk();
      } else {
        showErrorMessage("Cập nhật thất bại!");
      }
    } catch (error) {
      showErrorMessage(error.message || "Cập nhật thất bại!");
    }
  };

  const validateData = (values) => {
    const now = dayjs();
    const minDate = now.subtract(5, "year");
    if (values.birthday.isAfter(now)) {
      showErrorMessage("Ngày sinh phải nhỏ hơn ngày hiện tại!");
      return false;
    }
    if (values.birthday.isAfter(minDate)) {
      showErrorMessage("Tuổi phải lớn hơn 5!");
      return false;
    }
    // Kiểm tra năm sinh phải lớn hơn 1969
    if (values.birthday.year() <= 1969) {
      showErrorMessage("Năm sinh phải lớn hơn 1969!");
      return false;
    }
    // Số điện thoại
    if (!/^0\d{9}$/.test(values.phoneNumber || "")) {
      showErrorMessage("Số điện thoại phải có 10 số và bắt đầu bằng 0!");
      return false;
    }
    // Địa chỉ
    if (!values.address) {
      showErrorMessage("Vui lòng nhập địa chỉ!");
      return false;
    }
    // Email
    if (!/^[\w-\.]+@gmail\.com$/.test(values.email || "")) {
      showErrorMessage("Email phải có dạng @gmail.com!");
      return false;
    }
    // Tài khoản
    if (!values.accountName) {
      showErrorMessage("Vui lòng nhập tài khoản!");
      return false;
    }

    return true;
  };

  const onFinish = (values) => {
    console.log(">>>>>>>check values:", values);
    if (!validateData(values)) return;
    fetchData(values);
  };

  const onCancel = () => {
    setIsEditing(false);
    form.resetFields();
    setFileList([]);
    setPreviewUrl(null);
  };
  // Xử lý upload avatar
  const handleAvatarChange =
    (setFileList, setPreviewUrl) =>
    ({ fileList }) => {
      setFileList(fileList);
      const file = fileList[0]?.originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      }
    };
  return (
    <>
      <Form
        className="UserForm"
        form={form}
        name="basic"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 750 }}
        initialValues={initialValues}
        onFinish={onFinish}
        autoComplete="off"
        disabled={!isEditing}
      >
        <Row gutter={24}>
          <Col span={14}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Tài khoản"
              name="accountName"
              rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
            >
              <Input autoComplete="username" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password">
              <Input.Password autoComplete="current-password" />
            </Form.Item>
          </Col>
          <Col span={10} className="UserForm__Avatar-Col">
            <Form.Item
              name="avatar"
              className="UserForm__Avatar-FormItem"
              wrapperCol={{ span: 24 }}
            >
              {isEditing ? (
                <div className="UserForm__Avatar-EditBlock">
                  <img
                    src={
                      previewUrl ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                    }
                    alt="avatar"
                    className="UserForm__Avatar-Img"
                  />

                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleAvatarChange(setFileList, setPreviewUrl)}
                  >
                    <Button
                      className="UserForm__ChangeAvatarBtn"
                      icon={<PlusOutlined />}
                    >
                      Chỉnh ảnh
                    </Button>
                  </Upload>
                </div>
              ) : (
                <img
                  src={
                    previewUrl ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                  }
                  alt="avatar"
                  className="UserForm__Avatar-Img"
                />
              )}
            </Form.Item>
          </Col>

          {isEditing && (
            <Col span={24}>
              <Form.Item wrapperCol={{ offset: 8, span: 24 }}>
                <div className="UserForm__Contain-Button">
                  <Button
                    className="UserForm__Cancel"
                    danger
                    onClick={onCancel}
                  >
                    Hủy
                  </Button>
                  <Button
                    loading={confirmLoading}
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
        </Row>
      </Form>

      {!isEditing && (
        <Button
          className="ButtonIsEdit"
          icon={<EditOutlined />}
          onClick={() => setIsEditing(true)}
        >
          Chỉnh sửa thông tin
        </Button>
      )}
    </>
  );
}
