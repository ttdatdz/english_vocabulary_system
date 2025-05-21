import "./ListFlashCardOfTab.scss";
import { Button, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import BaseModal from "../BaseModal";
import { useState } from "react";
import { HiOutlineSquare2Stack } from "react-icons/hi2";
import { confirmDelete } from "../../utils/alertHelper";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import AddAndEditListFlashCardForm from "../AddAndEditListFlashCardForm";
import BtnDetail from "../BtnDetail";

export default function ListFlashCardOfTab(props) {
    const { list, activeTab } = props;

    const [editingListFlashCard, setEditingListFlashCard] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = (FlashCards = null) => {
        setEditingListFlashCard(FlashCards);
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                {list.map((item, index) => (
                    <div className="listFlashcard-card" key={index}>
                        <div className="listFlashcard-card__header">
                            <h3 className="listFlashcard-card__title">600 TOEIC Words</h3>
                            {activeTab === 1 && (
                                <div className="listFlashcard-card__icons">
                                    <EditOutlined onClick={() => showModal(item)} className="listFlashcard-card__icon listFlashcard-card__icon--edit" />
                                    <DeleteOutlined onClick={() => confirmDelete()} className="listFlashcard-card__icon listFlashcard-card__icon--delete" />
                                </div>
                            )}
                            {activeTab === 3 && (
                                <div className="listFlashcard-card__icons">
                                    <MdCheckBoxOutlineBlank className="listFlashcard-card__icon listFlashcard-card__icon--apply" />
                                </div>
                            )}
                        </div>

                        <div className="listFlashcard-card__info">
                            <p className="listFlashcard-card__info-item">
                                <HiOutlineSquare2Stack className="listFlashcard-card__info-icon" />
                                <span>35 từ</span>
                            </p>
                            {activeTab === 3 ? (
                                <p className="listFlashcard-card__info-item">
                                    <UserOutlined className="listFlashcard-card__info-icon" />
                                    <span>120001 Lượt truy cập</span>
                                </p>
                            ) : (
                                <p className="listFlashcard-card__info-item">Ôn lại 10/3/2025</p>
                            )}
                        </div>

                        <div className="listFlashcard-card__footer">
                            <BtnDetail>Chi tiết</BtnDetail>
                        </div>
                    </div>
                ))}
            </div>


            <Pagination align="center" defaultCurrent={1} total={50} />

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
                    confirmLoading={confirmLoading}
                    initialValues={editingListFlashCard}
                />
            </BaseModal>
        </>
    );
}
