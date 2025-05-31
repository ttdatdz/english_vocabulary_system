import { useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./BlogCategoryManagement.scss";
import { Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import { confirmDelete } from "../../utils/alertHelper";
import AddAndEditExam from "../../components/AddAndEditExam";
import AddAndEditCategory from "../../components/AddAndEditCategory";
export default function BlogCategoryManagent() {
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingCategory, setDetailingCategory] = useState(null);
  const showModal = (record) => {
    setDetailingCategory(record);
    setOpen(true);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const columns = [
    {
      title: "Số thứ tự",
      key: "index",
      // Số thứ tự (STT) nên phản ánh đúng vị trí hiện tại của dòng trên bảng, không phải vị trí gốc trong mảng data.
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "testName",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          <IoEye className="Action__Detail" onClick={() => showModal(record)} />
          <MdDelete
            className="Action__Delete"
            onClick={() => confirmDelete()}
          />
        </div>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      name: "Toeic Tips",
    },
    {
      key: "2",
      name: "Grammar",
    },
    {
      key: "3",
      name: "Vocabulary",
    },
    {
      key: "4",
      name: "Listening Practice",
    },
    {
      key: "5",
      name: "Reading Skills",
    },
    {
      key: "6",
      name: "Writing Skills",
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  // console.log(">>>>.check detailingCategory", detailingCategory);
  return (
    <div className="CategoryManagement">
      <h2 className="PageTitle">Blog Category Management</h2>
      <div className="CategoryManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên danh mục cần tìm"
            allowClear
          />
        </div>
        <Button
          type="primary"
          className="create-topic-button create-topic-button--size"
          onClick={() => showModal(null)}
        >
          + Thêm
        </Button>
      </div>
      <BaseTable columns={columns} data={data} onChange={onChange} />

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {detailingCategory ? "Chi tiết danh mục" : "Thêm danh mục"}
          </div>
        }
      >
        <AddAndEditCategory
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={detailingCategory}
        />
      </BaseModal>
    </div>
  );
}
