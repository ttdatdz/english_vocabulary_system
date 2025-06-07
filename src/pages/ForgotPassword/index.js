import "./ForgotPassword.scss";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { post } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const validateData = (values) => {
    // Kiểm tra không được bỏ trống trường nào
    if (!values.email || !values.accountName) {
      showErrorMessage("Vui lòng nhập đầy đủ tất cả các trường!");
      return false;
    }
    // Email
    if (!/^[\w-\.]+@gmail\.com$/.test(values.email)) {
      showErrorMessage("Email phải có dạng @gmail.com!");
      return false;
    }
    return true;
  };
  const onFinish = async (values) => {
    if (!validateData(values)) {
      return;
    }
    console.log(values.accountName);
    const data = await post(
      {
        email: values.email,
        accountName: values.accountName,
      },
      "api/user/forgot-password"
    );
    if (data?.success) {
      message.success("Đã gửi mã xác nhận đến email được đăng ký!");
      navigate("Login");
    } else message.error("Lỗi khi gửi email.");
  };
  return (
    <>
      <div className="ForgotPassword-page">
        <div className="ForgotPassword-page__container">
          <div className="ForgotPassword-page__left">
            <Link className="btnBack" to={"/Login"}>
              <IoMdArrowBack />
            </Link>
          </div>
          <div className="ForgotPassword-page__right">
            <h2 className="ForgotPassword-page__title">Quên mật khẩu</h2>
            <Form
              name="login-form"
              layout="vertical"
              onFinish={onFinish}
              className="ForgotPassword-page__form"
            >
              <Form.Item
                name="accountName"
                className="ForgotPassword-page__form-item"
              >
                <Input
                  className="ForgotPassword-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Tên đăng nhập"
                />
              </Form.Item>
              <Form.Item
                name="email"
                className="ForgotPassword-page__form-item"
              >
                <Input
                  className="ForgotPassword-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="ForgotPassword-page__submit"
                >
                  Gửi mật khẩu qua email
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
