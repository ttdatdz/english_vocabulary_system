import { useState } from 'react';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import "./DetailUserForm.scss";
import { Button, Checkbox, Col, DatePicker, Form, Input, Row, Select, Upload } from 'antd';
const { Option } = Select;
export default function DetailUserForm(props) {
    const { onOk, confirmLoading } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [form] = Form.useForm();

    const onFinish = values => {
        console.log('Success:', values);
        setIsEditing(false); // Gửi xong thì quay lại chế độ xem
    };

    const onCancel = () => {
        setIsEditing(false);
        form.resetFields(); // Reset lại giá trị form về ban đầu
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

    const onGenderChange = value => {
        form.setFieldsValue({ gender: value });
    };

    return (
        <>
            <Form className='UserForm'
                form={form}
                name="basic"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 750 }}
                initialValues={{}}
                onFinish={onFinish}
                autoComplete="off"
                disabled={!isEditing} // Khóa tất cả input khi không chỉnh sửa
            >
                <Row gutter={24}>
                    <Col span={14}>
                        <Form.Item label="Họ và tên" name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Giới tính" name="gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        >
                            <Select placeholder="Chọn giới tính" onChange={onGenderChange} allowClear>
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Ngày sinh" name="birthDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Số điện thoại" name="phoneNumber"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Địa chỉ" name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Email" name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Tài khoản" name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Mật khẩu" name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password />
                        </Form.Item>


                    </Col>
                    <Col span={10} className='UserForm__Avatar-Col'>

                        <Form.Item
                            name="avatar"
                            className='UserForm__Avatar-FormItem'
                            wrapperCol={{ span: 24 }} // canh thẳng hàng với input
                        >
                            {isEditing ? (
                                <div className="UserForm__Avatar-EditBlock">
                                    <img
                                        src={
                                            previewUrl ||
                                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s'
                                        }
                                        alt="avatar"
                                        className='UserForm__Avatar-Img'
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
                                    src={
                                        previewUrl ||
                                        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s'
                                    }
                                    alt="avatar"
                                    className='UserForm__Avatar-Img'
                                />
                            )}
                        </Form.Item>
                    </Col>

                    {isEditing && (
                        <Col span={24}>
                            <Form.Item
                                wrapperCol={{ offset: 8, span: 24 }} // canh thẳng hàng với input
                            >
                                <div className='UserForm__Contain-Button'>

                                    <Button className='UserForm__Cancel' danger onClick={onCancel}>
                                        Hủy
                                    </Button>
                                    <Button loading={confirmLoading} className='UserForm__Accept' type="primary" htmlType="submit">
                                        Xác nhận
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>

                    )}
                </Row>
            </Form>

            {!isEditing && (
                <Button
                    className='ButtonIsEdit'
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}

                >
                    Chỉnh sửa thông tin
                </Button>
            )}
        </>

    );
}