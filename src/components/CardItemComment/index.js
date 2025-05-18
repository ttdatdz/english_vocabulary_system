import { Rate } from "antd";
import "./CardItemComment.scss";


export default function CardItemComment() {
    return (
        <div className="card-item-comment">
            <img className="card-item-comment__avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s" alt="Avatar" />

            <h3 className="card-item-comment__name">Nguyễn Văn A</h3>
            <p className="card-item-comment__time">10-9-2025</p>

            <div className="card-item-comment__rating">
                <Rate disabled defaultValue={5} />
            </div>
            <p className="card-item-comment__text">Web hay đó recommend mọi người</p>
        </div>
    )
}