import BtnDetail from "../BtnDetail/index";
import "./CardItemFlashCard.scss";
import { UserOutlined } from "@ant-design/icons";

export default function CardItemFlashCard() {
    return (
        <div className="card-item-flashcard">
            <h3 className="card-item-flashcard__title">Toeic 600 words</h3>
            <div className="card-item-flashcard__info">
                <p className="card-item-flashcard__info-item">
                    <UserOutlined className="card-item-flashcard__icon" />
                    <span>120001 Lượt truy cập</span>
                </p>
            </div>
            <BtnDetail >Chi tiết</BtnDetail>
        </div>
    );
}