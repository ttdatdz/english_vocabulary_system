import { useEffect, useState } from "react";
import "./AddAndEditCategory.scss";
import { Button, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  CreateCategoryBlog,
  UpdateCategoryBlog,
} from "../../services/Blog/categoryBlogService";
import { showSuccess } from "../../utils/alertHelper";

export default function AddAndEditCategory(props) {
  const {
    onOK,
    confirmLoading,
    initialValues,
    setConfirmLoading,
    reloadExams,
    setDetailingCategory,
  } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
    });
  }, [initialValues, form]);
  const onFinish = async (values) => {
    // Nếu không có initialValues, nghĩa là đang thêm mới
    if (!initialValues) {
      setConfirmLoading(true); // Bật loading NGAY khi bắt đầu
      const result = await CreateCategoryBlog(values);

      setTimeout(() => {
        setConfirmLoading(false); // Tắt loading sau 2s
        if (!result) {
          return;
        } else {
          onOK(result);
          form.resetFields();
        }
      }, 2000);
    } else {
      // Nếu có initialValues, nghĩa là đang chỉnh sửa
      // console.log("Editing test set:", values);
      setConfirmLoading(true);
      const result = await UpdateCategoryBlog(values, initialValues.id);
      console.log(">>>>>>>>check result:", result);
      setTimeout(() => {
        setConfirmLoading(false);
        if (!result) {
          return;
        }

        // setConfirmLoading(false);
        setIsEditing(false);
        showSuccess("Cập nhật danh mục blog thành công!");
        setDetailingCategory({ ...values, id: initialValues.id });
        reloadExams();
      }, 2000);
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      title: initialValues?.title || "",
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
          label="Tên danh mục"
          name="title"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
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
