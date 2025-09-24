import { useEffect, useState } from "react";
import { Button, Form, Image, Input, Select, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import "./AddAndEditBlog.scss";
import TextEditor from "../TextEditor";
import { CreateBlog, UpdateBlog } from "../../services/Blog/blogService";
import { showSuccess } from "../../utils/alertHelper";

export default function AddAndEditBlog({
  onOK,
  confirmLoading,
  initialValues,
  listCategoryBlogs,
  setConfirmLoading,
  reloadBlogs,
  setDetailingBlog,
}) {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialValues?.detail || "");
  const [thumbnail, setThumbnail] = useState(initialValues?.image || null);

  // reset form mỗi khi initialValues thay đổi
  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      category: initialValues?.category || "",
      shortDetail: initialValues?.shortDetail || "",
      detail: initialValues?.detail || "",
    });
    setContent(initialValues?.detail || "");
    setThumbnail(initialValues?.image || null);
    setIsEditing(false);
  }, [initialValues, form]);

  // xử lý chọn ảnh
  const handleThumbnailChange = (info) => {
    const f = info?.file?.originFileObj || info?.file;
    if (f) {
      setThumbnail(f);                 // lưu RcFile/Blob
      form.setFieldsValue({ image: f });// để Form biết có giá trị
    }
  };

  // submit
  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append(
      "dataJson",
      JSON.stringify({
        title: values.title,
        category: values.category,
        shortDetail: values.shortDetail,
        detail: content,
      })
    );

    // chỉ append nếu user có chọn ảnh mới
    if (thumbnail && typeof thumbnail !== "string") {
  formData.append("image", thumbnail, thumbnail.name || `upload_${Date.now()}.jpg`);
}

    setConfirmLoading(true);
    let result;
    if (!initialValues) {
      // create
      result = await CreateBlog(formData);
    } else {
      // update
      result = await UpdateBlog(formData, initialValues.id);
    }
    setConfirmLoading(false);

    if (!result) return;

    if (!initialValues) {
      onOK(result);
      form.resetFields();
      setContent("");
      setThumbnail(null);
    } else {
      showSuccess("Cập nhật bài blog thành công!");
      setDetailingBlog({
        ...initialValues,
        title: values.title,
        category: values.category,
        shortDetail: values.shortDetail,
        detail: content,
        image: typeof thumbnail !== "string" ? URL.createObjectURL(thumbnail) : initialValues.image,
        id: initialValues.id,
      });
      reloadBlogs();
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      title: initialValues?.title || "",
      category: initialValues?.category || "",
      shortDetail: initialValues?.shortDetail || "",
      detail: initialValues?.detail || "",
    });
    setContent(initialValues?.detail || "");
    setThumbnail(initialValues?.image || null);
  };

  return (
    <>
      <Form
        className="UserForm"
        form={form}
        name="blog"
        labelAlign="left"
        labelCol={{ span: 6 }}
        style={{ maxWidth: 940 }}
        onFinish={onFinish}
        autoComplete="off"
        disabled={!isEditing && initialValues}
        initialValues={initialValues}
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
          <Select
            placeholder="Chọn danh mục"
            options={listCategoryBlogs.map((c) => ({
              label: c.title,
              value: c.title,
            }))}
            className="filter"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Tóm tắt ngắn"
          name="shortDetail"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tóm tắt ngắn!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ảnh đại diện"
          name="image"
          wrapperCol={{ span: 18 }}
          rules={[{ required: !initialValues, message: "Vui lòng chọn ảnh đại diện!" }]}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Upload
              showUploadList={false}
              maxCount={1}
              accept="image/*"
              beforeUpload={(file) => {
                // file là RcFile (Blob) CHUẨN
                setThumbnail(file);
                form.setFieldsValue({ image: file });
                return false; // chặn antd auto-upload, để mình tự submit
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>

            {thumbnail && (
              <Image
                src={typeof thumbnail === "string" ? thumbnail : URL.createObjectURL(thumbnail)}
                alt="Ảnh đại diện"
                style={{ width: 120 }}
              />
            )}
          </div>
        </Form.Item>

        <Form.Item
          label="Nội dung chi tiết"
          name="detail"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập nội dung chi tiết!" }]}
        >
          <TextEditor value={content} onChange={setContent} disabled={!isEditing && initialValues} />
        </Form.Item>

        {!initialValues && (
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <Button loading={confirmLoading} className="UserForm__Accept" type="primary" htmlType="submit">
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
              <Button loading={confirmLoading} className="UserForm__Accept" type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </div>
          </Form.Item>
        )}
      </Form>

      {!isEditing && initialValues && (
        <Button className="ButtonIsEdit" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
          Chỉnh sửa thông tin
        </Button>
      )}
    </>
  );
}
