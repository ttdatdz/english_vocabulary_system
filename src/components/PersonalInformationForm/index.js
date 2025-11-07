// src/components/PersonalInformationForm/PersonalInformationForm.jsx
import "./PersonalInformationForm.scss";
import React, { useState, useEffect } from "react";
import { get, putFormData } from "../../utils/request";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useAuth } from "../../utils/AuthContext";
import DefaultImage from "../../assets/images/user.png"; // đổi lại path nếu khác
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function PersonalInformationForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form] = Form.useForm();
  const { updateUser } = useAuth();

  // ===== Fetch thông tin user khi vào trang =====
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const data = await get(`/api/user/getUserByFilter?userID=${userId}`, true);
        if (data) {
          const initVals = {
            avatar: data?.avatar || "",
            fullName: data?.fullName || "",
            birthday: data?.birthday ? dayjs(data.birthday) : null,
            email: data?.email || "",
            accountName: data?.accountName || "",
            phoneNumber: data?.phoneNumber || "",
            address: data?.address || "",
          };
          setInitialValues(initVals);
          form.setFieldsValue(initVals);
        }
      } catch (error) {
        // Nếu request wrapper đã toast lỗi, tránh toast 2 lần.
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserInfo();
  }, [form]);

  // ===== Validate form trước khi gửi =====
  const validateData = (values) => {
    const now = dayjs();
    const minDate = now.subtract(5, "year");

    if (!values.fullName) return false;
    if (!values.accountName) return false;
    if (!values.email) return false;

    if (!values.birthday) return false;
    if (values.birthday.isAfter(now)) return false;           // ngày sinh không được ở tương lai
    if (values.birthday.isAfter(minDate)) return false;       // tuổi > 5
    if (values.birthday.year() <= 1969) return false;         // theo rule của bạn

    if (!/^0\d{9}$/.test(values.phoneNumber || "")) return false; // 10 số, bắt đầu 0
    if (!values.address) return false;
    if (!/^[\w-\.]+@gmail\.com$/.test(values.email || "")) return false; // phải @gmail.com

    return true;
  };

  // ===== Submit cập nhật =====
  const onFinish = async (values) => {
    if (!validateData(values)) return;

    setLoading(true);
    try {
      const formData = new FormData();

      // Backend đang @RequestPart("dataJson") String
      const payload = {
        fullName: values.fullName,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
        email: values.email,
        accountName: values.accountName,
        phoneNumber: values.phoneNumber,
        address: values.address,
      };
      formData.append("dataJson", JSON.stringify(payload));

      if (fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      // ✅ Nếu API lỗi, putFormData sẽ throw → nhảy xuống catch
      await putFormData("/api/user/updateProfile", formData, true);

      // Fetch lại thông tin user sau khi update
      const userId = localStorage.getItem("userId");
      if (userId) {
        const updatedData = await get(`/api/user/getUserByFilter?userID=${userId}`, true);
        if (updatedData) {
          const newInitialValues = {
            avatar: updatedData?.avatar || "",
            fullName: updatedData?.fullName || "",
            birthday: updatedData?.birthday ? dayjs(updatedData.birthday) : null,
            email: updatedData?.email || "",
            accountName: updatedData?.accountName || "",
            phoneNumber: updatedData?.phoneNumber || "",
            address: updatedData?.address || "",
          };
          setInitialValues(newInitialValues);
          form.setFieldsValue(newInitialValues);
          updateUser?.(updatedData);
        }
      }

      // Toast success nằm trong nơi bạn gọi (showSuccess) nếu muốn,
      showSuccess("Cập nhật thông tin thành công")
      // còn ở đây chỉ reset state UI:
      setIsEditing(false);
      setFileList([]);
      setPreviewUrl(null);
    } catch (error) {
      // putFormData đã showErrorMessage(error.message); nên ở đây tránh toast lần 2
      showErrorMessage("Cập nhật thất bại:" + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(initialValues);
    setFileList([]);
    setPreviewUrl(null);
  };

  const handleChange = ({ fileList: fl }) => {
    setFileList(fl);
    const file = fl[0]?.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <Form
      className="PersonalInformationForm"
      form={form}
      name="PersonalInformationForm"
      labelAlign="left"
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
      style={{ maxWidth: "100%" }}
      initialValues={{}}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Row gutter={24}>
        <Col span={14}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="birthday"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker disabled={!isEditing} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Tên tài khoản"
            name="accountName"
            rules={[{ required: true, message: "Vui lòng nhập tên tài khoản!" }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input disabled={!isEditing} />
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
                  src={previewUrl || form.getFieldValue("avatar") || DefaultImage}
                  alt="avatar"
                  className="UserForm__Avatar-Img"
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleChange}
                >
                  <Button className="UserForm__ChangeAvatarBtn" icon={<PlusOutlined />}>
                    Chỉnh ảnh
                  </Button>
                </Upload>
              </div>
            ) : (
              <img
                src={form.getFieldValue("avatar") || DefaultImage}
                alt="avatar"
                className="UserForm__Avatar-Img"
              />
            )}
          </Form.Item>
        </Col>

        {isEditing ? (
          <Col span={24}>
            <Form.Item wrapperCol={{ offset: 8, span: 24 }}>
              <div className="UserForm__Contain-Button">
                <Button className="UserForm__Cancel" danger onClick={onCancel}>
                  Hủy
                </Button>
                <Button loading={loading} className="UserForm__Accept" type="primary" htmlType="submit">
                  Xác nhận
                </Button>
              </div>
            </Form.Item>
          </Col>
        ) : (
          <Col span={24}>
            <Button className="ButtonIsEdit" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Chỉnh sửa thông tin
            </Button>
          </Col>
        )}
      </Row>
    </Form>
  );
}
