import "./ForgotPassword.scss";
import { Form, Input, Button } from 'antd';
import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

export default function ForgotPassword() {
    const onFinish = (values) => {
        console.log('Success:', values);
    };
    return (
        <>
            <div className="ForgotPassword-page">
                <div className="ForgotPassword-page__container">
                    <div className="ForgotPassword-page__left">
                        <Link className="btnBack" to={"/Login"}><IoMdArrowBack /></Link>
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
                                name="username"
                                className="ForgotPassword-page__form-item"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            >
                                <Input className="ForgotPassword-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                className="ForgotPassword-page__form-item"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                            >
                                <Input className="ForgotPassword-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Email" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="ForgotPassword-page__submit">
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
