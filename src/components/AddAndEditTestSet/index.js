import { useEffect, useState } from "react";
import "./AddAndEditTestSet.scss";
import { Button, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  CreateTestSet,
  UpdateTestSet,
} from "../../services/Exam/testSetService";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function AddAndEditTestSet(props) {
  const { onOK, confirmLoading, initialValues, setConfirmLoading } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    form.setFieldsValue({
      collection: initialValues?.collection || "",
    });
  }, [initialValues, form]);

  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    // Nếu không có initialValues, nghĩa là đang thêm mới
    if (!initialValues) {
      console.log("Adding new test set:", values);
      const result = await CreateTestSet(values);
      if (!result) {
        showErrorMessage("Thêm bộ đề thất bại!");
        return;
      }
      onOK();
      showSuccess("Thêm bộ đề thành công!");
      setTimeout(() => {
        form.resetFields(); // Reset toàn bộ form về trạng thái ban đầu
      }, 2000);
    } else {
      // Nếu có initialValues, nghĩa là đang chỉnh sửa
      console.log("Editing test set:", values);

      const result = await UpdateTestSet(values, initialValues.id);
      if (!result) {
        showErrorMessage("Cập nhật bộ đề thất bại!");
        return;
      }
      setConfirmLoading(true);
      setTimeout(() => {
        setConfirmLoading(false);
        setIsEditing(false);

        // form.resetFields(); // Reset toàn bộ form về trạng thái ban đầu
      }, 2000);
      showSuccess("Cập nhật bộ đề thành công!");
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      collection: initialValues?.collection || "",
    });
  };
  console.log("initialValues", initialValues);
  return (
    <>
      <Form
        className="UserForm"
        form={form}
        name="basic"
        labelAlign="left"
        labelCol={{ span: 6 }}
        style={{ maxWidth: 750 }}
        initialValues={initialValues}
        onFinish={onFinish}
        autoComplete="off"
        disabled={!isEditing && initialValues}
      >
        <Form.Item
          label="Tên bộ đề"
          name="collection"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên bộ đề!" }]}
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
