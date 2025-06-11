import { useEffect, useState } from 'react';
import "./AddAndEditListFlashCardForm.scss";
import { Button, Form, Input } from 'antd';
import { post, put } from '../../utils/request';
import { showErrorMessage, showSuccess } from '../../utils/alertHelper';
export default function AddAndEditListFlashCardForm(props) {
    const { topicId, onOK, confirmLoading, initialValues, onFlashCardCreated } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            title: initialValues?.title || "", // giả sử `title` là tên
            cycle: initialValues?.cycle !== undefined && initialValues?.cycle !== null
                ? String(initialValues.cycle)
                : ""
        });
    }, [initialValues, form]);

    const onFinish = async (values) => {
        if (initialValues && initialValues.id) {
            const data = {
                id: initialValues.id,
                title: values.title,
                cycle: Number(values.cycle) // Đảm bảo là số
            }
            const result = await put(data, "api/flashcard/updateFlashCard");
            if (result) {
                showSuccess("Cập nhật thành công");
                if (onFlashCardCreated) onFlashCardCreated();
                if (onOK) onOK();
                form.resetFields();
            }
        }
        else {
            const data = {
                title: values.title,
                cycle: Number(values.cycle), // Đảm bảo là số
                topicID: topicId
            }
            const result = await post(data, "api/flashcard/createFlashCard", true);
            if (result) {
                showSuccess("Tạo mới thành công");
                if (onFlashCardCreated) onFlashCardCreated();
                if (onOK) onOK();
                form.resetFields();
            }
        }
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

                <Form.Item label="Tiêu đề" name="title" wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                    <Input />
                </Form.Item>

                <p className='UserForm__Note' style={{ marginBottom: 20 }}>Lưu ý: Nhập 1,2,3... tương ứng 1 ngày, 2 ngày, 3 ngày cho khoảng thời gian lặp lại</p>

                <Form.Item label="Khoảng thời gian lặp lại" name="cycle" wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập khoảng thời gian lặp lại!' }]}
                >
                    <Input addonAfter="Ngày" />
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