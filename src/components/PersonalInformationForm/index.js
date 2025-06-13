import "./PersonalInformationForm.scss";
import { useState, useEffect } from "react";
import { getWithParams, putFormData } from "../../utils/request";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Upload,
} from "antd";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";
import dayjs from "dayjs";
import { useAuth } from "../../utils/AuthContext";

const { Option } = Select;
export default function PersonalInformationForm(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [initialValues, setInitialValues] = useState({});

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form] = Form.useForm();
  const { updateUser } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userID = localStorage.getItem("userId");
        const accountName = localStorage.getItem("accountName");

        const data = await getWithParams("api/user/getUserByFilter", {
          userID,
          accountName,
        });

        if (data) {
          const initVals = {
            avatar: data?.avatar,
            fullName: data.fullName,
            birthday: dayjs(data.birthday),
            email: data.email,
            accountName: data.accountName,
            phoneNumber: data?.phoneNumber,
            address: data?.address,
          };
          form.setFieldsValue(initVals);
          setInitialValues(initVals);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserInfo();
  }, []);

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
    if (values.birthday.year() <= 1969) {
      showErrorMessage("Năm sinh phải lớn hơn 1969!");
      return false;
    }
    if (!/^0\d{9}$/.test(values.phoneNumber || "")) {
      showErrorMessage("Số điện thoại phải có 10 số và bắt đầu bằng 0!");
      return false;
    }
    if (!values.address) {
      showErrorMessage("Vui lòng nhập địa chỉ!");
      return false;
    }
    if (!/^[\w-\.]+@gmail\.com$/.test(values.email || "")) {
      showErrorMessage("Email phải có dạng @gmail.com!");
      return false;
    }
    if (!values.accountName) {
      showErrorMessage("Vui lòng nhập tài khoản!");
      return false;
    }

    return true;
  };

  const onFinish = async (values) => {
    if (!validateData(values)) return;
    setLoading(true);
    try {
      const formData = new FormData();

      const updateData = {
        fullName: values.fullName,
        birthday: values.birthday?.format("YYYY-MM-DD"),
        email: values.email,
        accountName: values.accountName,
        phoneNumber: values.phoneNumber,
        address: values.address,
      };

      formData.append("dataJson", JSON.stringify(updateData));
      if (fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }
      console.log(">>>>check formData:", formData);
      await putFormData("api/user/updateProfile", formData);

      // Fetch lại thông tin người dùng và cập nhật AuthContext
      const updatedData = await getWithParams("api/user/getUserByFilter", {
        userID: localStorage.getItem("userId"),
        accountName: localStorage.getItem("accountName"),
      });
      if (updatedData) {
        const newInitialValues = {
          avatar: updatedData?.avatar,
          fullName: updatedData.fullName,
          birthday: dayjs(updatedData.birthday),
          email: updatedData.email,
          accountName: updatedData.accountName,
          phoneNumber: updatedData?.phoneNumber,
          address: updatedData?.address,
        };
        setInitialValues(newInitialValues);
        form.setFieldsValue(newInitialValues);
        if (updateUser) updateUser(updatedData); // Cập nhật user trong AuthContext
      }

      showSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setFileList([]);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error.message);
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

  const handleChange = ({ fileList }) => {
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
              rules={[
                { required: true, message: "Vui lòng nhập tên tài khoản!" },
              ]}
            >
              <Input disabled={!isEditing} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
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
                    src={
                      previewUrl ||
                      form.getFieldValue("avatar") ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                    }
                    alt="avatar"
                    className="UserForm__Avatar-Img"
                  />

                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleChange}
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
                    form.getFieldValue("avatar") ||
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
                Chỉnh sửa thông tin
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </>
  );
}
