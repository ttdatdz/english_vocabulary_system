import { Button, message, Modal } from "antd";
import "./PracticeFlashCard.scss";
import { IoPlayForwardSharp } from "react-icons/io5";
import {
  FaRegFaceGrinBeam,
  FaRegFaceFrownOpen,
  FaRegFaceAngry,
} from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import BaseModal from "../../components/BaseModal";
import { useState, useEffect } from "react";
import CardPractice from "../../components/CardPractice";
import { useNavigate, useParams } from "react-router-dom";
import { showErrorMessage, showSuccess } from "../../utils/alertHelper";
import { get, put } from "../../utils/request";
import dayjs from "dayjs";
import { PiConfettiFill } from "react-icons/pi";

export default function PracticeFlashCard() {
  const [open, setOpen] = useState(false);
  const [finishModal, setFinishModal] = useState(false);
  const navigate = useNavigate();
  const [flashcard, setFlashCard] = useState([]);
  const [practiceList, setPracticeList] = useState([]);
  const [rememberedInSession, setRememberedInSession] = useState([]); // từ đã nhớ trong phiên
  const { flashcardId, topicId } = useParams();
  const [currentCard, setCurrentCard] = useState(null);

  // Load danh sách card (luôn load ALL cards)
  const loadDataList = async () => {
    try {
      const data = await get(`api/card/getByFlashCard/${flashcardId}`);
      const allCards = Array.isArray(data.listCardResponse)
        ? data.listCardResponse
        : [];
      setPracticeList(allCards);
      // don't touch rememberedInSession here (it's per-session)
    } catch (err) {
      showErrorMessage("Không tải được danh sách thẻ");
    }
  };

  // Fetch flashcard info + card list
  useEffect(() => {
    const fetchData = async () => {
      const dataFlashCard = await get(`api/flashcard/id/${flashcardId}`);
      if (dataFlashCard) setFlashCard(dataFlashCard);
      await loadDataList();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcardId]);

  // Khi practiceList thay đổi, chọn currentCard an toàn
  useEffect(() => {
    if (!practiceList || practiceList.length === 0) {
      setCurrentCard(null);
      return;
    }

    // nếu currentCard đã tồn tại trong practiceList thì giữ nguyên (tránh nhảy đột ngột)
    if (currentCard && practiceList.some((c) => c.id === currentCard.id)) {
      return;
    }

    // chọn random mới
    const arr = makeWeightedArray(practiceList);
    const random = arr[Math.floor(Math.random() * arr.length)];
    setCurrentCard(random);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceList]);

  // Next card: nếu chỉ 1 item thì không next
  const nextCard = () => {
    if (!practiceList || practiceList.length === 0) {
      setCurrentCard(null);
      return;
    }

    const arr = makeWeightedArray(practiceList);
    if (arr.length <= 1) {
      // còn 1 từ -> không cho next
      message.info("Đây là từ cuối cùng trong danh sách.");
      return;
    }

    // cố gắng chọn khác currentCard
    let next = currentCard;
    let tries = 0;
    while ((next == null || next.id === currentCard?.id) && tries < 10) {
      next = arr[Math.floor(Math.random() * arr.length)];
      tries++;
    }
    // nếu vẫn bằng (hiếm) thì vẫn set để đảm bảo UI update
    setCurrentCard(next);
  };

  const showModal = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBackToList = () => {
    navigate(
      `/VocabularyTopics/DetailTopic/${topicId}/DetailListFlashCard/${flashcardId}`
    );
  };

  // Cập nhật level (gọi API)
  // ✅ Cập nhật level (chỉ cập nhật currentCard, không nhảy sang từ khác)
  const handleUpdateLevel = async (newLevel) => {
    if (!currentCard) return;

    try {
      await put(
        {
          flashCardID: flashcardId,
          level: newLevel,
        },
        `api/card/update/detail/${currentCard.id}`
      );

      showSuccess("Cập nhật mức độ thành công!");

      // ✅ Cập nhật lại level của currentCard tại chỗ
      setCurrentCard((prev) => (prev ? { ...prev, level: newLevel } : prev));

      // ✅ Đồng bộ lại trong danh sách practiceList
      setPracticeList((prev) =>
        prev.map((c) =>
          c.id === currentCard.id ? { ...c, level: newLevel } : c
        )
      );
    } catch (e) {
      showErrorMessage("Lỗi khi cập nhật mức độ!");
    }
  };

  // "Đã nhớ" — loại khỏi list luyện hiện tại (CHI PHIÊN) — không gọi API
  const handleIsRememberCheck = (cardId) => {
    if (!practiceList || practiceList.length === 0) return;

    const rememberedCard = practiceList.find((c) => c.id === cardId);
    if (!rememberedCard) return;

    // cập nhật practiceList dựa trên prev state để tránh race
    setPracticeList((prev) => {
      const newList = prev.filter((card) => card.id !== cardId);

      // lưu remembered trong phiên
      setRememberedInSession((prevRem) => {
        // tránh duplicate
        if (prevRem.some((c) => c.id === cardId)) return prevRem;
        return [...prevRem, rememberedCard];
      });

      // nếu sau khi xóa không còn phần tử -> show finish modal
      if (newList.length === 0) {
        // set currentCard null rồi mở modal hoàn thành (an toàn)
        setCurrentCard(null);
        setFinishModal(true);
        return [];
      }

      // nếu còn phần tử: nếu currentCard chính là card bị xóa thì chọn 1 card mới ngay
      if (currentCard?.id === cardId) {
        const arr = makeWeightedArray(newList);
        const next = arr[Math.floor(Math.random() * arr.length)];
        setCurrentCard(next);
      }

      message.success("Đã loại từ này khỏi danh sách ôn tập hiện tại");
      return newList;
    });
  };

  // Khôi phục từ từ modal vào practiceList (thêm vào cuối list)
  const handleIsRememberRestore = (cardId) => {
    const cardToRestore = rememberedInSession.find((c) => c.id === cardId);
    if (!cardToRestore) return;

    setRememberedInSession((prev) => prev.filter((c) => c.id !== cardId));
    setPracticeList((prev) => {
      // tránh duplicate
      if (prev.some((c) => c.id === cardId)) return prev;
      const next = [...prev, cardToRestore];
      // nếu currentCard đang null (không còn card) -> set currentCard mới
      if (!currentCard) {
        const arr = makeWeightedArray(next);
        const random = arr[Math.floor(Math.random() * arr.length)];
        setCurrentCard(random);
      }
      return next;
    });

    message.success("Đã thêm lại từ vào danh sách ôn tập hiện tại");
  };

  // Reset toàn bộ thẻ (gọi API)
  const handleResetAllCards = async () => {
    try {
      await put({}, `api/card/resetAll/${flashcardId}`);
      message.success("Reset danh sách " + flashcard.title);
      await loadDataList();
      navigate(
        `/VocabularyTopics/DetailTopic/DetailListFlashCard/${flashcardId}`
      );
    } catch (err) {
      showErrorMessage("Lỗi khi reset danh sách");
    }
  };

  // Hoàn thành ôn tập (gọi API)
  const handleFinishRehearse = async () => {
    try {
      const nexReview = dayjs()
        .add(flashcard.cycle, "day")
        .format("YYYY-MM-DD");
      await put(
        { reviewDate: nexReview, id: flashcardId },
        "api/flashcard/updateFlashCard"
      );
      showSuccess("Rất tốt. Thời gian ôn lại được cập nhật.");
      navigate(
        `/VocabularyTopics/DetailTopic/${topicId}/DetailListFlashCard/${flashcardId}`
      );
    } catch (err) {
      showErrorMessage("Lỗi khi hoàn thành ôn tập");
    }
  };

  // Tạo mảng có trọng số
  function makeWeightedArray(cards) {
    let arr = [];
    cards.forEach((card) => {
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
              <h2 className="PracticeFlashCard__title">
                {flashcard.title || "Không có tiêu đề"}
              </h2>

              {currentCard && (
                <div className="PracticeFlashCard__actions">
                  <Button
                    onClick={handleBackToList}
                    className="PracticeFlashCard__btn PracticeFlashCard__btnViewAll"
                  >
                    Xem tất cả
                  </Button>
                  <Button
                    className="PracticeFlashCard__btn PracticeFlashCard__btnViewMemory"
                    onClick={showModal}
                  >
                    Các từ đã nhớ
                  </Button>
                  <Button
                    className="PracticeFlashCard__btn finish_btn"
                    onClick={handleFinishRehearse}
                  >
                    Hoàn thành ôn tập
                  </Button>
                  <Button
                    onClick={handleResetAllCards}
                    className="PracticeFlashCard__btn PracticeFlashCard__btn--Stop"
                  >
                    Dừng học list này
                  </Button>
                </div>
              )}
            </div>
          </div>

          {currentCard ? (
            <>
              <div className="PracticeFlashCard__Content">
                <p className="PracticeFlashCard__note">
                  Lưu ý: Bạn nên học tối đa 15 từ mới một ngày để ghi nhớ tốt
                  hơn.
                </p>
                <div className="PracticeFlashCard__listFlashCard">
                  <CardPractice data={currentCard} />
                </div>

                {/* Ẩn nút “Từ tiếp theo” khi chỉ còn 1 từ */}
                {practiceList.length > 1 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      className="OptionForm__button"
                      style={{ width: "100px" }}
                      onClick={nextCard}
                    >
                      Từ tiếp theo
                    </Button>
                  </div>
                )}
              </div>

              <div className="PracticeFlashCard__Footer">
                <div
                  onClick={() => handleUpdateLevel(1)}
                  className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Easy"
                >
                  <FaRegFaceGrinBeam />
                  <span>Dễ</span>
                </div>
                <div
                  onClick={() => handleUpdateLevel(2)}
                  className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Medium"
                >
                  <FaRegFaceFrownOpen />
                  <span>Trung bình</span>
                </div>
                <div
                  onClick={() => handleUpdateLevel(3)}
                  className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Difficult"
                >
                  <FaRegFaceAngry />
                  <span>Khó</span>
                </div>
                <div
                  onClick={() => handleIsRememberCheck(currentCard.id)}
                  className="PracticeFlashCard__btnGeneral PracticeFlashCard__btnGeneral--Discard"
                >
                  <IoPlayForwardSharp />
                  <span>Đã nhớ, loại khỏi danh sách ôn tập</span>
                </div>
              </div>
            </>
          ) : (
            <p
              style={{
                textAlign: "center",
                marginTop: 200,
                marginBottom: 200,
                fontSize: 18,
              }}
            >
              Không có từ nào để luyện tập. Vui lòng thêm từ mới.
            </p>
          )}
        </div>
      </div>

      {/* Modal danh sách từ đã nhớ */}
      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>Các từ đã nhớ</div>
        }
      >
        {rememberedInSession.length === 0 ? (
          <p>Chưa có từ nào được đánh dấu là đã nhớ trong phiên này!</p>
        ) : (
          rememberedInSession.map((card) => (
            <div className="Card-remember" key={card.id}>
              <p className="Card-remember__word">{card.terminology}</p>
              <RiDeleteBin6Line
                className="Card-remember__delete"
                title="Thêm lại vào danh sách ôn tập"
                onClick={() => handleIsRememberRestore(card.id)}
              />
            </div>
          ))
        )}
      </BaseModal>

      {/* Modal hoàn thành */}
      <Modal
        open={finishModal}
        footer={null}
        onCancel={() => setFinishModal(false)}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 22,
            marginBottom: 12,
            marginTop: 12,
          }}
        >
          <PiConfettiFill style={{ color: "red", marginTop: 15 }} /> Bạn đã hoàn
          thành tất cả các từ trong danh sách này!
        </div>
        <p style={{ textAlign: "center", marginBottom: 20 }}>
          Hãy quay lại sau vài ngày để ôn tập lại nhé.
        </p>
        <div style={{ textAlign: "center" }}>
          <Button className="OptionForm__button" onClick={handleFinishRehearse}>
            Hoàn thành ôn tập
          </Button>
        </div>
      </Modal>
    </>
  );
}
