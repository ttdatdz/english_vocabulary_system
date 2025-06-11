import { Button, message } from "antd";
import "./PracticeFlashCard.scss";
import { IoPlayForwardSharp } from "react-icons/io5";
import { FaRegFaceGrinBeam } from "react-icons/fa6";
import { FaRegFaceFrownOpen } from "react-icons/fa6";
import { FaRegFaceAngry } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import BaseModal from "../../components/BaseModal";
import { useState, useEffect } from "react";
import CardPractice from "../../components/CardPractice";
import { useNavigate, useParams } from "react-router-dom";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";
import { get, put } from "../../utils/request";

export default function PracticeFlashCard() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [flashcard, setFlashCard] = useState([]);
    const [practiceList, setPracticeList] = useState([]);
    const [rememberList, setRememberList] = useState([]);
    const { flashcardId } = useParams();
    const [currentCard, setCurrentCard] = useState(null);

    const loadDataList = async () => {
        const data = await get(`api/card/getByFlashCard/${flashcardId}`);
        if (data) {
            setPracticeList(data.filter(card => !card.isRemember));  // các từ chưa thuộc
            setRememberList(data.filter(card => card.isRemember));
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const dataFlashCard = await get(`api/flashcard/id/${flashcardId}`);
            if (dataFlashCard)
                setFlashCard(dataFlashCard)

            await loadDataList()
        }

        fetchData();
    }, [flashcardId])

    useEffect(() => {
        if (practiceList.length > 0) {
            const arr = makeWeightedArray(practiceList);
            setCurrentCard(arr[Math.floor(Math.random() * arr.length)]);
        } else {
            setCurrentCard(null);
        }
    }, [practiceList]);

    const nextCard = () => {
        const arr = makeWeightedArray(practiceList);
        if (arr.length === 0) return;
        let next = currentCard;
        while (arr.length > 1 && next === currentCard) {
            next = arr[Math.floor(Math.random() * arr.length)];
        }
        setCurrentCard(next);
    };

    const showModal = () => {

        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleBackToList = () => {
        navigate(`/VocabularyTopics/DetailTopic/DetailListFlashCard/${flashcardId}`);
    }
    const handleUpdateLevel = async (newLevel) => {
        if (!currentCard) return;
        try {
            await put({
                flashCardID: flashcardId,
                level: newLevel
            }, `api/card/update/detail/${currentCard.id}`);
            showSuccess("Cập nhật thành công!");
            // Update UI nếu muốn
            await loadDataList();
        } catch (e) {
            showErrorMessage("Lỗi khi cập nhật mức độ!");
        }
    }

    const handleIsRememberCheck = async (cardId) => {
        if (!currentCard) return;
        try {
            await put({ isRemember: 1, flashCardID: flashcardId }, `api/card/update/detail/${cardId}`);
            message.success("Thêm từ vào Danh sách đã thuộc");
            await loadDataList();
        } catch (err) {
            showErrorMessage(err);
        }
    }
    const handleIsRememberRestore = async (cardId) => {
        if (!currentCard) return;
        try {
            await put({ isRemember: 0, flashCardID: flashcardId }, `api/card/update/detail/${cardId}`);
            message.success("Cập nhật lại danh sách ôn tập.");
            await loadDataList();
        } catch (err) {
            showErrorMessage(err);
        }
    }

    const handleResetAllCards = async ()=>{
        await put({},`api/card/resetAll/${flashcardId}`);
        message.success("Reset Danh sách " + flashcard.title);
        await loadDataList();
    }

    function makeWeightedArray(cards) {
        let arr = [];
        cards.forEach(card => {
            let weight = 1;
            if (card.level === 2) weight = 2;
            if (card.level === 3) weight = 4;
            for (let i = 0; i < weight; i++) arr.push(card);
        });
        return arr;
    }
    return (
        <>
            <div className="MainContainer">
                <div className="PracticeFlashCard">
                    <div className="PracticeFlashCard__header">
                        <div className="PracticeFlashCard__start-header">
                            <h2 className="PracticeFlashCard__title">{(flashcard.title) ? flashcard.title : "Không có tiêu đề"}</h2>
                            <div className="PracticeFlashCard__actions">
                                <Button onClick={()=>handleBackToList()} className="PracticeFlashCard__btn PracticeFlashCard__btnViewAll" >Xem tất cả</Button>
                                <Button className="PracticeFlashCard__btn PracticeFlashCard__btnViewMemory" onClick={showModal}>Các từ đã nhớ</Button>
                                <Button onClick={()=>handleResetAllCards()} className="PracticeFlashCard__btn PracticeFlashCard__btn--Stop">Dừng học list này</Button>
                            </div>

                        </div>

                    </div>
                    <div className="PracticeFlashCard__Content">
                        <p className="PracticeFlashCard__note">Lưu ý: Bạn nên học tối đa 15 từ mới một ngày. Đây là lượng từ phù hợp giúp bạn có thể ghi nhớ tốt</p>
                        <div className="PracticeFlashCard__listFlashCard">
                            {currentCard ? <CardPractice data={currentCard} /> : <p>Không có từ nào!</p>}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Button type="primary" onClick={nextCard}>Từ tiếp theo</Button>
                        </div>
                    </div>
                    <div className="PracticeFlashCard__Footer">

                        <div onClick={() => handleUpdateLevel(1)} className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Easy">
                            <FaRegFaceGrinBeam style={{ marginTop: '2px' }} />
                            <span>Dễ</span>
                        </div>
                        <div onClick={() => handleUpdateLevel(2)} className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Medium">
                            <FaRegFaceFrownOpen style={{ marginTop: '2px' }} />
                            <span>Trung bình</span>
                        </div>
                        <div onClick={() => handleUpdateLevel(3)} className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Difficult">
                            <FaRegFaceAngry style={{ marginTop: '2px' }} />
                            <span>Khó</span>
                        </div>
                        <div onClick={() => { handleIsRememberCheck(currentCard.id) }} className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Discard">
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
                {rememberList.length === 0 ? (
                    <p>Chưa có từ nào thuộc!</p>
                ) : (
                    rememberList.map(card => (
                        <div className="Card-remember" key={card.id}>
                            <p className="Card-remember__word">{card.terminology}</p>
                            <RiDeleteBin6Line
                                className="Card-remember__delete"
                                title="Thêm lại vào ôn tập"
                                onClick={() => handleIsRememberRestore(card.id)}
                            />
                        </div>
                    ))
                )}
            </BaseModal>
        </>
    )
}