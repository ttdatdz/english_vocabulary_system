import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./TestSetManagement.scss";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import { confirmDelete } from "../../utils/alertHelper";
import AddAndEditTestSet from "../../components/AddAndEditTestSet";
import { GetAllTestSets } from "../../services/Exam/testSetService";
export default function TestSetManagement() {
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
      title: "Tên bộ đề",
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
      name: "ETS 2024",
    },
    {
      key: "2",
      name: "ETS 2023",
    },
    {
      key: "3",
      name: "ETS 2022",
    },
    {
      key: "4",
      name: "ETS 2021",
    },
    {
      key: "5",
      name: "ETS 2020",
    },
    {
      key: "6",
      name: "ETS 2019",
    },
  ];

  const [ListTestSets, setListTestSets] = useState([]);
  const fetchAPI = async () => {
    const result = await GetAllTestSets();
    console.log(">>>>>>>>>>.check result", result);

    setListTestSets(result);
  };
  useEffect(() => {
    fetchAPI();
  }, []);

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  // console.log(">>>>.check detailingCategory", detailingCategory);
  return (
    <div className="TestSetManagement">
      <h2 className="PageTitle">Test Set Management</h2>
      <div className="TestSetManagement__header">
        <div className="FindInformation">
          <Input
            className="SearchBar SearchBar--size"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên bộ đề cần tìm"
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
            {detailingCategory ? "Chi tiết bộ đề" : "Thêm bộ đề"}
          </div>
        }
      >
        <AddAndEditTestSet
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={detailingCategory}
        />
      </BaseModal>
    </div>
  );
}
