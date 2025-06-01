import { useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./BlogManagement.scss";
import { Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import { confirmDelete } from "../../utils/alertHelper";
import AddAndEditBlog from "../../components/AddAndEditBlog";
export default function BlogManagement() {
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingBlog, setDetailingBlog] = useState(null);
  const showModal = (record = null) => {
    setDetailingBlog(record);
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
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },

    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
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
      title: "10 mẹo luyện nghe TOEIC hiệu quả",
      category: "Toeic tips",
      createdAt: "2024-05-01",
      views: 1200,
    },
    {
      key: "2",
      title: "Cách ghi nhớ từ vựng nhanh chóng",
      category: "Vocabulary",
      createdAt: "2024-05-03",
      views: 980,
    },
    {
      key: "3",
      title: "Kinh nghiệm luyện đọc hiểu TOEIC",
      category: "Reading skill",
      createdAt: "2024-05-05",
      views: 750,
    },
    {
      key: "4",
      title: "Tổng hợp cấu trúc ngữ pháp thường gặp",
      category: "Grammar",
      createdAt: "2024-05-07",
      views: 860,
    },
    {
      key: "5",
      title: "Luyện viết tiếng Anh cho người mới bắt đầu",
      category: "Writing skill",
      createdAt: "2024-05-10",
      views: 540,
    },
    {
      key: "6",
      title: "Cách phát âm chuẩn trong TOEIC",
      category: "Pronunciation",
      createdAt: "2024-05-12",
      views: 430,
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <div className="BlogManagement">
      <h2 className="PageTitle">Blog Management</h2>
      <div className="BlogManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên bài blog cần tìm"
            allowClear
          />
          <Select
            // defaultValue="Tất cả"
            placeholder="Lọc theo danh mục"
            onChange={handleChange}
            options={[
              { value: "Toeic tips", label: "Toeic tips" },
              { value: "Reading skill", label: "Reading skill" },
              { value: "All", label: "Tất cả" },
            ]}
            className="filter"
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
            {detailingBlog ? "Chi tiết bài blog" : "Thêm bài blog"}
          </div>
        }
      >
        <AddAndEditBlog
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={detailingBlog}
        />
      </BaseModal>
    </div>
  );
}
