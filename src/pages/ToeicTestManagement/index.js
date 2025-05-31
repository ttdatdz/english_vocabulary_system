import { useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./ToeicTestManagement.scss";
import { Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import { confirmDelete } from "../../utils/alertHelper";
import AddAndEditExam from "../../components/AddAndEditExam";
export default function ToeicTestManagement() {
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingExam, setDetailingExam] = useState(null);
  const showModal = (record) => {
    setDetailingExam(record);
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
      title: "Tên bài thi",
      dataIndex: "testName",
      key: "testName",
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
      render: (value, _, __) => {
        return value + " phút";
      },
      sorter: {
        compare: (a, b) => a.duration - b.duration,
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: {
        compare: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      },
    },
    {
      title: "Bộ đề",
      dataIndex: "examSet",
      key: "examSet",
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
      testName: "ETS 2024 - Test 1",
      duration: 120,
      createdAt: "2024-05-01",
      examSet: "ETS 2024",
    },
    {
      key: "2",
      testName: "ETS 2024 - Test 2",
      duration: 120,
      createdAt: "2024-05-10",
      examSet: "ETS 2024",
    },
    {
      key: "3",
      testName: "Mini Test A",
      duration: 30,
      createdAt: "2024-04-20",
      examSet: "Mini Test",
    },
    {
      key: "4",
      testName: "Mini Test B",
      duration: 30,
      createdAt: "2024-04-25",
      examSet: "Mini Test",
    },
    {
      key: "5",
      testName: "Mini Test C",
      duration: 30,
      createdAt: "2024-04-25",
      examSet: "Mini Test",
    },
    {
      key: "6",
      testName: "Mini Test D",
      duration: 30,
      createdAt: "2024-04-25",
      examSet: "Mini Test",
    },
  ];
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  console.log(">>>>.check detailingExam", detailingExam);
  return (
    <div className="ToeicTestManagement">
      <h2 className="PageTitle">Toiec test Management</h2>
      <div className="ToeicTestManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên bài thi cần tìm"
            allowClear
          />
          <Select
            // defaultValue="Tất cả"
            placeholder="Lọc theo bộ đề"
            onChange={handleChange}
            options={[
              { value: "ETS2024", label: "ETS 2024" },
              { value: "ETS2023", label: "ETS 2023" },
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
            {detailingExam ? "Chi tiết đề thi" : "Thêm đề thi"}
          </div>
        }
      >
        <AddAndEditExam
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={detailingExam}
        />
      </BaseModal>
    </div>
  );
}
