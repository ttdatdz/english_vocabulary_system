import { Button } from "antd";
import "./CardItemExam.scss";
import { FieldTimeOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons";
import BtnDetail from "../BtnDetail";
import { useNavigate } from "react-router-dom";
export default function CardItemExam({exam}) {

    const nav = useNavigate();
    function handleDetailExamClick(){
        nav(`/DetailExam/${exam.id}`);
    }
    return (
        <div className="card-item-exam">
            <h3 className="card-item-exam__title">{exam.collection} <br></br> {exam.title}</h3>
            <div className="card-item-exam__info">
                <p className="card-item-exam__info-item">
                    <FieldTimeOutlined className="card-item-exam__icon" />
                    <span>{exam.duration||""} phút</span>
                </p>
                <p className="card-item-exam__info-item">
                    <UserOutlined className="card-item-exam__icon" />
                    <span>{exam.attemps} Lượt thi</span>
                </p>
                <p className="card-item-exam__info-item">
                    <CommentOutlined className="card-item-exam__icon" />
                    <span>{exam.numberOfComment} Bình luận</span>
                </p>

            </div>

            <p className="card-item-exam__summary">{exam.parts} phần thi | {exam.size} câu hỏi</p>
            <Button onClick={handleDetailExamClick} className='btnDetail'>Chi tiết</Button>
        </div>
    );
}
