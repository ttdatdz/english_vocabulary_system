import { useEffect, useState } from "react";
import { Button, Form, Image, Input, Select, Upload } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import "./AddAndEditBlog.scss";
import TextEditor from "../TextEditor";
import { CreateBlog, UpdateBlog } from "../../services/Blog/blogService";
import { showSuccess } from "../../utils/alertHelper";

const { Option } = Select;

export default function AddAndEditBlog(props) {
  const {
    onOK,
    confirmLoading,
    initialValues,
    listCategoryBlogs,
    setConfirmLoading,
    reloadBlogs,
    setDetailingBlog,
  } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialValues?.detail || "");
  const [thumbnail, setThumbnail] = useState(initialValues?.image || null);

  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      category: initialValues?.category || "",
      shortDetail: initialValues?.shortDetail || "",
      detail: initialValues?.detail || "",
      image: initialValues?.image || null,
    });
    setContent(initialValues?.detail || "");
    setThumbnail(initialValues?.image || null);
    setIsEditing(false);
  }, [initialValues, form]);
  // console.log(">>>check initialValues", initialValues);
  // console.log(">>>check content", content);
  console.log(">>>check thumbnail", thumbnail);
  //  Hàm tải file từ URL về dạng File object
  async function urlToFile(url, filename = "image.jpg") {
    const response = await fetch(url);
    console.log(">>>check response", response);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.startsWith("image/")) {
      throw new Error("Không thể tải ảnh từ URL");
    }
    const data = await response.blob();
    // Lấy extension đúng từ url
    const extMatch = url.match(/\.(\w+)(\?|$)/);
    const ext = extMatch ? extMatch[1] : "jpg";
    const fileNameWithExt = `old_image.${ext}`;
    return new File([data], fileNameWithExt, { type: data.type });
  }
  const onFinish = async (values) => {
    console.log("Received values:", values);
    // Tạo FormData
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

    // Xử lý ảnh
    if (values.image && values.image.file) {
      // Ảnh mới từ máy
      formData.append("image", values.image.file.originFileObj);
    } else if (
      thumbnail &&
      typeof thumbnail !== "string" &&
      thumbnail instanceof File
    ) {
      // Ảnh mới từ máy (trường hợp khác)
      formData.append("image", thumbnail);
    } else if (typeof thumbnail === "string" && thumbnail) {
      try {
        const fileFromUrl = await urlToFile(thumbnail);
        formData.append("image", fileFromUrl);
      } catch (error) {
        setConfirmLoading(false);
        alert(
          "Không thể tải ảnh cũ từ server.Bạn request quá nhiều lần. Vui lòng chọn lại ảnh!"
        );
        return;
      }
    }

    // Nếu không có initialValues, nghĩa là đang thêm mới
    if (!initialValues) {
      setConfirmLoading(true); // Bật loading NGAY khi bắt đầu
      const result = await CreateBlog(formData); // Chỉnh CreateBlog nhận FormData

      if (!result) {
        setConfirmLoading(false); // Tắt loading nếu không thành công
        return;
      }
      onOK(result);
      form.resetFields();
      setContent(null);
    } else {
      // Nếu có initialValues, nghĩa là đang chỉnh sửa
      // console.log("Editing test set:", values);
      setConfirmLoading(true);
      const result = await UpdateBlog(formData, initialValues.id);

      if (!result) {
        setConfirmLoading(false);
        return;
      }
      setConfirmLoading(false);
      setIsEditing(false);
      showSuccess("Cập nhật bài blog thành công!");
      setDetailingBlog({
        ...initialValues,
        title: values.title,
        category: values.category,
        shortDetail: values.shortDetail,
        detail: content,
        image: thumbnail, // hoặc giá trị ảnh mới nếu có
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
      image: initialValues?.image || null,
    });
    setContent(initialValues?.detail || "");
    setThumbnail(initialValues?.image || null);
  };

  const handleThumbnailChange = (info) => {
    // Lấy file cuối cùng trong danh sách file đã chọn
    const file =
      info.file.originFileObj ||
      (info.fileList.length > 0 &&
        info.fileList[info.fileList.length - 1].originFileObj);
    if (file) {
      setThumbnail(file); // Lưu file object, không phải URL
      // Nếu muốn hiển thị ảnh, tạo thêm state thumbnailUrl để lưu URL
      // setThumbnailUrl(URL.createObjectURL(file));
      form.setFieldsValue({ image: file });
    }
  };

  // console.log(">>>check thumbnail", thumbnail);
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
            options={[
              ...listCategoryBlogs.map((category) => ({
                label: category.title,
                value: category.title,
              })),
            ]}
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
                  src={
                    thumbnail && typeof thumbnail !== "string"
                      ? URL.createObjectURL(thumbnail)
                      : thumbnail
                  }
                  alt="Ảnh đại diện"
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
          name="detail"
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
