import { useNavigate } from "react-router-dom";
import { put } from "../../utils/request";
import BtnDetail from "../BtnDetail/index";
import "./CardItemFlashCard.scss";
import { UserOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function TopicItemFlashCard({ topic }) {
    const navigate = useNavigate();
    const updateVisitCount = async () => {
        try {
            await put(null, `api/flashcard/raiseVisitCount/${topic.id}`, false);
        } catch (err) {
            console.log(err);
        }
    }
    const handleOnclick = () => {
        updateVisitCount();
        navigate(`ReviewFlashCard/${topic.id}`);
    }
    return (
        <div className="card-item-flashcard">
            <h3 className="card-item-flashcard__title">{topic.title}</h3>
            <div className="card-item-flashcard__info">
                <p className="card-item-flashcard__info-item">
                    <UserOutlined className="card-item-flashcard__icon" />
                    <span>{topic.visitCount} Lượt truy cập</span>
                </p>
            </div>
            <Button onClick={() => handleOnclick()} className='btnDetail'>Chi tiết</Button>
        </div>
    );
}