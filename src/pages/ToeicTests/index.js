import { Input, Pagination } from "antd";

import "./ToeicTest.scss";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import SelectField from "../../components/SelectField";
import { useNavigate } from "react-router-dom";

export default function ToiecTests() {
  const navigate = useNavigate();
  const examOptions = [
    { value: "Toeic", label: "Toeic" },
    { value: "Ielts", label: "Ielts" },
  ];

  const testSetOptions = [
    { value: "ETS", label: "ETS" },
    { value: "New Economy", label: "New Economy" },
  ];

  const yearOptions = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
  ];
  const handleChange = (value) => {
    console.log("Selected:", value);
  };
  const handleClick = () => {
    navigate("/DetailExam");
  };
  const TestList = [
    { id: 1, title: "TOEIC ETS 2024 - Test 1" },
    { id: 2, title: "TOEIC ETS 2024 - Test 2" },
    { id: 3, title: "TOEIC ETS 2024 - Test 3" },
    { id: 4, title: "TOEIC ETS 2024 - Test 4" },
    { id: 5, title: "TOEIC ETS 2024 - Test 5" },
  ];

  return (
    <>
      <div className="ToeicTests-page">
        <div className="ToeicTests-page__header">
          <div className="MainContainer">
            <h2 className="ToeicTests-page__header-title">Đề thi</h2>
          </div>
        </div>

        <div className="MainContainer">
          <div className="ToeicTests-page__ContainerSelect">
            <SelectField
              label="Kì thi"
              defaultValue="Toeic"
              onChange={handleChange}
              options={examOptions}
              width={"220px"}
            />

            <SelectField
              label="Bộ đề"
              defaultValue="ETS"
              onChange={handleChange}
              options={testSetOptions}
              width={"220px"}
            />

            <SelectField
              label="Năm"
              defaultValue="2024"
              onChange={handleChange}
              options={yearOptions}
              width={"220px"}
            />
          </div>

          <Input
            className="ToeicTests-page__Search"
            suffix={<SearchOutlined />}
            placeholder="Nhập tên đề bạn muốn tìm kiếm"
            allowClear
          />

          <div className="ToeicTests-page__listTest">
            <div className="Test-list">
              {TestList.map((item, index) => (
                <div key={item.id} className="Test-item" onClick={handleClick}>
                  <div className="Test-item__index">{index + 1}</div>
                  <div className="Test-item__title">{item.title}</div>
                  <InfoCircleOutlined className="Test-item__info" />
                </div>
              ))}
            </div>
            <Pagination align="center" defaultCurrent={1} total={50} />
          </div>
        </div>
      </div>
    </>
  );
}
