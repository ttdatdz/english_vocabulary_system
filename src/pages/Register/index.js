import "./Register.scss";
import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

import { post } from "../../utils/request";
import { useState } from "react";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function Register() {
  const navigate = useNavigate();
  const validateData = (values) => {
    // Kiểm tra không được bỏ trống trường nào
    if (
      !values.fullName ||
      !values.email ||
      !values.phoneNumber ||
      !values.accountName ||
      !values.passWord
    ) {
      showErrorMessage("Vui lòng nhập đầy đủ tất cả các trường!");
      return false;
    }
    // Email
    if (!/^[\w-\.]+@gmail\.com$/.test(values.email)) {
      showErrorMessage("Email phải có dạng @gmail.com!");
      return false;
    }
    // Số điện thoại
    if (!/^0\d{9}$/.test(values.phoneNumber)) {
      showErrorMessage("Số điện thoại phải có 10 số và bắt đầu bằng 0!");
      return false;
    }
    // Tài khoản
    if (values.accountName.length < 5) {
      showErrorMessage("Tên đăng nhập phải có ít nhất 5 ký tự!");
      return false;
    }
    // Mật khẩu
    if (values.passWord.length < 5) {
      showErrorMessage("Mật khẩu phải có ít nhất 5 ký tự!");
      return false;
    }
    return true;
  };
  const onFinish = async (values) => {
    // console.log(">>>>>>>check values", values);
    if (!validateData(values)) return;
    try {
      const response = await post(values, `api/user/register`);
      // console.log(">>>>>>>check response", response);
      if (!response) {
        return;
      }
      showSuccess("Đăng ký thành công!");
      navigate("/Login");
    } catch (error) {
      showErrorMessage("Đăng ký thất bại!");
      console.error(error);
    }
  };

  return (
    <>
      <div className="Register-page">
        <div className="Register-page__container">
          <div className="Register-page__left">
            <Link className="btnBack" to={"/Login"}>
              <IoMdArrowBack />
            </Link>
          </div>
          <div className="Register-page__right">
            <h2 className="Register-page__title">Đăng ký</h2>
            <Form
              name="login-form"
              layout="vertical"
              onFinish={onFinish}
              className="Register-page__form"
              autoComplete="off"
            >
              <Form.Item name="fullName" className="Register-page__form-item">
                <Input
                  className="Register-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Họ và tên"
                />
              </Form.Item>
              <Form.Item name="email" className="Register-page__form-item">
                <Input
                  className="Register-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                className="Register-page__form-item"
              >
                <Input
                  className="Register-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Số điện thoại"
                />
              </Form.Item>

              <Form.Item
                name="accountName"
                className="Register-page__form-item"
              >
                <Input
                  className="Register-page__InputUserName"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Tên đăng nhập"
                />
              </Form.Item>
              <Form.Item className="login-page__form-item" name="passWord">
                <Input.Password
                  className="login-page__InputPassword"
                  style={{ height: "40px", color: "#ED5F31" }}
                  placeholder="Mật khẩu"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="Register-page__submit"
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
