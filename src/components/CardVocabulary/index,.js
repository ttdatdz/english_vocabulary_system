import "./CardVocabulary.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Image } from "antd";
export default function CardVocabulary() {
    return (
        <>
            <div className="vocab-card">
                <div className="vocab-card__container">
                    <div className="vocab-card__left">
                        <div className="vocab-card__header">
                            <span className="vocab-card__word">alignment <span className="vocab-card__pos">(N)</span></span>
                            <span className="vocab-card__phonetic">/əˈlaɪnmənt/</span>
                            <div className="vocab-card__actions">
                                <HiMiniSpeakerWave className="vocab-card__icon vocab-card__icon--pronounce" title="Nghe phát âm" />
                                <BiEdit className="vocab-card__icon vocab-card__icon--edit" />
                                <RiDeleteBin6Line className="vocab-card__icon vocab-card__icon--delete" />

                            </div>
                        </div>

                        <div className="vocab-card__body">
                            <div className="vocab-card__definition">
                                <strong>Định nghĩa:</strong>
                                <p>sự sắp xếp (sx everything trên 1 line)</p>
                            </div>

                            <div className="vocab-card__example">
                                <strong>Ví dụ:</strong>
                                <ul className="vocab-card__listExample">
                                    <li className="vocab-card__example-item">
                                        Wheel alignments and brake system inspections are part of our vehicle service plan:
                                        sự sắp xếp bánh xe và hệ thống phanh là một phần trong kế hoạch bảo dưỡng xe của chúng tôi.
                                    </li>
                                </ul>
                            </div>
                            <div className="vocab-card__note">
                                <strong>Ghi chú:</strong>
                                <p>sự sắp xếp (sx everything trên 1 line)</p>
                            </div>
                        </div>
                    </div>
                    <div className="vocab-card__right">
                        <Image className="vocab-card__img"
                            width={200}
                            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                        />
                    </div>
                </div>
            </div>

        </>
    )
}