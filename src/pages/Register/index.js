import "./Register.scss";
import { Form, Input, Button } from 'antd';
import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

export default function Register() {
    const onFinish = (values) => {
        console.log('Success:', values);
    };
    return (
        <>
            <div className="Register-page">
                <div className="Register-page__container">
                    <div className="Register-page__left">
                        <Link className="btnBack" to={"/Login"}><IoMdArrowBack /></Link>
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
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input className="Register-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Họ và tên" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                className="Register-page__form-item"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                            >
                                <Input className="Register-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Email" />
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                className="Register-page__form-item"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input className="Register-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Số điện thoại" />
                            </Form.Item>
                            <Form.Item
                                name="username"
                                className="Register-page__form-item"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            >
                                <Input className="Register-page__InputUserName" style={{ height: '40px', color: '#ED5F31' }} placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item
                                className="login-page__form-item"
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password className="login-page__InputPassword" style={{ height: '40px', color: '#ED5F31' }} placeholder="Mật khẩu" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="Register-page__submit">
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
