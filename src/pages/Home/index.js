import CardItemExam from "../../components/CardItemExam";
import CardItemFlashCard from "../../components/CardItemFlashCard";
import SwiperBanner from "../../components/SwiperBanner";
import SwiperComment from "../../components/SwiperComment";
import { useEffect, useState } from "react";
import { get, getWithParams } from "../../utils/request";
import TopicItemFlashCard from "../../components/CardItemFlashCard";

import "./Home.scss";

export default function Home() {

    const [examList, setExamList] = useState([]);
    const [topicFlashCardList, setTopicFlashCardList] = useState([]);
    const [topEvaluate, setTopEvaluate] = useState([]);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const data = await get("api/exam/getByCreateAt");
                if (data && Array.isArray(data)) {
                    setExamList(data.slice(0, 5)); // ✅ lấy 5 phần tử đầu
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách đề thi:", error);
            }
        };

        const fetchTopics = async () => {
            try {
                const data = await get("api/flashcard/getTopicPopular");
                if (data && Array.isArray(data)) {
                    if (localStorage.getItem("accountName")) {
                        const filterNotMyTopic = data.filter((item) => item.userName != localStorage.getItem("accountName"));
                        setTopicFlashCardList(filterNotMyTopic.slice(0, 5));
                    } else
                        setTopicFlashCardList(data.slice(0, 5));
                }
            } catch (error) {
                console.error("Lỗi khi tải chủ đề từ vựng:", error);
            }
        };

        const fetchEvaluate = async () => {
            const params = { star: 5 };
            const data = await getWithParams("api/evaluate/get", params);
            if (data) {
                setTopEvaluate(data);
            }
        }
        fetchEvaluate();
        fetchTopics();
        fetchExams();
    }, []);
    return (
        <>
            <SwiperBanner />
            <div className="MainContainer">
                <div className='Container-listExams'>
                    <h2 className='Container-listExams__Title'>Bộ đề thi mới nhất</h2>
                    <div className='Container-listExams__listExams'>
                        {examList.map((exam) => (
                            <CardItemExam key={exam.id} exam={exam} />
                        ))}
                    </div>
                </div>

                <div className='Container-listFlashcards'>
                    <h2 className='Container-listFlashcards__Title'>Bộ từ vựng phổ biến</h2>
                    <div className='Container-listFlashcards__listFlashcards'>
                        {topicFlashCardList.map(topic => (
                            <TopicItemFlashCard key={topic.id} topic={topic} />
                        ))}
                    </div>
                </div>
                <div className='Container-listComments'>
                    <h2 className='Container-listComments__Title'>Người dùng nói gì về VocaLearn</h2>
                    <SwiperComment evaluates={topEvaluate} />
                </div>

            </div>
        </>
    )
}