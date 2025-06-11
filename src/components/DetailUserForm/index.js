import { useEffect, useState } from "react";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import "./DetailUserForm.scss";
import dayjs from "dayjs";
import { Button, Col, DatePicker, Form, Input, Row, Upload } from "antd";
import { GetDetailUser, UpdateUser } from "../../services/User/userService";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function DetailUserForm(props) {
  const {
    onOk,
    confirmLoading,
    selectedUser,
    setConfirmLoading,
    reloadUser,
    setSelectedUser,
  } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  console.log(">>>>>>>>check selectedUser", selectedUser);
  const initialValues = {
    ...selectedUser,
    birthday: selectedUser?.birthday ? dayjs(selectedUser.birthday) : null,
  };
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedUser) {
      // Cập nhật lại form khi selectedUser thay đổi
      form.setFieldsValue({
        ...selectedUser,
        birthday: selectedUser.birthday ? dayjs(selectedUser.birthday) : null,
      });

      // Cập nhật lại preview avatar nếu có
      if (selectedUser.avatar) {
        setPreviewUrl(selectedUser.avatar);
      }
    }
  }, [selectedUser, form]);
  const fetchData = async (values) => {
    setConfirmLoading(true);
    try {
      // Xử lý ngày sinh về dạng string nếu cần
      // Format lại ngày sinh
      const formattedBirthday = values.birthday
        ? values.birthday.format("YYYY-MM-DD")
        : null;

      // Tạo object chứa toàn bộ dữ liệu người dùng (trừ ảnh)
      const data = {
        id: selectedUser.id,
        fullName: values.fullName,
        birthday: formattedBirthday,
        phoneNumber: values.phoneNumber,
        address: values.address,
        email: values.email,
        accountName: values.accountName,
        password: values.password, // có thể kiểm tra nếu muốn bỏ qua khi rỗng
      };

      const formData = new FormData();
      formData.append("dataJson", JSON.stringify(data));
      // Gắn ảnh nếu có
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }
      console.log(">>>>check data:", data);
      const result = await UpdateUser(formData);
      if (result) {
        setConfirmLoading(false);
        setIsEditing(false);
        showSuccess("Cập nhật User thành công!");
        const resultDetail = await GetDetailUser(selectedUser.id);
        setSelectedUser(resultDetail);
        reloadUser();
      } else {
        // showErrorMessage("Cập nhật thất bại!");
        setConfirmLoading(false);
        return;
      }
    } catch (error) {
      showErrorMessage(error.message || "Cập nhật User thất bại!");
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
    setPreviewUrl(selectedUser?.avatar || null);
  };
  // Xử lý upload avatar
  const handleAvatarChange = ({ fileList }) => {
    // Chỉ giữ lại file cuối cùng nếu có
    const newFileList =
      fileList.length > 0 ? [fileList[fileList.length - 1]] : [];
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.onerror = () => {
        setPreviewUrl(selectedUser?.avatar || null);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setPreviewUrl(selectedUser?.avatar || null);
    }
  };
  console.log(">>>>>>Check previewUrl", previewUrl);
  console.log(">>>>>>>>>>>.check fileList", fileList);
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
                    onChange={handleAvatarChange}
                    maxCount={1} // Thêm dòng này
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
