import { useEffect, useRef, useState } from "react";
import "./AddTopicForm.scss";
import { Button, Form, Input, Select } from "antd";
const { Option } = Select;
export default function AddAndEditExam(props) {
  const { onOK, confirmLoading, initialValues } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.testName || "", // giả sử `title` là tên
      collection: initialValues?.examSet || "",
      duration: initialValues?.duration || "",
    });
  }, [initialValues, form]);

  const onFinish = (values) => {
    console.log("Success:", values);
    onOK();

    setTimeout(() => {
      form.resetFields(); // Reset toàn bộ form về trạng thái ban đầu
      setSelectedFile(null);
    }, 2000);
  };
  const onGenderChange = (value) => {
    form.setFieldsValue({ gender: value });
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    form.setFieldsValue({ file });
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
          label="Tên đề"
          name="title"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên đề!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Bộ đề"
          name="collection"
          rules={[{ required: true, message: "Vui lòng chọn bộ đề!" }]}
        >
          <Select placeholder="Chọn bộ đề" onChange={onGenderChange} allowClear>
            <Option value="ETS2024">ETS 2024</Option>
            <Option value="ETS2023">ETS 2023</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Thời lượng"
          name="duration"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Import câu hỏi"
          name="file"
          rules={[{ required: true, message: "Vui lòng import câu hỏi!" }]}
        >
          <Button onClick={() => fileInputRef.current.click()} type="default">
            Chọn file
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {selectedFile && (
            <div style={{ marginTop: 8, color: "#1890ff" }}>
              Đã chọn: {selectedFile.name}
            </div>
          )}
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
