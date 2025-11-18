import { Button, Form, Pagination } from "antd";
import "../DetailListFlashCard/DetailListFlashCard.scss";
import CardVocabulary from "../../components/CardVocabulary/index";
import BaseModal from "../../components/BaseModal";
import AddAndEditVocabForm from "../../components/AddAndEditVocabForm";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";
export default function ReviewDetailListCard(props) {
  const { topicId, list } = props;
  const { flashcardId } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const total = cards.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const cardsToShow = Array.isArray(cards.listCardResponse)
    ? cards.listCardResponse.slice(startIndex, endIndex)
    : []; // pageSize = 1 nên chỉ cần index này
  const [flashcard, setFlashCard] = useState(null);

  const fetchListCard = async () => {
    try {
      const data = await get(`api/card/getByFlashCard/${flashcardId}`);
      console.log("data fetchListCard", data);
      if (data) {
        setCards(data);
        // console.log("data Cards(", cards);
      }
      const totalPage = Math.max(1, Math.ceil(data.length / pageSize));
      if (currentPage > totalPage) {
        setCurrentPage(totalPage); // Nhảy về trang cuối hợp lệ
      }
    } catch (err) {
      showErrorMessage("Có lỗi khi tải dữ liệu.");
    }
  };

  const loadFlashCardInfor = async () => {
    try {
      const data = await get(`api/flashcard/id/${flashcardId}`);
      if (data) setFlashCard(data);
    } catch (err) {
      showErrorMessage(err);
    }
  };
  useEffect(() => {
    loadFlashCardInfor();
    fetchListCard();
  }, [flashcardId, cards.length]);
  console.log("cards", cards);
  return (
    <>
      <div className="MainContainer">
        <div className="DetailListFlashCard">
          <div className="DetailListFlashCard__header">
            <div className="DetailListFlashCard__start-header">
              <h2 className="DetailListFlashCard__title">
                {flashcard?.title || "Không có tiêu đề"}
              </h2>
            </div>
          </div>
          <div className="DetailListFlashCard__Content">
            <div className="DetailListFlashCard__listFlashCard">
              {cardsToShow ? (
                <CardVocabulary
                  onFetchingData={() => {
                    fetchListCard();
                  }}
                  data={cardsToShow}
                  onReview={true}
                />
              ) : (
                <div>Không có từ nào trong danh sách này.</div>
              )}
            </div>
            <Pagination
              align="center"
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              style={{ marginTop: 20, textAlign: "center" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
