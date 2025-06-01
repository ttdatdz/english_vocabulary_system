import { useEffect, useState } from "react";
import { Button, Form, Image, Input, Select, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import "./AddAndEditBlog.scss";
import TextEditor from "../TextEditor";

const { Option } = Select;

export default function AddAndEditBlog(props) {
  const { onOK, confirmLoading, initialValues } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialValues?.content || "");
  const [thumbnail, setThumbnail] = useState(initialValues?.thumbnail || null);

  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      category: initialValues?.category || "",
      summary: initialValues?.summary || "",
    });
    setContent(initialValues?.content || "");
    setThumbnail(initialValues?.thumbnail || null);
    setIsEditing(false);
  }, [initialValues, form]);

  const onFinish = (values) => {
    const blogData = {
      ...values,
      content,
      thumbnail,
    };
    onOK(blogData);
    setTimeout(() => {
      form.resetFields();
      setContent("");
      setThumbnail(null);
    }, 2000);
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      title: initialValues?.title || "",
      category: initialValues?.category || "",
      summary: initialValues?.summary || "",
    });
    setContent(initialValues?.content || "");
    setThumbnail(initialValues?.thumbnail || null);
  };

  const handleThumbnailChange = (info) => {
    // Lấy file cuối cùng trong danh sách file đã chọn
    const file =
      info.file.originFileObj ||
      (info.fileList.length > 0 &&
        info.fileList[info.fileList.length - 1].originFileObj);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnail(url);
      form.setFieldsValue({ thumbnail: url });
    }
  };

  console.log(">>>check thumbnail", thumbnail);
  return (
    <>
      <Form
        className="UserForm"
        form={form}
        name="blog"
        labelAlign="left"
        labelCol={{ span: 6 }}
        style={{ maxWidth: 750 }}
        onFinish={onFinish}
        autoComplete="off"
        disabled={!isEditing && initialValues}
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Danh mục"
          name="category"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select placeholder="Chọn danh mục" allowClear>
            <Option value="Toeic tips">Toeic tips</Option>
            <Option value="Vocabulary">Vocabulary</Option>
            <Option value="Grammar">Grammar</Option>
            <Option value="Reading skill">Reading skill</Option>
            <Option value="Writing skill">Writing skill</Option>
            <Option value="Pronunciation">Pronunciation</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Tóm tắt ngắn"
          name="summary"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tóm tắt ngắn!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Ảnh đại diện"
          name="thumbnail"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng chọn ảnh đại diện!" }]}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleThumbnailChange}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {thumbnail && (
              <div style={{ display: "inline-block" }}>
                <Image
                  src={thumbnail}
                  alt="thumbnail"
                  style={{
                    width: 120,
                    display: "inline-block",
                  }}
                />
              </div>
            )}
          </div>
        </Form.Item>
        <Form.Item
          label="Nội dung chi tiết"
          name="content"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung chi tiết!" },
          ]}
          wrapperCol={{ span: 18 }}
        >
          <TextEditor
            value={content}
            onChange={setContent}
            disabled={!isEditing && initialValues}
          />
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
          <Form.Item wrapperCol={{ offset: 8, span: 24 }}>
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
