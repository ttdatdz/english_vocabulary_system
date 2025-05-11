import { Col, Row } from "antd";
import CardItem from "../../components/CardItem";
import BasicLine from "../../components/BasicLine";
import PieChart from "../../components/PieChart";
import "./DashBoard.scss";


export default function DashBoard() {
    return (
        <div className='DashBoard'>

            <Row gutter={[20, 20]} className="DashBoard__CardList">
                <Col span={6}><CardItem /></Col>
                <Col span={6}><CardItem /></Col>
                <Col span={6}><CardItem /></Col>
                <Col span={6}><CardItem /></Col>
            </Row>
            <Row gutter={[20, 20]} className="DashBoard__CardList">
                <Col span={12}>
                    <BasicLine />
                </Col>
                <Col span={12}>
                    <PieChart />
                </Col>
            </Row>
        </div>
    )
}