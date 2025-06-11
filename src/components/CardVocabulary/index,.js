import "./CardVocabulary.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Image } from "antd";
import { del } from "../../utils/request";
import { confirmDelete, showSuccess } from "../../utils/alertHelper";
import { useEffect } from "react";
export default function CardVocabulary(props) {
    const { onFetchingData, data, showModal } = props;
    // const handleOpenModal = () => {
    //     showModal();
    // }

    const levelMap = {
        1: "Dễ",
        2: "Trung bình",
        3: "Khó"
    };
    
    const handleDelete = async () => {
        const confirmed = await confirmDelete("Bạn có chắc chắn muốn xóa từ này?");
        if (confirmed) {
            const result = await del(`api/card/delete/card/${data.id}`);
            showSuccess("Đã xóa.");
            if (onFetchingData) onFetchingData();
        }
    }
    const handlePlayAudio = () => {
        if (data.audio) {
            const audio = new Audio(data.audio);
            audio.play();
        }
    }

    if (!data) return null;
    return (
        <>
            <div className="vocab-card">
                <div className="vocab-card__container">
                    <div className="vocab-card__left">
                        <div className="vocab-card__header">
                            <span className="vocab-card__word">{data.terminology} <span className="vocab-card__pos">({data.partOfSpeech})</span></span>
                            <span className="vocab-card__phonetic">{data.pronounce}</span>
                            <div className="vocab-card__actions">
                                <HiMiniSpeakerWave className="vocab-card__icon vocab-card__icon--pronounce" title="Nghe phát âm" onClick={handlePlayAudio} />
                                <BiEdit onClick={() => showModal(data)} className="vocab-card__icon vocab-card__icon--edit" />
                                <RiDeleteBin6Line onClick={() => handleDelete()} className="vocab-card__icon vocab-card__icon--delete" />

                            </div>
                        </div>

                        <div className="vocab-card__body">
                            <div className="vocab-card__definition">
                                <strong>Định nghĩa:</strong>
                                <p>{data.definition}</p>
                            </div>
                            <div className="vocab-card__example">
                                <strong>Ví dụ:</strong>
                                {data.example ? (
                                    <ul className="vocab-card__listExample">

                                        <li className="vocab-card__example-item">
                                            {data.example}
                                        </li>
                                    </ul>
                                ) : (<p>Không có ví dụ</p>)}

                            </div>

                            <div className="vocab-card__note">
                                <strong>Mức độ:</strong>
                                <p>{levelMap[data.level] || "Không xác định"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="vocab-card__right">
                        <Image className="vocab-card__img"
                            width={200}
                            src={data?.image}
                        />
                    </div>
                </div>
            </div>

        </>
    )
}