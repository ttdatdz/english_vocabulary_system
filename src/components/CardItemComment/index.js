import { Rate } from "antd";
import "./CardItemComment.scss";


export default function CardItemComment({ item }) {
    if(!item) return null;
    return (
        <div className="card-item-comment">
            <img className="card-item-comment__avatar" src={item.avatar} alt="Avatar" />

            <h3 className="card-item-comment__name">{item.fullName}</h3>
            <p className="card-item-comment__time">{item.createAt ? new Date(item.createAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }) : "Thời gian không xác định"}</p>

            <div className="card-item-comment__rating">
                <Rate disabled defaultValue={5} value={item.star} />
            </div>
            <p className="card-item-comment__text">{item.content}</p>
        </div>
    )
}