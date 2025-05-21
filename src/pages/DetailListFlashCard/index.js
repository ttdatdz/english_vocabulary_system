import { Button } from "antd";
import "./DetailListFlashCard.scss";
import CardVocabulary from "../../components/CardVocabulary/index,";
export default function DetailListFalshCard() {
    return (
        <>
            <div className="MainContainer">
                <div className="DetailListFlashCard">
                    <div className="DetailListFlashCard__header">
                        <div className="DetailListFlashCard__start-header">
                            <h2 className="DetailListFlashCard__title">Test 1 - ETS 2024</h2>
                            <Button className="DetailListFlashCard__btnAdd">+ Thêm từ mới</Button>
                            <Button className="DetailListFlashCard__btnAdd">Thêm hàng loạt</Button>
                        </div>
                        <p className="DetailListFlashCard__description">Ôn lại 17/3/2025</p>
                    </div>
                    <div className="DetailListFlashCard__Content">
                        <div>
                            <Button className="DetailListFlashCard__btnPractice">Luyện tập flashcards</Button>
                        </div>
                        <div className="DetailListFlashCard__listFlashCard">
                            <CardVocabulary />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}