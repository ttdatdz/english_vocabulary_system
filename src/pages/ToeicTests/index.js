import { Button, Input, Pagination, Tabs } from "antd";
import "./ToeicTest.scss";
import {
  SearchOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import SelectField from "../../components/SelectField";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetAllExams, GetCustomExams } from "../../services/Exam/examService";
import { GetAllTestSets } from "../../services/Exam/testSetService";
import { showErrorMessage } from "../../utils/alertHelper";
import { removeVietnameseTones } from "../../utils/formatData";

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

  // Common state
  const [listTestSets, setListTestSets] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedExamType, setSelectedExamType] = useState("TOEIC");
  const [currentPage, setCurrentPage] = useState(1);
  const [isVip, setIsVip] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const [openExamCreateOption, setOpenExamCreateOption] = useState(false);

  // Lấy danh sách đề thi hệ thống
  useEffect(() => {
    const fetchSystemExams = async () => {
      try {
        const res = await GetAllExams();
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
        const examsWithKey = (res || []).map((exam) => ({
          ...exam,
          key: exam.id,
        }));
        setCustomExams(examsWithKey);
        setFilteredCustomExams(examsWithKey);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách đề của bạn:", error);
      }
    };

    // Chỉ fetch khi đã đăng nhập
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
          setIsVip(true);
        }
      } catch (error) {
        showErrorMessage("Lỗi khi check expiration:", error);
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

    setListExams(filtered);
    setCurrentPage(1);
  }, [
    allExams,
    searchValue,
    selectedCollection,
    selectedExamType,
    selectedYear,
  ]);

  // Lọc đề thi custom (chỉ theo search)
  useEffect(() => {
    let filtered = customExams;

    if (searchValue) {
      const keyword = removeVietnameseTones(searchValue.trim());
      filtered = filtered.filter((exam) =>
        removeVietnameseTones(exam.title || "").includes(keyword)
      );
    }

    setFilteredCustomExams(filtered);
    setCurrentPage(1);
  }, [customExams, searchValue]);

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

  // Handlers
  const handleClick = (id) => {
    navigate(`/DetailExam/${id}`);
  };

  const handleEditCustomExam = (e, id) => {
    e.stopPropagation(); // Ngăn click vào item cha
    navigate(`/DetailToeicCustomExam/${id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
    setSearchValue("");
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

  const handleSelectType = (type) => {
    if (type === "toeic") {
      navigate("/CreateToeicExam");
    }
    if (type === "custom") {
      navigate("/CreateCustomExam");
    }
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

          {/* Filters - chỉ hiển thị cho tab Hệ thống */}
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

          {/* Nút tạo đề cho tab Custom */}
          {activeTab === "custom" && (
            <div className="ToeicTests-page__ContainerSelect ToeicTests-page__ContainerSelect--custom">
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
                    className={`Test-item ${activeTab === "custom" ? "Test-item--custom" : ""
                      }`}
                    onClick={() =>
                      activeTab === "system"
                        ? handleClick(item.id)
                        : handleClick(item.id)
                    }
                  >
                    <div className="Test-item__index">
                      {startIndex + index + 1}
                    </div>
                    <div className="Test-item__title">{item.title}</div>
                    <div className="Test-item__actions">
                      {activeTab === "custom" && (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          className="Test-item__edit-btn"
                          onClick={(e) => handleEditCustomExam(e, item.id)}
                          title="Chỉnh sửa đề thi"
                        />
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
          >
            Toeic Exam
          </Button>
          <Button
            className="OptionForm__button"
            onClick={() => handleSelectType("custom")}
          >
            Custom Exam
          </Button>
        </div>
      </BaseModal>
    </>
  );
}