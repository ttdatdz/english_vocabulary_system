import "./ListFlashCardOfTab.scss";
import { Button, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import BaseModal from "../BaseModal";
import { useEffect, useState } from "react";
import { HiOutlineSquare2Stack } from "react-icons/hi2";
import { confirmDelete, showErrorMessage, showSuccess } from "../../utils/alertHelper";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import AddAndEditListFlashCardForm from "../AddAndEditListFlashCardForm";
import BtnDetail from "../BtnDetail";
import { useNavigate } from "react-router-dom";
import { del } from "../../utils/request";

export default function ListFlashCardOfTab(props) {
    const { topicId, list, activeTab, onFlashCardCreated } = props;
    const navigate = useNavigate();
    const [editingListFlashCard, setEditingListFlashCard] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const topicsToShow = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const showModal = (FlashCards = null) => {
        if(localStorage.getItem("accessToken")==null){
            showErrorMessage("Bạn chưa Đăng nhập.");
            return;
        }
        setEditingListFlashCard(FlashCards);
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
            if (onFlashCardCreated) onFlashCardCreated();
        }, 1000);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleClick = (flashcardId) => {
        navigate(`/VocabularyTopics/DetailTopic/DetailListFlashCard/${flashcardId}`)
    }
    const handleDelete = async (id) => {
        const confirmed = await confirmDelete("Bạn có chắc chắn muốn xóa list từ này?");
        if (confirmed) {
            const result = await del(`api/flashcard/deleteFlashCard/${id}`);
            if (result) {
                showSuccess("Đã xóa thành công!");
                if (props.onFlashCardCreated) props.onFlashCardCreated(); // fetch lại list
            } else {
                showErrorMessage("Không thể xóa. Vui lòng thử lại.");
            }
        }
    }
    return (
        <>
            {activeTab === 1 && (
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Button type="primary" className="create-listFlashCard-button" onClick={() => showModal(null)}>
                        + Tạo list từ
                    </Button>
                </div>
            )}

            <div className="listFlashcard-list">
                {(!list || list.length === 0) ? (
                    <div className="no-topic-text">Danh sách rỗng.</div>
                ) : (
                    topicsToShow.map((item) => (
                        <div className="listFlashcard-card">
                            <div className="listFlashcard-card__header">
                                <h3 className="listFlashcard-card__title">{item?.title}</h3>
                                {activeTab === 1 && (
                                    <div className="listFlashcard-card__icons">
                                        <EditOutlined onClick={(e) => { e.stopPropagation(); showModal(item); }} className="listFlashcard-card__icon listFlashcard-card__icon--edit" />
                                        <DeleteOutlined onClick={async (e) => { e.stopPropagation(); await handleDelete(item.id); }} className="listFlashcard-card__icon listFlashcard-card__icon--delete" />
                                    </div>
                                )}
                            </div>

                            <div className="listFlashcard-card__info">
                                <p className="listFlashcard-card__info-item">
                                    <HiOutlineSquare2Stack className="listFlashcard-card__info-icon" />
                                    <span>{item?.words} từ</span>
                                </p>
                                {item.reviewDate && (
                                    <p className="listFlashcard-card__info-item">Ôn lại {item.reviewDate}</p>
                                )}
                                <p className="listFlashcard-card__info-item">Chưa có ngày ôn lại</p>
                            </div>

                            <div className="listFlashcard-card__footer">
                                <BtnDetail onClick={() => { handleClick(item.id) }}>Chi tiết</BtnDetail>
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
                onChange={page => setCurrentPage(page)}
            />

            <BaseModal
                open={open}
                onCancel={handleClose}
                title={
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {editingListFlashCard ? "Chỉnh sửa list từ" : "Tạo list từ"}
                    </div>
                }
            >
                <AddAndEditListFlashCardForm
                    onOK={handleOk}
                    topicId={topicId}
                    confirmLoading={confirmLoading}
                    initialValues={editingListFlashCard}
                    onFlashCardCreated={onFlashCardCreated}
                />
            </BaseModal>
        </>
    );
}
