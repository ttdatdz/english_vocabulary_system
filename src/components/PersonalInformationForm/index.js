import "./PersonalInformationForm.scss";
import { useState, useEffect } from "react";
import { getWithParams , put} from "../../utils/request";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Upload,
} from "antd";
import { showSuccess } from "../../utils/alertHelper";
import dayjs from "dayjs";

const { Option } = Select;
export default function PersonalInformationForm(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [initialValues, setInitialValues] = useState({});

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form] = Form.useForm();

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
            fullName: data.fullName,
            birthday: dayjs(data.birthday),
            email: data.email,
            accountName: data.accountName,
          };
          form.setFieldsValue(initVals);
          setInitialValues(initVals); // lưu lại
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        fullName: values.fullName,
        birthday: values.birthday?.format("YYYY-MM-DD"),
        email: values.email,
        accountName: values.accountName,
      };

      await put(updateData, "api/user/updateProfile");
      showSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(initialValues); // Reset lại giá trị form về ban đầu
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
        name="PersonalInformationForm"
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
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input disabled={!isEditing} />
            </Form.Item>

            {/* <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select
                disabled={!isEditing}
                placeholder="Chọn giới tính"
                onChange={onGenderChange}
                allowClear
              >
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item> */}

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

            {/* <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input disabled={!isEditing} />
            </Form.Item> */}

            {/* <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input disabled={!isEditing} />
            </Form.Item> */}

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
              wrapperCol={{ span: 24 }} // canh thẳng hàng với input
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
              <Form.Item
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
                Chỉnh sửa thông tin
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </>
  );
}
