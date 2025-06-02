import "./Login.scss";
import Poster from "../../assets/images/posterLogin.png";
import { Form, Input, Button, Checkbox } from "antd";
import { Link } from "react-router-dom";

import { post } from "../../utils/request";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../../utils/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const onFinish = async (values) => {
        try {
            const data = await post(
                {
                    accountName: values.username,
                    passWord: values.password,
                },
                "api/user/login"
            );

            if (data?.accessToken) {
                login(data); // cập nhật context
                message.success("Đăng nhập thành công!");
                if (data.role != "ADMIN")
                    navigate("/");
                else navigate("/admin");
            } else {
                message.error("Đăng nhập thất bại!");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi đăng nhập!");
        }
    };

    return (
        <>
            <div className="login-page">
                <div className="login-page__container">
                    <div className="login-page__left" />
                    <div className="login-page__right">
                        <h2 className="login-page__title">Đăng Nhập</h2>
                        <Form
                            name="login-form"
                            layout="vertical"
                            onFinish={onFinish}
                            className="login-page__form"
                        >
                            <Form.Item
                                name="username"
                                className="login-page__form-item"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                                ]}
                            >
                                <Input
                                    className="login-page__InputUserName"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Tên đăng nhập"
                                />
                            </Form.Item>

                            <Form.Item
                                className="login-page__form-item"
                                name="password"
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                            >
                                <Input.Password
                                    className="login-page__InputPassword"
                                    style={{ height: "40px", color: "#ED5F31" }}
                                    placeholder="Mật khẩu"
                                />
                            </Form.Item>

                            <div className="login-page__options">
                                <Form.Item
                                    className="login-page__form-item"
                                    name="remember"
                                    valuePropName="checked"
                                    noStyle
                                >
                                    <Checkbox style={{ color: "#fff" }}>Nhớ mật khẩu</Checkbox>
                                </Form.Item>
                                <Link className="login-page__forgot" to={"/ForgotPassword"}>
                                    Quên mật khẩu
                                </Link>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="login-page__submit"
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>
                        <div className="login-page__register">
                            Không có tài khoản? <Link to={"/Register"}>Đăng ký</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
