import "./CardPractice.scss";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { FaRandom } from "react-icons/fa";
import { useState } from "react";

export default function CardPractice() {
    const [flipped, setFlipped] = useState(false);

    // Click vào thẻ thì lật
    const handleFlip = () => {
        setFlipped(prev => !prev);
    };

    // Click vào icon loa hoặc label thì không lật, ngăn sự kiện lan ra ngoài
    const stopFlip = (e) => {
        e.stopPropagation();
    };

    // Xử lý khi click vào loa (ví dụ phát âm)
    const handlePronounceClick = (e) => {
        e.stopPropagation(); // Ngăn lật thẻ
        // TODO: logic phát âm
        alert("Phát âm từ mới");
    };

    return (
        <div className="CardPractice" onClick={handleFlip}>
            {/* Icon random không ngăn sự kiện nên click vào sẽ lật */}
            <FaRandom
                className="CardPractice__icon CardPractice__icon--random"
                title="Lật thẻ"
            />

            {/* Label, ngăn không cho lật */}
            <p className="CardPractice__label" onClick={stopFlip}>
                Từ mới
            </p>

            <div className="CardPractice__flip">
                <div className={`flip__inner ${flipped ? "flipped" : ""}`}>
                    {/* Mặt trước */}
                    <div className="flip__face flip__front">
                        <div className="flip__content">
                            <div className="CardPractice__word-container">
                                <h2 className="CardPractice__word">alignment (N)</h2>
                                <HiMiniSpeakerWave
                                    className="CardPractice__icon CardPractice__icon--pronounce"
                                    title="Nghe phát âm"
                                    onClick={handlePronounceClick}
                                />
                            </div>
                            <h2 className="CardPractice__phonetic">/əˈlaɪnmənt/</h2>
                        </div>
                    </div>

                    {/* Mặt sau */}
                    <div className="flip__face flip__back">
                        <div className="flip__content flip__back-content">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '65%', fontSize: '16px' }}>
                                <h3>Định nghĩa:</h3>
                                <p>Sự sắp xếp đúng vị trí hoặc sự đồng thuận về ý kiến.</p>

                                <h3>Ví dụ:</h3>
                                <p>The two countries are now in alignment on trade issues.</p>
                                <h3>Chú thích:</h3>
                                <p>The two countries are now in alignment on trade issues.</p>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src="https://study4.com/media/vocabs_media/img/10_abandon.jpg"
                                    alt="minh họa"
                                    className="CardPractice__img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
