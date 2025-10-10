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
import { removeVietnameseTones } from "../../utils/formatData";
import { get } from "../../utils/request";

export default function ToeicTestManagement() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailingExam, setDetailingExam] = useState(null);
  const [allExams, setAllExams] = useState([]);
  const [listExams, setListExams] = useState([]);
  const [listTestSets, setListTestSets] = useState([]);
  const [listTestTypes, setListTestTypes] = useState([]);
  const [formKey, setFormKey] = useState(Date.now());
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
  });

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
    const fetchTestSets = async () => {
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

    const fetchTestTypes = async () => {
      try {
        const res = await get("api/exam/type/getAll");
        if (res != null)
          setListTestTypes(res);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách loại đề thi");
        console.error("Lỗi khi lấy danh sách loại đề thi:", error);
      }
    }
    fetchTestTypes();
    fetchTestSets();
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

    if (selectedCollection !== "All") {
      filtered = filtered.filter(
        (exam) => exam.collection === selectedCollection
      );
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter(
        (exam) => Number(exam.year) === Number(selectedYear)
      );
    }

    if (searchValue) {
      const keyword = removeVietnameseTones(searchValue.trim());
      filtered = filtered.filter((exam) =>
        removeVietnameseTones(exam.title || "").includes(keyword)
      );
    }
    setPagination((prev) => ({ ...prev, current: 1 })); // Luôn reset về trang 1
    setListExams(filtered);
  }, [allExams, searchValue, selectedCollection, selectedYear]);
  const columns = [
    {
      title: "Số thứ tự",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
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
      title: "Năm",
      dataIndex: "year",
      key: "year",
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

  const yearSet = new Set();
  for (let i = 0; i < allExams.length; i++) {
    const year = allExams[i].year;
    if (year) {
      yearSet.add(year);
    }
  }
  const uniqueYears = Array.from(yearSet).sort((a, b) => b - a);
  const yearOptions = [
    { label: "Tất cả", value: "All" },
    ...uniqueYears?.map((year) => ({
      label: year,
      value: year,
    })),
  ];
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
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
            onChange={(val) => setSelectedCollection(val)}
            options={[
              { label: "Tất cả", value: "All" },
              ...listTestSets.map((testSet) => ({
                label: testSet.collection,
                value: testSet.collection,
              })),
            ]}
            className="filter"
          />
          <Select
            defaultValue="All"
            placeholder="Lọc theo năm"
            onChange={(val) => setSelectedYear(val)}
            options={yearOptions}
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
      <BaseTable
        columns={columns}
        data={listExams}
        pagination={{
          ...pagination,
          total: listExams.length,
          showSizeChanger: false,
        }}
        rowKey="id"
        onChange={handleTableChange}
      />

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
          listTestTypes={listTestTypes}
          setConfirmLoading={setConfirmLoading}
          open={open}
          key={formKey}
          reloadExams={reloadExams}
        />
      </BaseModal>
    </div>
  );
}
