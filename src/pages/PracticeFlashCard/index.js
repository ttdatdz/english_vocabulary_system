import { Button } from "antd";
import "./PracticeFlashCard.scss";
import { IoPlayForwardSharp } from "react-icons/io5";
import { FaRegFaceGrinBeam } from "react-icons/fa6";
import { FaRegFaceFrownOpen } from "react-icons/fa6";
import { FaRegFaceAngry } from "react-icons/fa6";
import CardPracticeBefore from "../../components/CardPractice";
export default function PracticeFlashCard() {
    return (
        <>
            <div className="MainContainer">
                <div className="PracticeFlashCard">
                    <div className="PracticeFlashCard__header">
                        <div className="PracticeFlashCard__start-header">
                            <h2 className="PracticeFlashCard__title">Test 1 - ETS 2024</h2>
                            <div className="PracticeFlashCard__actions">
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btnViewAll" >Xem tất cả</Button>
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btnViewMemory">Các từ đã nhớ</Button>
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btn--Stop">Dừng học list này</Button>
                            </div>

                        </div>

                    </div>
                    <div className="PracticeFlashCard__Content">
                        <p className="PracticeFlashCard__note">Lưu ý: Bạn nên học tối đa 15 từ mới một ngày. Đây là lượng từ phù hợp giúp bạn có thể ghi nhớ tốt</p>
                        <div className="PracticeFlashCard__listFlashCard">
                            <CardPracticeBefore />
                        </div>
                    </div>
                    <div className="PracticeFlashCard__Footer">

                        <div className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Easy">
                            <FaRegFaceGrinBeam style={{ marginTop: '2px' }} />
                            <span>Dễ</span>
                        </div>
                        <div className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Medium">
                            <FaRegFaceFrownOpen style={{ marginTop: '2px' }} />
                            <span>Trung bình</span>
                        </div>
                        <div className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Difficult">
                            <FaRegFaceAngry style={{ marginTop: '2px' }} />
                            <span>Khó</span>
                        </div>
                        <div className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Discard">
                            <IoPlayForwardSharp style={{ marginTop: '2px' }} /> <span>Đã nhớ, loại bỏ khỏi danh sách ôn tập</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}