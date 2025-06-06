import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./ToeicTestManagement.scss";
import { Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";
import AddAndEditExam from "../../components/AddAndEditExam";
import { DeleteExam, GetAllExams } from "../../services/Exam/examService";
import { GetAllTestSets } from "../../services/Exam/testSetService";

export default function ToeicTestManagement() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailingExam, setDetailingExam] = useState(null);
  const [allExams, setAllExams] = useState([]);
  const [listExams, setListExams] = useState([]);
  const [listTestSets, setListTestSets] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());
  const [searchValue, setSearchValue] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");

  const showModal = (record) => {
    setDetailingExam(record);
    setOpen(true);
    setFormKey(Date.now());
  };
  const handleClose = () => {
    setOpen(false);
    setDetailingExam(null);
  };

  const reloadExams = async () => {
    const res = await GetAllExams();
    const examsWithKey = res.map((exam) => ({
      ...exam,
      key: exam.id,
    }));
    setAllExams(examsWithKey);
  };

  const handleOk = (isSucced) => {
    reloadExams();
    setOpen(false);
    setConfirmLoading(false);
    if (isSucced) {
      showSuccess("Thêm đề thi thành công!");
    }
  };

  // lấy danh sách đề thi
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllExams();
        const usersWithKey = res.map((exam) => ({
          ...exam,
          key: exam.id,
        }));
        setAllExams(usersWithKey);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchUsers();
  }, []);

  // lấy danh sách bộ đề
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllTestSets();
        const usersWithKey = res
          .map((user) => ({
            ...user,
            key: user.id,
          }))
          .sort((a, b) => b.collection.localeCompare(a.collection));
        setListTestSets(usersWithKey);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchUsers();
  }, []);

  // Xóa đề thi
  const handleDelete = async (Id) => {
    const confirmed = await confirmDelete("Bạn có chắc muốn đề thi này?");
    if (!confirmed) return;
    try {
      const result = await DeleteExam(Id);
      if (!result) {
        showErrorMessage("Xóa đề thi thất bại");
        return;
      }
      setAllExams((prev) => prev.filter((exam) => exam.id !== Id));
      showSuccess("Xóa đề thi thành công!");
    } catch (error) {
      showErrorMessage("Xóa đề thi thất bại!");
    }
  };

  // Lọc dữ liệu dựa trên searchValue và selectedCollection
  useEffect(() => {
    let filtered = allExams;

    // Tìm kiếm trên nhiều trường (ở đây là title, có thể mở rộng)
    if (searchValue) {
      filtered = filtered.filter(
        (exam) => exam.title?.toLowerCase().includes(searchValue)
        // Có thể thêm các trường khác ở đây nếu muốn
      );
    }

    // Lọc theo bộ đề
    if (selectedCollection !== "All") {
      filtered = filtered.filter(
        (exam) => exam.collection === selectedCollection
      );
    }

    setListExams(filtered);
  }, [allExams, searchValue, selectedCollection]);

  const columns = [
    {
      title: "Số thứ tự",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên bài thi",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
      render: (value) => value + " phút",
    },
    {
      title: "Bộ đề",
      dataIndex: "collection",
      key: "collection",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          <IoEye className="Action__Detail" onClick={() => showModal(record)} />
          <MdDelete
            className="Action__Delete"
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const handleChange = (value) => {
    setSelectedCollection(value);
  };

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
            onChange={handleSearch}
          />
          <Select
            defaultValue="All"
            placeholder="Lọc theo bộ đề"
            onChange={handleChange}
            options={[
              { label: "Tất cả", value: "All" },
              ...listTestSets.map((testSet) => ({
                label: testSet.collection,
                value: testSet.collection,
              })),
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
      <BaseTable columns={columns} data={listExams} onChange={() => {}} />

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
          setDetailingExam={setDetailingExam}
          listTestSets={listTestSets}
          setConfirmLoading={setConfirmLoading}
          open={open}
          key={formKey}
        />
      </BaseModal>
    </div>
  );
}
