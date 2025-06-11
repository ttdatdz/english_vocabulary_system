import "./CardItemFeeback.scss";
import { Rate } from "antd";
import defaultAvatar from '../../../src/assets/images/user.png';

export default function CardItemFeedback({ data }) {
    if (!data) return null
    return (
        <div className="feedback-card">
            <div className="feedback-card__header">
                <img
                    className="feedback-card__avatar"
                    src={(data.avatar)? data.avatar : defaultAvatar}
                    alt="Avatar"
                />
            </div>
            <div className="feedback-card__Content">
                <h3 className="feedback-card__name">{data.fullName} | {(data.createAt) ? new Date(data.createAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) : "Thời gian không xác định"}</h3>
                <div className="feedback-card__rating">
                    <Rate disabled defaultValue={5} value={data.star}/>
                </div>

                <p className="feedback-card__comment">{data.content}</p>
                <div className="feedback-card__ListImgFeedback">
                    {data.image && (
                    <img
                        className="feedback-card__ImgFeedback"
                        src={data.image}
                        alt="Avatar"
                    />
                    )}
                </div>
            </div>
        </div>
    );
}
