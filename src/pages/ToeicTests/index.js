import { Button, Input, Pagination, Tabs, Spin, Select } from "antd";
import "./ToeicTest.scss";
import {
  SearchOutlined,
  InfoCircleOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import SelectField from "../../components/SelectField";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetAllClientExams, GetCustomExams } from "../../services/Exam/examService";
import { GetAllTestSets } from "../../services/Exam/testSetService";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";
import { removeVietnameseTones } from "../../utils/formatData";
import { post } from "../../utils/request";

import BaseModal from "../../components/BaseModal";
import { RiVipCrownFill } from "react-icons/ri";
import { checkExpiration } from "../../services/Payment/paymentService";

export default function ToiecTests() {
  // Tab state
  const [activeTab, setActiveTab] = useState("system");

  // System exams state
  const [allExams, setAllExams] = useState([]);
  const [listExams, setListExams] = useState([]);

  // Custom exams state (Đề của tôi)
  const [customExams, setCustomExams] = useState([]);
  const [filteredCustomExams, setFilteredCustomExams] = useState([]);

  // ✅ NEW: Filter cho tab custom
  const [customExamTypeFilter, setCustomExamTypeFilter] = useState("all"); // "all" | "toeic" | "disorder"

  // Common state
  const [listTestSets, setListTestSets] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedExamType, setSelectedExamType] = useState("TOEIC");
  const [currentPage, setCurrentPage] = useState(1);
  const [isVip, setIsVip] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const [openExamCreateOption, setOpenExamCreateOption] = useState(false);

  // Lấy danh sách đề thi hệ thống
  useEffect(() => {
    const fetchSystemExams = async () => {
      try {
        const res = await GetAllClientExams();
        if (res == null) {
          showErrorMessage("Load đề thi thất bại!");
          return;
        }
        console.log("System exams loaded:", res);
        const examsWithKey = res.map((exam) => ({
          ...exam,
          key: exam.id,
        }));
        setAllExams(examsWithKey);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách đề:", error);
      }
    };
    fetchSystemExams();
  }, []);

  // Lấy danh sách đề thi custom của user
  useEffect(() => {
    const fetchCustomExams = async () => {
      try {
        const res = await GetCustomExams();

        // DEBUG: Log để kiểm tra response từ API
        console.log("=== DEBUG Custom Exams API ===");
        console.log("Raw response:", res);
        if (res && res.length > 0) {
          console.log("First exam object:", res[0]);
          console.log("All keys:", Object.keys(res[0]));
        }

        // Normalize field name (backend có thể trả về `random` thay vì `isRandom`)
        const examsWithKey = (res || []).map((exam) => {
          const isRandomValue = exam.isRandom !== undefined ? exam.isRandom
            : exam.random !== undefined ? exam.random
              : false;

          return {
            ...exam,
            key: exam.id,
            isRandom: isRandomValue,
          };
        });

        console.log("Processed exams:", examsWithKey);

        setCustomExams(examsWithKey);
        setFilteredCustomExams(examsWithKey);
      } catch (error) {
        console.error("Error fetching custom exams:", error);
        showErrorMessage("Lỗi khi lấy danh sách đề của bạn");
      }
    };

    if (localStorage.getItem("accessToken")) {
      fetchCustomExams();
    }
  }, []);

  // Check VIP status
  useEffect(() => {
    const checkVipStatus = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await checkExpiration(userId);
        if (res?.hasValidPayment) {
          setIsVip(true);
        } else {
          setIsVip(false);
        }
      } catch (error) {
        console.error("Lỗi khi check expiration:", error);
      }
    };
    checkVipStatus();
  }, []);

  // Lấy danh sách bộ đề
  useEffect(() => {
    const fetchTestSets = async () => {
      try {
        const res = await GetAllTestSets();
        const testSetsWithKey = res
          .map((testSet) => ({
            ...testSet,
            key: testSet.id,
          }))
          .sort((a, b) => b.collection.localeCompare(a.collection));
        setListTestSets(testSetsWithKey);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchTestSets();
  }, []);

  // Lọc đề thi hệ thống
  useEffect(() => {
    let filtered = allExams;

    if (selectedExamType !== "All") {
      filtered = filtered.filter((exam) => exam.type === selectedExamType);
    }

    if (selectedCollection !== "All") {
      filtered = filtered.filter(
        (exam) => exam.collection === selectedCollection,
      );
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter(
        (exam) => Number(exam.year) === Number(selectedYear),
      );
    }

    if (searchValue) {
      const keyword = removeVietnameseTones(searchValue.trim());
      filtered = filtered.filter((exam) =>
        removeVietnameseTones(exam.title || "").includes(keyword),
      );
    }

    setListExams(filtered);
    setCurrentPage(1);
  }, [
    allExams,
    searchValue,
    selectedCollection,
    selectedExamType,
    selectedYear,
  ]);

  // ✅ UPDATED: Lọc đề thi custom (theo search + loại đề)
  useEffect(() => {
    let filtered = customExams;

    // Filter theo loại đề
    if (customExamTypeFilter === "toeic") {
      filtered = filtered.filter((exam) => exam.isRandom !== true);
    } else if (customExamTypeFilter === "disorder") {
      filtered = filtered.filter((exam) => exam.isRandom === true);
    }

    // Filter theo search
    if (searchValue) {
      const keyword = removeVietnameseTones(searchValue.trim());
      filtered = filtered.filter((exam) =>
        removeVietnameseTones(exam.title || "").includes(keyword),
      );
    }

    setFilteredCustomExams(filtered);
    setCurrentPage(1);
  }, [customExams, searchValue, customExamTypeFilter]);

  // Generate options
  const typeSet = new Set();
  for (let i = 0; i < allExams.length; i++) {
    const type = allExams[i].type;
    if (type) {
      typeSet.add(type);
    }
  }
  const uniqueType = Array.from(typeSet).sort((a, b) => b - a);
  const examOptions = [
    { label: "Tất cả", value: "All" },
    ...uniqueType?.map((type) => ({
      label: type,
      value: type,
    })),
  ];

  const testSetOptions = [
    { label: "Tất cả", value: "All" },
    ...listTestSets?.map((testSet) => ({
      label: testSet.collection,
      value: testSet.collection,
    })),
  ];

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

  // ✅ NEW: Options cho filter loại đề custom
  const customTypeOptions = [
    { label: "Tất cả", value: "all" },
    { label: "TOEIC Format", value: "toeic" },
    { label: "Tự do", value: "disorder" },
  ];

  // Handlers
  const handleClick = (id) => {
    navigate(`/DetailExam/${id}`);
  };

  const handleEditCustomExam = (e, exam) => {
    e.stopPropagation();

    console.log("Edit exam:", exam, "isRandom:", exam.isRandom);

    if (exam.isRandom === true) {
      navigate(`/disorder-exam/${exam.id}`);
    } else {
      navigate(`/DetailToeicCustomExam/${exam.id}`);
    }
  };

  const handleCustomExamClick = (exam) => {
    console.log("Click exam:", exam, "isRandom:", exam.isRandom);

    if (exam.isRandom === true) {
      navigate(`/disorder-exam/${exam.id}/practice`);
    } else {
      navigate(`/DetailExam/${exam.id}`);
    }
  };

  const handlePracticeCustomExam = (e, exam) => {
    e.stopPropagation();

    console.log("Practice exam:", exam, "isRandom:", exam.isRandom);

    if (exam.isRandom === true) {
      navigate(`/disorder-exam/${exam.id}/practice`);
    } else {
      navigate(`/DetailExam/${exam.id}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
    setSearchValue("");
    setCustomExamTypeFilter("all"); // Reset filter khi đổi tab
  };

  // Pagination
  const currentList = activeTab === "system" ? listExams : filteredCustomExams;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentList.slice(startIndex, endIndex);

  function handleExamCreateBtn() {
    if (!isVip) {
      const userId = localStorage.getItem("userId");
      navigate(`/PricingPage/${userId}`);
    } else {
      setOpenExamCreateOption(true);
    }
  }

  const handleSelectType = async (type) => {
    if (type === "toeic") {
      setOpenExamCreateOption(false);
      navigate("/CreateToeicExam");
    }

    if (type === "custom") {
      setCreatingExam(true);
      try {
        const result = await post({}, "/api/disorder-exam/create", true);
        if (result?.id) {
          setOpenExamCreateOption(false);
          navigate(`/disorder-exam/${result.id}`);
        } else {
          showErrorMessage("Tạo đề thất bại", "Không nhận được ID đề thi");
        }
      } catch (error) {
        showErrorMessage("Tạo đề thất bại", error?.message || "Có lỗi xảy ra");
      } finally {
        setCreatingExam(false);
      }
    }
  };

  // Helper functions
  const getExamTypeLabel = (exam) => {
    if (exam.isRandom === true) {
      return "Tự do";
    }
    return "TOEIC";
  };

  const getExamBadgeClass = (exam) => {
    if (exam.isRandom === true) {
      return "Test-item__badge--random";
    }
    return "Test-item__badge--toeic";
  };

  // Tab items
  const tabItems = [
    {
      key: "system",
      label: "Hệ thống",
    },
    {
      key: "custom",
      label: "Đề của tôi",
    },
  ];

  return (
    <>
      <div className="ToeicTests-page">
        <div className="ToeicTests-page__header">
          <div className="MainContainer">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <h2 className="ToeicTests-page__header-title">Đề thi</h2>
            </div>
          </div>
        </div>

        <div className="MainContainer">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="ToeicTests-page__tabs"
            items={tabItems}
          />

          {/* Filters - Tab Hệ thống */}
          {activeTab === "system" && (
            <div className="ToeicTests-page__ContainerSelect">
              <SelectField
                label="Kì thi"
                defaultValue="TOEIC"
                onChange={(val) => setSelectedExamType(val)}
                options={examOptions}
                width={"220px"}
              />
              <SelectField
                label="Bộ đề"
                defaultValue="All"
                onChange={(val) => setSelectedCollection(val)}
                options={testSetOptions}
                width={"220px"}
              />
              <SelectField
                label="Năm"
                defaultValue="All"
                onChange={(val) => setSelectedYear(val)}
                options={yearOptions}
                width={"220px"}
              />
            </div>
          )}

          {/* ✅ NEW: Filters - Tab Đề của tôi */}
          {activeTab === "custom" && (
            <div className="ToeicTests-page__ContainerSelect ToeicTests-page__ContainerSelect--custom">
              <div className="ToeicTests-page__custom-filter">
                <span className="filter-label">Loại đề:</span>
                <Select
                  value={customExamTypeFilter}
                  onChange={(val) => setCustomExamTypeFilter(val)}
                  options={customTypeOptions}
                  style={{ width: 150 }}
                  className="custom-type-select"
                />
              </div>

              <Button
                type="primary"
                className="btn create-toeic-test-btn"
                onClick={handleExamCreateBtn}
              >
                Tạo đề thi mới
                {!isVip && (
                  <RiVipCrownFill
                    style={{ fontSize: "16px", color: "yellow" }}
                  />
                )}
              </Button>
            </div>
          )}

          <Input
            className="ToeicTests-page__Search"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên đề bạn muốn tìm kiếm"
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
          />

          <div className="ToeicTests-page__listTest">
            <div className="Test-list">
              {currentItems?.length === 0 ? (
                <div className="Test-list__empty">
                  {activeTab === "custom"
                    ? "Bạn chưa có đề thi nào. Hãy tạo đề thi mới!"
                    : "Không tìm thấy đề thi nào."}
                </div>
              ) : (
                currentItems?.map((item, index) => (
                  <div
                    key={item.id}
                    className={`Test-item ${activeTab === "custom" ? "Test-item--custom" : ""}`}
                    onClick={() =>
                      activeTab === "system"
                        ? handleClick(item.id)
                        : handleCustomExamClick(item)
                    }
                  >
                    <div className="Test-item__index">
                      {startIndex + index + 1}
                    </div>
                    <div className="Test-item__content">
                      <div className="Test-item__title">{item.title}</div>
                      {/* Badge và meta info cho đề custom */}
                      {activeTab === "custom" && (
                        <div className="Test-item__meta">
                          <span className={`Test-item__badge ${getExamBadgeClass(item)}`}>
                            {getExamTypeLabel(item)}
                          </span>
                          {item.totalQuestions > 0 && (
                            <span className="Test-item__questions">
                              {item.totalQuestions} câu
                            </span>
                          )}
                          {item.duration && (
                            <span className="Test-item__duration">
                              {item.duration} phút
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="Test-item__actions">
                      {activeTab === "custom" && (
                        <>
                          <Button
                            type="text"
                            icon={<PlayCircleOutlined />}
                            className="Test-item__action-btn"
                            onClick={(e) => handlePracticeCustomExam(e, item)}
                            title="Làm bài"
                          />
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            className="Test-item__action-btn"
                            onClick={(e) => handleEditCustomExam(e, item)}
                            title="Chỉnh sửa đề thi"
                          />
                        </>
                      )}
                      <InfoCircleOutlined className="Test-item__info" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={currentList.length}
              onChange={handlePageChange}
              align="center"
              style={{ textAlign: "center", marginTop: "20px" }}
            />
          </div>
        </div>
      </div>

      <BaseModal
        open={openExamCreateOption}
        onCancel={() => setOpenExamCreateOption(false)}
        title={
          <div style={{ fontSize: 22, color: "#ff8159", fontWeight: "400" }}>
            Bạn muốn tạo loại đề thi nào?
          </div>
        }
      >
        <div className="OptionForm">
          <Button
            className="OptionForm__button"
            type="primary"
            onClick={() => handleSelectType("toeic")}
            disabled={creatingExam}
          >
            Toeic Exam
          </Button>
          <Button
            className="OptionForm__button"
            onClick={() => handleSelectType("custom")}
            disabled={creatingExam}
          >
            {creatingExam ? <Spin size="small" /> : "Custom Exam"}
          </Button>
        </div>
      </BaseModal>
    </>
  );
}
