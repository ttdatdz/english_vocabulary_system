import { useEffect, useRef, useState } from "react";
import "./AddAndEditExam.scss";
import { Button, Form, Input, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  CreateExam,
  importFileQuestion,
  UpdateExam,
} from "../../services/Exam/examService";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";

export default function AddAndEditExam(props) {
  const {
    onOK,
    confirmLoading,
    initialValues,
    setDetailingExam,
    listTestSets,
    setConfirmLoading,
    open,
  } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  // Reset form & file khi initialValues đổi (mở modal mới)
  useEffect(() => {
    setSelectedFile(null);
    form.resetFields();
    form.setFieldsValue({
      title: initialValues?.title || "",
      collection: initialValues?.collection || "",
      duration: initialValues?.duration || "",
      type: initialValues?.type || "",
      year: initialValues?.year || "",
      file: initialValues?.file || null,
    });
  }, [initialValues, form]);

  // Reset file khi đóng modal
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      form.resetFields();
    }
  }, [open, form]);

  const validateExam = (values) => {
    if (!/^\d+$/.test(values.duration) || Number(values.duration) <= 0) {
      showErrorMessage("Thời lượng phải là số và lớn hơn 0!");
      return false;
    }
    if (!values.type || values.type.trim().toUpperCase() !== "TOEIC") {
      showErrorMessage("Loại đề bắt buộc phải là 'TOEIC'!");
      return false;
    }
    if (!/^\d+$/.test(values.year) || Number(values.year) <= 0) {
      showErrorMessage("Năm phải là số và lớn hơn 0!");
      return false;
    }
    return true;
  };

  const onFinish = async (values) => {
    if (!validateExam(values)) return;
    setConfirmLoading(true);

    if (!initialValues) {
      const examData = {
        title: values?.title,
        collection: values?.collection,
        duration: values?.duration,
        type: values?.type,
        year: values?.year,
      };
      const result = await CreateExam(examData);
      if (!result) {
        showErrorMessage("Thêm thông tin đề thi thất bại!");
        setConfirmLoading(false);
        return;
      }

      let importResult = true;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("examID", result.id);
        importResult = await importFileQuestion(formData);
        if (!importResult) {
          showErrorMessage("Import câu hỏi thất bại!");
          setConfirmLoading(false);
          return;
        }
      }

      if (result && importResult) {
        onOK(true);
        form.resetFields();
        setSelectedFile(null);
      }
      setConfirmLoading(false);
    } else {
      // Chỉnh sửa
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("collection", values.collection);
      formData.append("duration", values.duration);
      if (values.file) formData.append("file", values.file);

      const result = await UpdateExam(formData, initialValues.id);
      if (!result) {
        showErrorMessage("Cập nhật đề thi thất bại!");
        return;
      }
      setConfirmLoading(true);
      setTimeout(() => {
        setConfirmLoading(false);
        setIsEditing(false);
      }, 2000);
      showSuccess("Cập nhật đề thi thành công!");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    form.setFieldsValue({ file });
  };

  const onCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      title: initialValues?.title || "",
      collection: initialValues?.collection || "",
      duration: initialValues?.duration || "",
      type: initialValues?.type || "",
      year: initialValues?.year || "",
      file: initialValues?.file || null,
    });
    setSelectedFile(null);
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
        initialValues={initialValues}
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
        <Form.Item
          label="Bộ đề"
          name="collection"
          rules={[{ required: true, message: "Vui lòng chọn bộ đề!" }]}
        >
          <Select
            placeholder="Chọn bộ đề"
            options={[
              ...listTestSets.map((testSet) => ({
                label: testSet.collection,
                value: testSet.collection,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Thời lượng (phút)"
          name="duration"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Loại đề"
          name="type"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập loại đề!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Năm"
          name="year"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập năm!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Import câu hỏi"
          name="file"
          rules={[{ required: true, message: "Vui lòng import câu hỏi!" }]}
        >
          <div>
            <Button onClick={() => fileInputRef.current.click()} type="default">
              Chọn file
            </Button>
            <input
              type="file"
              accept=".zip"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile && (
              <div
                style={{
                  marginTop: 8,
                  color: "#1890ff",
                  display: "flex",
                  alignItems: "end",
                  gap: 10,
                }}
              >
                <p>Đã chọn: {selectedFile.name}</p>
                <a
                  href={URL.createObjectURL(selectedFile)}
                  download={selectedFile.name}
                  style={{
                    padding: "2px 4px",
                    border: "1px solid #cca06e",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdOutlineFileDownload className="btnDownload" />
                </a>
                <Button
                  size="small"
                  danger
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setSelectedFile(null);
                    form.setFieldsValue({ file: null });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <RiDeleteBinLine />
                </Button>
              </div>
            )}
            {!selectedFile && initialValues?.file && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={initialValues.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Tải file đã upload
                </a>
              </div>
            )}
          </div>
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
