import { useEffect, useState } from "react";
import "./AddAndEditCategory.scss";
import { Button, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";

export default function AddAndEditCategory(props) {
  const { onOK, confirmLoading, initialValues } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.name || "",
    });
  }, [initialValues, form]);

  const onFinish = (values) => {
    console.log("Success:", values);
    onOK();

    setTimeout(() => {
      form.resetFields(); // Reset toàn bộ form về trạng thái ban đầu
    }, 2000);
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      title: initialValues?.name || "",
    });
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
        disabled={!isEditing && initialValues}
      >
        <Form.Item
          label="Tên đề"
          name="title"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên đề!" }]}
        >
          <Input />
        </Form.Item>
        {!initialValues && (
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
        )}

        {isEditing && (
          <Form.Item
            wrapperCol={{ offset: 8, span: 24 }} // canh thẳng hàng với input
          >
            <div className="UserForm__Contain-Button">
              <Button className="UserForm__Cancel" danger onClick={onCancel}>
                Hủy
              </Button>
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
        )}
      </Form>

      {!isEditing && initialValues && (
        <Button
          className="ButtonIsEdit"
          icon={<EditOutlined />}
          onClick={() => setIsEditing(true)}
        >
          Chỉnh sửa thông tin
        </Button>
      )}
    </>
  );
}
