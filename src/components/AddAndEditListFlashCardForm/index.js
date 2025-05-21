import { useEffect, useState } from 'react';
import "./AddAndEditListFlashCardForm.scss";
import { Button, Form, Input } from 'antd';
export default function AddAndEditListFlashCardForm(props) {
    const { onOK, confirmLoading, initialValues } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            nameOfTopic: initialValues?.title || "", // giả sử `title` là tên
        });
    }, [initialValues, form]);

    const onFinish = values => {
        console.log('Success:', values);
        onOK();
    };
    return (
        <>
            <Form className='UserForm'
                form={form}
                name="basic"
                labelAlign="left"
                labelCol={{ span: 6 }}
                style={{ maxWidth: 750 }}
                initialValues={{}}
                onFinish={onFinish}
                autoComplete="off"
            >

                <Form.Item label="Tiêu đề" name="name" wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="timeRepeat" wrapperCol={{ offset: 6, span: 18 }}
                >
                    <p className='UserForm__Note'>Lưu ý: Nhập 1,2,3... tương ứng 1 ngày, 2 ngày, 3 ngày cho khoảng thời gian lặp lại</p>
                </Form.Item>
                <Form.Item label="Khoảng thời gian lặp lại" name="timeRepeat" wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập khoảng thời gian lặp lại!' }]}
                >
                    <div className='UserForm__ContainerTimeRepeat'>
                        <Input />
                        <span>Ngày</span>
                    </div>

                </Form.Item>
                <Form.Item label="Description" name="description" wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <div style={{ display: "flex", justifyContent: 'end' }}>
                        <Button loading={confirmLoading} className='UserForm__Accept' type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </div>

                </Form.Item>
            </Form>
        </>

    );
}