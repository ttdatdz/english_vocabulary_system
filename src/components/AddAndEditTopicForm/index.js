import { useEffect, useState } from "react";
import "./AddTopicForm.scss";
import { Button, Form, Input } from "antd";
export default function AddAndEditTopicForm(props) {
  const { onOK, confirmLoading, initialValues } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      nameOfTopic: initialValues?.title || "",
    });
  }, [initialValues, form]);

  const onFinish = (values) => {
    console.log("Success:", values);
    onOK();
  };
  return (
    <>
      <Form
        className="UserForm"
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
          label="Tên chủ đề"
          name="nameOfTopic"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên chủ đề!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button
              loading={confirmLoading}
              className="UserForm__Accept"
              type="primary"
              htmlType="submit"
            >
              Xác nhận
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
}
