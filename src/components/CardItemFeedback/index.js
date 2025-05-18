import "./CardItemFeeback.scss";
import { Rate } from "antd";
import { MdDelete } from "react-icons/md";

export default function CardItemFeedback() {
    return (
        <div className="feedback-card">
            <div className="feedback-card__header">
                <img
                    className="feedback-card__avatar"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                    alt="Avatar"
                />
            </div>
            <div className="feedback-card__Content">
                <h3 className="feedback-card__name">Nguyễn Văn A | 10-9-2025</h3>
                <div className="feedback-card__rating">
                    <Rate disabled defaultValue={5} />
                </div>

                <p className="feedback-card__comment">Web hay đó recommend mọi người</p>
                <div className="feedback-card__ListImgFeedback">
                    <img
                        className="feedback-card__ImgFeedback"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                        alt="Avatar"
                    />
                    <img
                        className="feedback-card__ImgFeedback"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                        alt="Avatar"
                    />
                    <img
                        className="feedback-card__ImgFeedback"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6p1uHt5NGPGppq1t48xlKt18PfNiIX5zCYQ&s"
                        alt="Avatar"
                    />
                </div>
            </div>
            <MdDelete className="feedback-card__delete" />
        </div>
    );
}
