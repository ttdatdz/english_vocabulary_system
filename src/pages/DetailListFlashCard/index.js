import { Button, Form, Pagination } from "antd";
import "./DetailListFlashCard.scss";

import BaseModal from "../../components/BaseModal";
import AddAndEditVocabForm from "../../components/AddAndEditVocabForm";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../../utils/request";
import { showErrorMessage } from "../../utils/alertHelper";
import CardVocabulary from "../../components/CardVocabulary";

export default function DetailListFalshCard() {
  const navigate = useNavigate();
  const [editingVocab, setEditingVocab] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [form] = Form.useForm();
  const [justAdded, setJustAdded] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Cập nhật pageSize thành 10
  const total = cards.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const cardsToShow = cards.slice(startIndex, endIndex); // Lấy danh sách 10 từ cho mỗi trang
  const { flashcardId } = useParams();
  const [flashcard, setFlashCard] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());
  const fetchListCard = async () => {
    try {
      const data = await get(`api/card/getByFlashCard/${flashcardId}`);
      if (data) {
        setCards(data);
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
    if (justAdded && cards.length > 0) {
      const totalPage = Math.max(1, Math.ceil(cards.length / pageSize));
      setCurrentPage(totalPage); // Nhảy về trang cuối khi thêm từ mới
      setJustAdded(false);
    }
    loadFlashCardInfor();
    fetchListCard();
  }, [flashcardId, cards.length]);

  const showModal = (vocab = null) => {
    setEditingVocab(vocab);
    setOpen(true);
    if (!vocab) {
      form.resetFields(); // Reset field khi thêm từ mới
    }
    setFormKey(Date.now());
  };

  const handleClick = () => {
    navigate(
      `/VocabularyTopics/DetailTopic/DetailListFlashCard/PracticeFlashCard/${flashcardId}`
    );
  };

  const handleOk = () => {
    // setConfirmLoading(true);
    setJustAdded(true);
    setConfirmLoading(false);
    setOpen(false);
    // setTimeout(() => {

    // }, 1000);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="MainContainer">
        <div className="DetailListFlashCard">
          <div className="DetailListFlashCard__header">
            <div className="DetailListFlashCard__start-header">
              <h2 className="DetailListFlashCard__title">
                {flashcard?.title || "Không có tiêu đề"}
              </h2>
              <Button
                className="DetailListFlashCard__btnAdd"
                onClick={() => showModal(null)}
              >
                + Thêm từ mới
              </Button>
              {/* <Button className="DetailListFlashCard__btnAdd">
                Thêm hàng loạt
              </Button> */}
            </div>
            <p className="DetailListFlashCard__description">
              {flashcard?.reviewDate
                ? "Ôn lại " + flashcard?.reviewDate
                : "Chưa có ngày ôn tập"}
            </p>
          </div>
          <div className="DetailListFlashCard__Content">
            <div>
              <Button
                className="DetailListFlashCard__btnPractice"
                onClick={handleClick}
              >
                Luyện tập flashcards
              </Button>
            </div>
            <div className="DetailListFlashCard__listFlashCard">
              {cardsToShow.length > 0 ? (
                cardsToShow.map((card) => (
                  <CardVocabulary
                    key={card.id} // Thêm key để tránh cảnh báo React
                    onFetchingData={() => fetchListCard()}
                    data={card}
                    showModal={showModal}
                  />
                ))
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

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {editingVocab ? "Chỉnh sửa từ mới" : "Tạo từ mới"}
          </div>
        }
      >
        <AddAndEditVocabForm
          form={form}
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={editingVocab}
          onFetchingData={() => fetchListCard()}
          setConfirmLoading={setConfirmLoading}
          key={formKey}
        />
      </BaseModal>
    </>
  );
}
