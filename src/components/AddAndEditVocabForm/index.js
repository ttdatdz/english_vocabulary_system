import { useEffect, useState } from "react";
import "./AddAndEditVocabForm.scss";
import { Select, Button, Form, Input, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useParams } from "react-router-dom";
import { postFormData, put, putFormData } from "../../utils/request";
import { showSuccess } from "../../utils/alertHelper";
export default function AddAndEditVocabForm(props) {
  const { Option } = Select;
  const {
    form,
    onOK,
    confirmLoading,
    initialValues,
    onFetchingData,
    setConfirmLoading,
  } = props;
  const { flashcardId } = useParams();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileList, setFileList] = useState([]);

  const [uploadKey, setUploadKey] = useState(Date.now());

  useEffect(() => {
    // Tạo fileList chuẩn cho antd Upload từ image link hoặc để rỗng
    let imageFileList = [];
    if (initialValues && initialValues.image) {
      imageFileList = [
        {
          uid: "-1",
          name: initialValues.image.split("/").pop() || "image.png",
          status: "done",
          url: initialValues.image,
        },
      ];
    }
    form.setFieldsValue({
      ...initialValues,
      image: imageFileList, // <-- luôn là array!
    });
    setPreviewUrl(initialValues?.image || null);
    setFileList(imageFileList);
    setUploadKey(Date.now());
  }, [initialValues, form]);

  const onFinish = async (values) => {
    console.log("onFinish values.image:", values.image);
    if (initialValues && initialValues.id) {
      setConfirmLoading(true);
      const detailBody = {
        terminology: values.terminology,
        definition: values.definition,
        partOfSpeech: values.partOfSpeech,
        pronounce: values.pronounce,
        example: values.example,
        level: values.level,
        flashCardID: flashcardId,
      };

      // Update fields chữ
      await put(detailBody, `api/card/update/detail/${initialValues.id}`);

      // Update ảnh nếu user upload ảnh mới
      if (values.image && values.image.length > 0) {
        const fileNew = values.image.find((f) => !!f.originFileObj);
        // Chỉ gửi khi là file mới (originFileObj là File)
        if (fileNew && fileNew.originFileObj) {
          const formData = new FormData();
          formData.append("image", fileNew.originFileObj);
          await putFormData(
            `api/card/update/image/${initialValues.id}`,
            formData
          );
        }
      }
      setConfirmLoading(false);
      if (onOK) onOK();
      showSuccess("Cập nhật thành công!");
      if (onFetchingData) onFetchingData();
    } else {
      setConfirmLoading(true);
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          terminology: values.terminology,
          definition: values.definition,
          partOfSpeech: values.partOfSpeech,
          example: values.example,
          level: values.level || 1,
          flashCardID: flashcardId,
        })
      );
      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      const result = await postFormData("api/card/createCard", formData);
      if (!result) {
        setConfirmLoading(false);
        return;
      }
      setConfirmLoading(false);
      form.resetFields(); // Reset form sau khi thêm thành công
      setFileList([]); // Reset fileList để xóa ảnh đã chọn
      setPreviewUrl(null); // Reset previewUrl
      if (onOK) onOK();
      showSuccess("Thêm từ mới thành công");
      if (onFetchingData) onFetchingData();
    }
  };
  const handleImageChange = ({ fileList }) => {
    setFileList([...fileList]);
    form.setFieldsValue({ image: fileList });
    let newPreview = null;
    if (fileList.length > 0) {
      const last = fileList[fileList.length - 1];
      if (last.originFileObj) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(last.originFileObj);
        return; // Đợi reader.onload
      } else if (last.url) {
        newPreview = last.url;
      }
    }
    setPreviewUrl(newPreview);
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList ? e.fileList : [];
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
          label="Từ mới"
          name="terminology"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập từ mới!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Định nghĩa"
          name="definition"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng nhập định nghĩa!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Loại từ"
          name="partOfSpeech"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng chọn loại từ!" }]}
        >
          <Select>
            <Option value="Noun">Noun</Option>
            <Option value="Pronoun">Pronoun</Option>
            <Option value="Verb">Verb</Option>
            <Option value="Adjective">Adjective</Option>
            <Option value="Adverb">Adverb</Option>
            <Option value="Preposition">Preposition</Option>
            <Option value="Conjunction">Conjunction</Option>
            <Option value="Interjection">Interjection</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Phiên âm" name="pronounce" wrapperCol={{ span: 18 }}>
          <Input placeholder="Bỏ trống nếu bạn muốn tự động lấy phiên dịch." />
        </Form.Item>

        <Form.Item
          label="Ví dụ"
          name="example"
          wrapperCol={{ span: 18 }}
          //rules={[{ required: true, message: 'Vui lòng nhập ví dụ!' }]}
        >
          <TextArea />
        </Form.Item>

        <Form.Item
          label="Mức độ"
          name="level"
          wrapperCol={{ span: 18 }}
          rules={[{ required: true, message: "Vui lòng chọn độ khó!" }]}
        >
          <Select>
            <Option value={1}>Dễ</Option>
            <Option value={2}>Trung bình</Option>
            <Option value={3}>Khó</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Hình ảnh minh họa"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          wrapperCol={{ span: 18 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Upload
              key={uploadKey}
              beforeUpload={() => false}
              action="/upload.do"
              listType="picture-card"
              showUploadList={false}
              fileList={fileList}
              onChange={handleImageChange}
            >
              <button
                style={{
                  color: "inherit",
                  cursor: "inherit",
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                style={{ width: 200, marginTop: 8 }}
              />
            )}
          </div>
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
