import { Button } from "antd";
import "./CardItemExam.scss";
import { FieldTimeOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons";
import BtnDetail from "../BtnDetail";

export default function CardItemExam() {
    return (
        <div className="card-item-exam">
            <h3 className="card-item-exam__title">Practice Set TOEIC 2022 <br></br> TEST 1</h3>

            <div className="card-item-exam__info">
                <p className="card-item-exam__info-item">
                    <FieldTimeOutlined className="card-item-exam__icon" />
                    <span>120 phút</span>
                </p>
                <p className="card-item-exam__info-item">
                    <UserOutlined className="card-item-exam__icon" />
                    <span>120001 Lượt thi</span>
                </p>
                <p className="card-item-exam__info-item">
                    <CommentOutlined className="card-item-exam__icon" />
                    <span>12001 Bình luận</span>
                </p>

            </div>

            <p className="card-item-exam__summary">7 phần thi | 200 câu hỏi</p>
            <BtnDetail>Chi tiết</BtnDetail>
        </div>
    );
}
