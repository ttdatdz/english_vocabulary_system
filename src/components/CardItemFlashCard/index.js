import BtnDetail from "../BtnDetail/index";
import "./CardItemFlashCard.scss";
import { UserOutlined } from "@ant-design/icons";

export default function TopicItemFlashCard({ topic }) {
    return (
        <div className="card-item-flashcard">
            <h3 className="card-item-flashcard__title">{topic.title}</h3>
            <div className="card-item-flashcard__info">
                <p className="card-item-flashcard__info-item">
                    <UserOutlined className="card-item-flashcard__icon" />
                    <span>{topic.visitCount} Lượt truy cập</span>
                </p>
            </div>
            <BtnDetail >Chi tiết</BtnDetail>
        </div>
    );
}