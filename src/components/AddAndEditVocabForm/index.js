import { useEffect } from 'react';
import "./AddAndEditVocabForm.scss";
import { Button, Form, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
export default function AddAndEditVocabForm(props) {
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
    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e === null || e === void 0 ? void 0 : e.fileList;
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

                <Form.Item
                    label="Từ mới"
                    name="word"
                    wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập từ mới!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Định nghĩa"
                    name="definition"
                    wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập định nghĩa!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Loại từ"
                    name="partOfSpeech"
                    wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập loại từ!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Phiên âm"
                    name="phonetic"
                    wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập phiên âm!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Ví dụ"
                    name="example"
                    wrapperCol={{ span: 18 }}
                    rules={[{ required: true, message: 'Vui lòng nhập ví dụ!' }]}
                >
                    <TextArea />
                </Form.Item>

                <Form.Item
                    label="Ghi chú"
                    name="note"
                    wrapperCol={{ span: 18 }}
                >
                    <TextArea />
                </Form.Item>
                <Form.Item
                    label="Hình ảnh minh họa"
                    name="image" // thêm name vào đây
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    wrapperCol={{ span: 18 }}
                >
                    <Upload action="/upload.do" listType="picture-card">
                        <button
                            style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                            type="button"
                        >
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                    </Upload>
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