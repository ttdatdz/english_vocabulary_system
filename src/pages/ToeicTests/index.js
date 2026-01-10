import { Button, Input, Pagination } from "antd";
import "./ToeicTest.scss";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import SelectField from "../../components/SelectField";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetAllExams } from "../../services/Exam/examService";
import { GetAllTestSets } from "../../services/Exam/testSetService";
import { showErrorMessage } from "../../utils/alertHelper";
import { removeVietnameseTones } from "../../utils/formatData";

import BaseModal from "../../components/BaseModal";
import { RiVipCrownFill } from "react-icons/ri";
import { checkExpiration } from "../../services/Payment/paymentService";

export default function ToiecTests() {
  const [allExams, setAllExams] = useState([]);
  const [listExams, setListExams] = useState([]);
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
        showErrorMessage("Lỗi khi lấy danh sách đề:", error);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await checkExpiration(userId);
        console.log("res checkExpiration", res);
        if (res?.hasValidPayment) {
          setIsVip(true);
        } else {
          setIsVip(false);
        }
      } catch (error) {
        showErrorMessage("Lỗi khi check expiration:", error);
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
        showErrorMessage("Lỗi khi lấy danh sách bộ đề:", error);
      }
    };
    fetchUsers();
  }, []);

  // Lọc dữ liệu dựa trên các bộ lọc và từ khóa tìm kiếm
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
    setCurrentPage(1); // reset về trang đầu tiên khi lọc
  }, [
    allExams,
    searchValue,
    selectedCollection,
    selectedExamType,
    selectedYear,
  ]);

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

  const handleClick = (id) => {
    navigate(`/DetailExam/${id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = listExams.slice(startIndex, endIndex);

  function handleExamCreateBtn() {
    if (!isVip) {
      // Nếu chưa nâng cấp vip, chuyển đến trang pricing
      const userId = localStorage.getItem("userId");
      navigate(`/PricingPage/${userId}`);
    } else {
      // Nếu đã nâng cấp, mở modal và bỏ icon VIP
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

            <Button
              type="primary"
              className="btn create-toeic-test-btn"
              onClick={handleExamCreateBtn}
            >
              Tạo đề thi
              {!isVip && (
                <RiVipCrownFill style={{ fontSize: "16px", color: "yellow" }} />
              )}
            </Button>
          </div>

          <Input
            className="ToeicTests-page__Search"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên đề bạn muốn tìm kiếm"
            allowClear
            onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
          />

          <div className="ToeicTests-page__listTest">
            <div className="Test-list">
              {currentItems?.map((item, index) => (
                <div
                  key={item.id}
                  className="Test-item"
                  onClick={() => handleClick(item.id)}
                >
                  <div className="Test-item__index">
                    {startIndex + index + 1}
                  </div>
                  <div className="Test-item__title">{item.title}</div>
                  <InfoCircleOutlined className="Test-item__info" />
                </div>
              ))}
            </div>

            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={listExams.length}
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
