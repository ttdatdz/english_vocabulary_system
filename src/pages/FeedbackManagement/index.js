import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import "./FeedbackManagement.scss";
import { Input, Select } from "antd";
import { SearchOutlined, StarFilled } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";
import DetailFeedbackForm from "../../components/DetailFeedbackForm";
import {
  DeleteEvaluate,
  GetAllEvaluate,
} from "../../services/Evaluate/evaluateService";
import dayjs from "dayjs";
import { removeVietnameseTones } from "../../utils/formatData";

export default function FeedbackManagement() {
  const [open, setOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [listFeedbacks, setListFeedbacks] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStar, setSelectedStar] = useState("All");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
  });
  const showModal = (record) => {
    setSelectedFeedback(record);
    setOpen(true);
  };

  const handleOk = () => {
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Lấy danh sách feedback
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllEvaluate();
        const formattedRes = res.map((item) => ({
          ...item,
          date: dayjs(item.createAt).format("YYYY-MM-DD"),
        }));
        setAllFeedbacks(formattedRes);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách phản hồi:", error);
      }
    };
    fetchUsers();
  }, []);

  // Lọc dữ liệu dựa trên searchValue và selectedStar
  useEffect(() => {
    let filtered = allFeedbacks;

    if (searchValue) {
      const keyword = removeVietnameseTones(searchValue.trim());
      filtered = filtered.filter((feedback) =>
        removeVietnameseTones(feedback.fullName || "").includes(keyword)
      );
    }

    if (selectedStar !== "All") {
      filtered = filtered.filter(
        (feedback) => Number(feedback.star) === Number(selectedStar)
      );
    }
    setPagination((prev) => ({ ...prev, current: 1 })); // Luôn reset về trang 1
    setListFeedbacks(filtered);
  }, [allFeedbacks, searchValue, selectedStar]);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: "Người đánh giá",
      dataIndex: "fullName",
      key: "fullName",
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
      dataIndex: "star",
      key: "star",
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
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  // Xóa feedback
  const handleDelete = async (Id) => {
    const confirmed = await confirmDelete("Bạn có chắc muốn xóa feedback này?");
    if (!confirmed) return;
    try {
      const result = await DeleteEvaluate(Id);
      if (!result) {
        showErrorMessage("Xóa Feedback thất bại");
        return;
      }
      setAllFeedbacks((prev) => prev.filter((feedback) => feedback.id !== Id));
      showSuccess("Xóa Feedback thành công!");
    } catch (error) {
      showErrorMessage("Xóa Feedback thất bại!");
    }
  };
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };
  const handleSearch = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const handleChange = (value) => {
    setSelectedStar(value);
  };

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
            onChange={handleSearch}
          />
          <Select
            placeholder="Lọc theo sao"
            onChange={handleChange}
            options={[
              { value: "All", label: "Tất cả" },
              { value: "5", label: "5" },
              { value: "4", label: "4" },
              { value: "3", label: "3" },
              { value: "2", label: "2" },
              { value: "1", label: "1" },
            ]}
            className="filter"
          />
        </div>
      </div>

      <BaseTable
        columns={columns}
        data={listFeedbacks}
        onChange={handleTableChange}
        pagination={{
          ...pagination,
          total: listFeedbacks.length,
          showSizeChanger: false,
        }}
        rowKey="id"
      />

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
