import { useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./FeedbackManagement.scss";
import { Input, Select } from "antd";
import { SearchOutlined, StarFilled } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import { confirmDelete } from "../../utils/alertHelper";
import DetailFeedbackForm from "../../components/DetailFeedbackForm";
export default function FeedbackManagement() {
  const [open, setOpen] = useState(false); // mở modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const showModal = (record) => {
    setSelectedFeedback(record);
    setOpen(true);
  };
  const handleOk = () => {
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Người đánh giá",
      dataIndex: "userName",
      key: "userName",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      key: "rating",
      width: 80,
      render: (rating) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>{rating}</span>
          <StarFilled style={{ color: "#f59e0b" }} />
        </div>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
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
      userName: "Nguyễn Văn A",
      email: "vana@gmail.com",
      content: "Ứng dụng rất hữu ích!",
      rating: 5,
      date: "2024-06-01",
      image:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
      key: "2",
      userName: "Trần Thị B",
      email: "thib@gmail.com",
      content: "Nên bổ sung thêm phần luyện nghe.",
      rating: 4,
      date: "2024-05-28",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  // console.log(">>>>.check detailingFeedback", detailingFeedback);
  return (
    <div className="FeedbackManagement">
      <h2 className="PageTitle">Feedback Management</h2>
      <div className="FeedbackManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên người gửi"
            allowClear
          />
          <Select
            // defaultValue="Tất cả"
            placeholder="Lọc theo sao"
            onChange={handleChange}
            options={[
              { value: "5", label: "5" },
              { value: "4", label: "4" },
              { value: "3", label: "3" },
              { value: "2", label: "2" },
              { value: "1", label: "1" },
              { value: "All", label: "Tất cả" },
            ]}
            className="filter"
          />
        </div>
      </div>
      <BaseTable columns={columns} data={data} onChange={onChange} />
      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            Chi tiết đánh giá
          </div>
        }
      >
        {selectedFeedback ? (
          <DetailFeedbackForm feedback={selectedFeedback} onReply={handleOk} />
        ) : null}
      </BaseModal>
    </div>
  );
}
