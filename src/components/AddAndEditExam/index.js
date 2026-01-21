import { useEffect, useRef, useState } from "react";
import "./AddAndEditExam.scss";
import { Button, Form, Input, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  CreateExam,
  DeleteExam,
  getDetailExam,
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
    listTestTypes,
    setConfirmLoading,
    open,
    reloadExams,
  } = props;
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const [detailExamData, setDetailExamData] = useState(null);

  console.log("Check listtestTypes", listTestTypes);
  console.log("Check initial", initialValues);

  useEffect(() => {
    const getDetail = async () => {
      const result = await getDetailExam(initialValues.id);
      setDetailExamData(result); // <== lưu lại
      setSelectedFile(result.fileImportName);
      form.resetFields();
      form.setFieldsValue({
        title: result?.title || "",
        collection: result?.collection || "",
        duration: result?.duration || "",
        type: result?.type || "",
        year: result?.year || "",
        file: result?.fileImportName || null,
      });
    };
    if (initialValues) {
      getDetail();
    }
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
        isRandom: false
      };
      const result = await CreateExam(examData);
      if (!result) {
        setConfirmLoading(false);
        // showErrorMessage("Thêm thông tin đề thi thất bại!");
        return;
      }

      let importResult = true;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("examID", result.id);
        importResult = await importFileQuestion(formData);
        if (!importResult) {
          setConfirmLoading(false);
          await DeleteExam(result.id);
          // showErrorMessage("Import câu hỏi thất bại!");
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
      const examData = {
        title: values?.title,
        collection: values?.collection,
        duration: values?.duration,
        type: values?.type,
        year: values?.year,
        isRandom: false
      };
      const result = await UpdateExam(examData, initialValues.id);
      if (!result) {
        setConfirmLoading(false);
        return;
      }
      let importResult = true;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("examID", initialValues.id);
        importResult = await importFileQuestion(formData);
        if (!importResult) {
          setConfirmLoading(false);
          await UpdateExam(detailExamData, detailExamData.id);
          return;
        }
      }

      if (result && importResult) {
        const updatedDetail = await getDetailExam(initialValues.id);
        setDetailExamData(updatedDetail); // Cập nhật lại detailExamData
        form.setFieldsValue({
          title: updatedDetail?.title || "",
          collection: updatedDetail?.collection || "",
          duration: updatedDetail?.duration || "",
          type: updatedDetail?.type || "",
          year: updatedDetail?.year || "",
          file: updatedDetail?.fileImportName || null,
        });
        setSelectedFile(updatedDetail?.fileImportName || null);

        setConfirmLoading(false);
        setIsEditing(false);
        showSuccess("Cập nhật đề thi thành công!");
        reloadExams();
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      form.setFieldsValue({ file });
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    if (detailExamData) {
      form.setFieldsValue({
        title: detailExamData?.title || "",
        collection: detailExamData?.collection || "",
        duration: detailExamData?.duration || "",
        type: detailExamData?.type || "",
        year: detailExamData?.year || "",
        file: detailExamData?.fileImportName || null,
      });
      setSelectedFile(detailExamData.fileImportName || null);
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
          <Select
            placeholder="Chọn loại đề"
            options={[
              ...listTestTypes.map((testType) => ({
              label: testType.type,
              value: testType.type,
            })),
          ]}
          />
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
              onClick={(e) => (e.target.value = "")}
            />
            {selectedFile instanceof File ? (
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
            ) : selectedFile ? (
              <div style={{ marginTop: 8 }}>
                <p>File đã upload: {selectedFile}</p>
              </div>
            ) : null}

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
