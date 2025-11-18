import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";
import BtnDetail from "../BtnDetail";
import { Button, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { HiOutlineSquare2Stack } from "react-icons/hi2";

export default function ReviewListCard({ list = [], topicId }) {
  console.log("list", list, topicId);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const topicsToShow = list.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClick = (flashcardId) => {
    navigate(`/ReviewFlashCard/ReviewDetailListCard/${flashcardId}/${topicId}`);
  };
  return (
    <>
      <div className="listFlashcard-list">
        {!list || list.length === 0 ? (
          <div className="no-topic-text">Danh sách rỗng.</div>
        ) : (
          topicsToShow.map((item) => (
            <div className="listFlashcard-card">
              <div className="listFlashcard-card__header">
                <h3 className="listFlashcard-card__title">{item?.title}</h3>
              </div>

              <div className="listFlashcard-card__info">
                <p className="listFlashcard-card__info-item">
                  <HiOutlineSquare2Stack className="listFlashcard-card__info-icon" />
                  <span>{item?.words} từ</span>
                </p>
              </div>

              <div className="listFlashcard-card__footer">
                <BtnDetail
                  onClick={() => {
                    handleClick(item?.id);
                  }}
                >
                  Chi tiết
                </BtnDetail>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        current={currentPage}
        pageSize={pageSize}
        total={list.length}
        onChange={(page) => setCurrentPage(page)}
      />
    </>
  );
}
