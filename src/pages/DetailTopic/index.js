import "./DetailTopic.scss";
import { Tabs } from 'antd';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ListFlashCardOfTab from "../../components/ListFlashCardOfTab";
import { get } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";

const { TabPane } = Tabs;

export default function DetailTopic() {

    const { topicId } = useParams();
    const [topic, setTopic] = useState(null);

    const [myVocabList, setMyVocabList] = useState([]);
    const [studyingList, setStudyingList] = useState([]);
    const [newList, setNewList] = useState([]);
    const [reviewList, setReviewList] = useState([]);
    const [masterList, setMasterList] = useState([]);

    const fetchListFlashCard = async () => {
        const data = await get(`/api/flashcard/getFlashCardsByTopic/${topicId}`);
        if (data && Array.isArray(data)) {
            setMyVocabList(data);
            setStudyingList(
                data.filter((item) => item.learningStatus === "IN_PROGRESS")
            );
            setNewList(data.filter((item) => item.learningStatus === "NEW"));
            setReviewList(
                data.filter((item) => item.learningStatus === "REVIEW_NEEDED")
            );
            setMasterList(data.filter((item) => item.learningStatus === "MASTERED"));
        }
    }

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const data = await get(`api/flashcard/topic/${topicId}`);
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

    const [activeTab, setActiveTab] = useState('1');

    const renderFlashcardList = () => {
        switch (activeTab) {
            case "1":
                return (
                    <ListFlashCardOfTab
                        topicId={topicId}
                        list={myVocabList}
                        activeTab={1}
                        onFlashCardCreated={() => {
                            fetchListFlashCard();
                        }}
                    />
                );
            case '2':
                return <ListFlashCardOfTab topicId={topicId} list={studyingList} activeTab={2} />;
            case '3':
                return <ListFlashCardOfTab topicId={topicId} list={newList} activeTab={3} />;
            case "4":
                return <ListFlashCardOfTab topicId={topicId} list={reviewList} activeTab={4} />;
            case "5":
                return <ListFlashCardOfTab topicId={topicId} list={masterList} activeTab={5} />;
            default:
                return null;
        }
    };

    return (
        <div className="DetailTopic-page">
            <div className="DetailTopic-page__header">
                <div className="MainContainer">
                    <h2 className="DetailTopic-page__header-title">📖 FlashCards</h2>
                    <Tabs defaultActiveKey="1" onChange={setActiveTab}>
                        <TabPane tab="Danh sách từ vựng" key="1" />
                        <TabPane tab="Đang học" key="2" />
                        <TabPane tab="Mới" key="3" />
                        <TabPane tab="Cần xem lại" key="4" />
                        <TabPane tab="Đã thành thạo" key="5" />
                    </Tabs>
                </div>
            </div>

            <div className="MainContainer">
                <h2 style={{ textAlign: "left", marginTop: 20 }}>{topic?.title || "Không tìm thấy chủ đề"}</h2>
                <div className="DetailTopic-page__listFlashcards">{renderFlashcardList()}</div>
            </div>
        </div>
    );
}
