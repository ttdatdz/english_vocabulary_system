import CardItemExam from "../../components/CardItemExam";
import CardItemFlashCard from "../../components/CardItemFlashCard";
import SwiperBanner from "../../components/SwiperBanner";
import SwiperComment from "../../components/SwiperComment";
import "./Home.scss";

export default function Home() {
    return (
        <>
            <SwiperBanner />
            <div className="MainContainer">
                <div className='Container-listExams'>
                    <h2 className='Container-listExams__Title'>Bộ đề thi mới nhất</h2>
                    <div className='Container-listExams__listExams'>
                        <CardItemExam />
                        <CardItemExam />
                        <CardItemExam />
                        <CardItemExam />
                        <CardItemExam />
                    </div>
                </div>

                <div className='Container-listFlashcards'>
                    <h2 className='Container-listFlashcards__Title'>Bộ từ vựng phổ biến</h2>
                    <div className='Container-listFlashcards__listFlashcards'>
                        <CardItemFlashCard />
                        <CardItemFlashCard />
                        <CardItemFlashCard />
                        <CardItemFlashCard />
                        <CardItemFlashCard />
                    </div>
                </div>
                <div className='Container-listComments'>
                    <h2 className='Container-listComments__Title'>Người dùng nói gì về VocaLearn</h2>
                    <SwiperComment />
                </div>

            </div>
        </>
    )
}