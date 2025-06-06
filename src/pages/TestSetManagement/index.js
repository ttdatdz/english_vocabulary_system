import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./TestSetManagement.scss";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";
import AddAndEditTestSet from "../../components/AddAndEditTestSet";
import {
  DeleteTestSet,
  GetAllTestSets,
} from "../../services/Exam/testSetService";
export default function TestSetManagement() {
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingTestSet, setDetailingTestSet] = useState(null);
  const [allTestSets, setAllTestSets] = useState([]);
  const [listTestSets, setListTestSets] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());
  const showModal = (record) => {
    setDetailingTestSet(record);
    setOpen(true);
    setFormKey(Date.now());
  };
  const reloadExams = async () => {
    const res = await GetAllTestSets();
    // Thêm key cho mỗi exam (key = id)
    const TestSetsWithKey = res.map((exam) => ({
      ...exam,
      key: exam.id,
    }));
    setListTestSets(TestSetsWithKey);
    setAllTestSets(TestSetsWithKey);
  };
  const handleOk = (isSucced) => {
    reloadExams();
    setOpen(false);
    setConfirmLoading(false);
    if (isSucced) {
      showSuccess("Thêm đề thi thành công!");
    }
  };
  const handleDelete = async (Id) => {
    const confirmed = await confirmDelete("Bạn có chắc muốn xóa bộ đề này?");
    if (!confirmed) return;
    try {
      const result = await DeleteTestSet(Id);
      if (!result) {
        // showErrorMessage("Xóa bộ đề thất bại");
        return;
      }
      setListTestSets((prev) => prev.filter((testSet) => testSet.id !== Id));
      setAllTestSets((prev) => prev.filter((testSet) => testSet.id !== Id));
      showSuccess("Xóa bộ đề thành công!");
    } catch (error) {
      showErrorMessage("Xóa bộ đề thất bại!");
    }
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
      dataIndex: "collection",
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
            onClick={() => {
              handleDelete(record.id);
            }}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllTestSets();

        //đoạn này để fix warning key trong bảng
        const usersWithKey = res.map((user) => ({
          ...user,
          key: user.id,
        }));
        setAllTestSets(usersWithKey);
        setListTestSets(usersWithKey);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchUsers();
  }, []);

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (searchValue) {
      const filteredTestSet = allTestSets.filter((testSet) =>
        testSet.collection?.toLowerCase().includes(searchValue)
      );
      setListTestSets(filteredTestSet);
    } else {
      setListTestSets(allTestSets); // Reset lại danh sách hiển thị
    }
  };
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
            onChange={handleSearch}
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
      <BaseTable columns={columns} data={listTestSets} onChange={onChange} />

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {detailingTestSet ? "Chi tiết bộ đề" : "Thêm bộ đề"}
          </div>
        }
      >
        <AddAndEditTestSet
          onOK={handleOk}
          confirmLoading={confirmLoading}
          setConfirmLoading={setConfirmLoading}
          initialValues={detailingTestSet}
          open={open}
          key={formKey}
          setDetailingTestSet={setDetailingTestSet}
          reloadExams={reloadExams}
        />
      </BaseModal>
    </div>
  );
}
