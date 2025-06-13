import { Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; import { get, getNoAuth, post } from "../../utils/request";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";
import ReviewListCard from "../../components/ReviewListCard";

export default function ReviewFlashCard() {
    const { topicId } = useParams();
    const [myVocabList, setMyVocabList] = useState([]);
    const [topic, setTopic] = useState(null);

    const fetchListFlashCard = async () => {
        const data = await getNoAuth(`api/flashcard/getFlashCardsByTopic/${topicId}`);
        if (data && Array.isArray(data)) {
            setMyVocabList(data);
        }
    }

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const data = await getNoAuth(`api/flashcard/topic/${topicId}`);
                if (data) {
                    setTopic(data);
                }
                else {
                    showErrorMessage("Có lỗi xảy ra khi lấy dữ liệu!");
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchListFlashCard();
        fetchTopic();
    }, [])

    const handleOnSaveTopic = async () => {
        if(localStorage.getItem("accessToken")==null){
            showErrorMessage("Bạn chưa Đăng nhập");
            return;
        }
        try {
            await post({}, `api/flashcard/savePublishTopic/${topicId}`, true);
            showSuccess("Đã lưu chủ đề.");
        } catch (err) {
            showErrorMessage(err);
        }
    }
    return (
        <div className="DetailTopic-page">
            <div className="DetailTopic-page__header">
                <div className="MainContainer">
                    <h2 className="DetailTopic-page__header-title">📖 {topic?.title}</h2>
                    <Button onClick={() => { handleOnSaveTopic() }} type="primary" className="create-listFlashCard-button" style={{ marginLeft: "auto" }}>Lưu chủ đề</Button>
                </div>
            </div>
            <div className="MainContainer">
                <h2 style={{ textAlign: "left", marginTop: 20 }}>{topic?.title || "Không tìm thấy chủ đề"}</h2>
                <ReviewListCard
                    topicId={topicId}
                    list={myVocabList}
                />
            </div>
        </div>
    )
}