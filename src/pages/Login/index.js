import "./Login.scss";
import Poster from "../../assets/images/posterLogin.png";
import { Form, Input, Button, Checkbox } from 'antd';
import { Link } from "react-router-dom";
export default function Login() {
    const onFinish = (values) => {
        console.log('Success:', values);
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
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            >
                                <Input className="login-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Tên đăng nhập" />
                            </Form.Item>

                            <Form.Item

                                className="login-page__form-item"
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password className="login-page__InputPassword" style={{ height: '40px', color: '#ED5F31' }} placeholder="Mật khẩu" />
                            </Form.Item>

                            <div className="login-page__options">
                                <Form.Item className="login-page__form-item" name="remember" valuePropName="checked" noStyle>
                                    <Checkbox style={{ color: '#fff' }}>Nhớ mật khẩu</Checkbox>
                                </Form.Item>
                                <Link className="login-page__forgot" to={"/ForgotPassword"}>Quên mật khẩu</Link>
                            </div>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="login-page__submit">
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>
                        <div className="login-page__register">
                            Không có tài khoản? <a href="/register">Đăng ký</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}