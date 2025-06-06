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
  const {
    onOK,
    confirmLoading,
    initialValues,
    setConfirmLoading,
    open,
    setDetailingTestSet,
    reloadExams,
  } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    form.setFieldsValue({
      collection: initialValues?.collection || "",
    });
  }, [initialValues, form]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);
  const onFinish = async (values) => {
    // Nếu không có initialValues, nghĩa là đang thêm mới
    if (!initialValues) {
      setConfirmLoading(true); // Bật loading NGAY khi bắt đầu
      const result = await CreateTestSet(values);

      setTimeout(() => {
        setConfirmLoading(false); // Tắt loading sau 2s
        if (!result) {
          return;
        } else {
          onOK(result);
          showSuccess("Thêm bộ đề thành công!");
          form.resetFields();
        }
      }, 2000);
    } else {
      // Nếu có initialValues, nghĩa là đang chỉnh sửa
      // console.log("Editing test set:", values);
      setConfirmLoading(true);
      const result = await UpdateTestSet(values, initialValues.id);
      console.log(">>>>>>>>check result:", result);
      setTimeout(() => {
        setConfirmLoading(false);
        if (!result) {
          return;
        }

        // setConfirmLoading(false);
        setIsEditing(false);
        showSuccess("Cập nhật bộ đề thành công!");
        setDetailingTestSet({ ...values, id: initialValues.id });
        reloadExams();
      }, 2000);
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
