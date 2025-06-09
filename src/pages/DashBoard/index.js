import { Col, Row } from "antd";
import CardItem from "../../components/CardItem";
import BasicLine from "../../components/BasicLine";
import PieChart from "../../components/PieChart";
import "./DashBoard.scss";
import { useEffect, useState } from "react";
import { GetAllRecords } from "../../services/DashBoard/dashBoardService";
import { showErrorMessage } from "../../utils/alertHelper";

export default function DashBoard() {
  const [allRecords, setAllRecords] = useState([]);
  const pieData = allRecords[allRecords.length - 1];

  const cardConfig = {
    feedbacks: {
      image: require("../../assets/images/CardItem1.png"),
      color: "#FFB74D",
    },
    visits: {
      image: require("../../assets/images/CardItem2.png"),
      color: "#4FC3F7",
    },
    topics: {
      image: require("../../assets/images/CardItem3.png"),
      color: "#81C784",
    },
    tests: {
      image: require("../../assets/images/CardItem4.png"),
      color: "#BA68C8",
    },
  };
  // lấy danh sách đề thi
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllRecords();
        const resultArray = Object.entries(res).map(([key, value]) => ({
          key,
          value,
        }));
        setAllRecords(resultArray);
      } catch (error) {
        showErrorMessage("Lỗi khi lấy danh sách bản ghi:", error);
      }
    };
    fetchUsers();
  }, []);
  //   console.log("allRecords", allRecords);
  return (
    <div className="DashBoard">
      <Row gutter={[20, 20]} className="DashBoard__CardList">
        {allRecords?.slice(0, -1).map((record) => {
          const config = cardConfig[record.key] || {};
          return (
            <Col span={6} key={record.key}>
              <CardItem
                title={record.key}
                quantity={record.value}
                image={config.image}
                color={config.color}
              />
            </Col>
          );
        })}
      </Row>
      <Row gutter={[20, 20]} className="DashBoard__CardList">
        <Col span={12}>
          <BasicLine />
        </Col>
        <Col span={12}>
          <PieChart data={pieData} />
        </Col>
      </Row>
    </div>
  );
}
