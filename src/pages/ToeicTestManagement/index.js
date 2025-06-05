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
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [detailingExam, setDetailingExam] = useState(null);
  const [allExams, setAllExams] = useState([]);
  const [listExams, setListExams] = useState([]);
  const [listTestSets, setListTestSets] = useState([]);
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

  // lấy danh sách đề thi
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllExams();

        //đoạn này để fix warning key trong bảng
        const usersWithKey = res.map((exam) => ({
          ...exam,
          key: exam.id,
        }));
        setListExams(usersWithKey);
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

        //đoạn này để fix warning key trong bảng
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
      setListExams((prev) => prev.filter((exam) => exam.id !== Id));
      setAllExams((prev) => prev.filter((exam) => exam.id !== Id));
      showSuccess("Xóa đề thi thành công!");
    } catch (error) {
      showErrorMessage("Xóa đề thi thất bại!");
    }
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
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Thời lượng (phút)",
      dataIndex: "duration",
      key: "duration",
      render: (value, _, __) => {
        return value + " phút";
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
    const searchValue = e.target.value.toLowerCase();
    if (searchValue) {
      const filteredExam = allExams.filter((exam) =>
        exam.title?.toLowerCase().includes(searchValue)
      );
      setListExams(filteredExam);
    } else {
      setListExams(allExams); // Reset lại danh sách hiển thị
    }
  };
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const handleChange = (value) => {
    if (value === "All") {
      setListExams(allExams);
    } else {
      const filtered = allExams.filter((exam) => exam.collection === value);
      setListExams(filtered);
    }
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
      <BaseTable columns={columns} data={listExams} onChange={onChange} />

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
