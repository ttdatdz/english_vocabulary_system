import { Button } from "antd";
import "./PracticeFlashCard.scss";
import { IoPlayForwardSharp } from "react-icons/io5";
import { FaRegFaceGrinBeam } from "react-icons/fa6";
import { FaRegFaceFrownOpen } from "react-icons/fa6";
import { FaRegFaceAngry } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
// import CardPracticeBefore from "../../components/CardPractice";
import BaseModal from "../../components/BaseModal";
import { useState } from "react";
import CardPractice from "../../components/CardPractice";
export default function PracticeFlashCard() {
    const [open, setOpen] = useState(false);

    const showModal = () => {

        setOpen(true);
    };

    // const handleOk = () => {
    //     setOpen(false);
    // };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <div className="MainContainer">
                <div className="PracticeFlashCard">
                    <div className="PracticeFlashCard__header">
                        <div className="PracticeFlashCard__start-header">
                            <h2 className="PracticeFlashCard__title">Test 1 - ETS 2024</h2>
                            <div className="PracticeFlashCard__actions">
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btnViewAll" >Xem tất cả</Button>
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btnViewMemory" onClick={showModal}>Các từ đã nhớ</Button>
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btn--Stop">Dừng học list này</Button>
                            </div>

                        </div>

                    </div>
                    <div className="PracticeFlashCard__Content">
                        <p className="PracticeFlashCard__note">Lưu ý: Bạn nên học tối đa 15 từ mới một ngày. Đây là lượng từ phù hợp giúp bạn có thể ghi nhớ tốt</p>
                        <div className="PracticeFlashCard__listFlashCard">
                            <CardPractice />
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

            <BaseModal
                open={open}
                onCancel={handleClose}
                title={
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        Danh sách từ đã ghi nhớ
                    </div>
                }
            >
                <p className="note">Click icon "Delete" để thêm từ vào lại danh sách ôn tập</p>
                <div className="Card-remember">
                    <p className="Card-remember__word">Destination</p>
                    <RiDeleteBin6Line className="Card-remember__delete" />
                </div>
            </BaseModal>
        </>
    )
}