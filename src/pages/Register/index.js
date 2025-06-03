import "./Register.scss";
import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

import { DatePicker } from "antd";
import { post } from "../../utils/request";
import { useState } from "react";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function Register() {
    const navigate = useNavigate();
    const onFinish = async (values) => {

        try {
            const response = await post(values, "api/user/register");
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
                            <Form.Item
                                name="fullName"
                                className="Register-page__form-item"
                                rules={[
                                    { required: true, message: "Vui lòng nhập họ và tên!" },
                                ]}
                            >
                                <Input
                                    className="Register-page__InputUserName"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Họ và tên"
                                />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                className="Register-page__form-item"
                                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                            >
                                <Input
                                    className="Register-page__InputUserName"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Email"
                                />
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                className="Register-page__form-item"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                                ]}
                            >
                                <Input
                                    className="Register-page__InputUserName"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Số điện thoại"
                                />
                            </Form.Item>
                            {/* <Form.Item
                name="birthday"
                className="Register-page__form-item"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  className="Register-page__InputUserName"
                  style={{ height: "40px", width: "100%", color: "#ED5F31" }}
                  placeholder="Chọn ngày sinh"
                  format="YYYY-MM-DD"
                />
              </Form.Item> */}
                            <Form.Item
                                name="accountName"
                                className="Register-page__form-item"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                                ]}
                            >
                                <Input
                                    className="Register-page__InputUserName"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Tên đăng nhập"
                                />
                            </Form.Item>
                            <Form.Item
                                className="login-page__form-item"
                                name="passWord"
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                            >
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
