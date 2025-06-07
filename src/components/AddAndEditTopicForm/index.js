import { useEffect, useState } from "react";
import "./AddTopicForm.scss";
import { Button, Form, Input, Select } from "antd";
import { post, put } from "../../utils/request";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function AddAndEditTopicForm(props) {

  const { Option } = Select;
  const { onOK, confirmLoading, initialValues } = props;
  const [form] = Form.useForm();
  const API_DOMAIN = "http://143.198.83.161/";


  useEffect(() => {
    form.setFieldsValue({
      title: initialValues?.title || "",
      status: initialValues?.status || "PUBLIC",
      learningStatus: initialValues?.learningStatus
    });
  }, [initialValues, form]);

  const onFinish = async (values) => {
    if (initialValues && initialValues.id) {  // goi update vi initialValues # null
      const data = { ...values, id: initialValues.id };
      const headers = {
        "Content-type": "application/json",
        Accept: "application/json",
      };
      const token = localStorage.getItem("accessToken");
      headers.Authorization = `Bearer ${token}`;

      const response = await fetch(API_DOMAIN + "api/flashcard/updateTopic", {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccess("Cập nhật thành công");
        if (props.onTopicCreated) props.onTopicCreated();
        if (onOK) onOK();
        form.resetFields();
      } else {
        try {
          const result = await response.json();
          console.log("API error detail:", result.detail);
          showErrorMessage(result.detail);
        } catch (e) {
          // Nếu không parse được JSON
          const text = await response.text();
          console.log("API error non-JSON:", text);
          showErrorMessage("Có lỗi không xác định!");
        }
      }
    }
    else {
      const data = { ...values };
      const headers = {
        "Content-type": "application/json",
        Accept: "application/json",
      };
      const token = localStorage.getItem("accessToken");
      headers.Authorization = `Bearer ${token}`;

      const response = await fetch(API_DOMAIN + "api/flashcard/createTopic", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccess("Tạo chủ đề mới thành công");
        if (props.onTopicCreated) props.onTopicCreated();
        if (onOK) onOK();
        form.resetFields();
      } else {
        try {
          const result = await response.json();
          console.log("API error detail:", result.detail);
          showErrorMessage(result.detail);
        } catch (e) {
          // Nếu không parse được JSON
          const text = await response.text();
          console.log("API error non-JSON:", text);
          showErrorMessage("Có lỗi không xác định!");
        }
      }
    }
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
        initialValues={{
          status: "PUBLIC",
          ...initialValues
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Tên chủ đề"
          name="title"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập tên chủ đề!" }]}
        >
          <Input placeholder="Toeic 600 words" />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Trường này không được trống!" }]}
        >
          <Select>
            <Option value="PRIVATE">Riêng tư</Option>
            <Option value="PUBLIC">Công khai</Option>
          </Select>
        </Form.Item>
        {(initialValues?.learningStatus) ? (
          <Form.Item
            label="Tiến độ"
            name="learningStatus"
            rules={[{ required: true, message: "Trường này không được trống!" }]}
          >
            <Select>
              <Option value="NEW">Mới</Option>
              <Option value="IN_PROGRESS">Đang học</Option>
              <Option value="MASTERED">Thành thạo</Option>
              <Option value="REVIEW_NEEDED">Cần xem lại</Option>
            </Select>
          </Form.Item>
        ) : <></>}
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
