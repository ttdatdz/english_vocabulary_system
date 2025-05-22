import { Button, Pagination } from "antd";
import "./DetailListFlashCard.scss";
import CardVocabulary from "../../components/CardVocabulary/index,";
import BaseModal from "../../components/BaseModal";
import AddAndEditVocabForm from "../../components/AddAndEditVocabForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function DetailListFalshCard() {
    const navigate = useNavigate();
    const [editingVocab, setEditingVocab] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showModal = (vocab = null) => {
        setEditingVocab(vocab);
        setOpen(true);
    };
    const handleClick = () => {
        navigate("/PracticeFlashCard");
    }
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
            <div className="MainContainer">
                <div className="DetailListFlashCard">
                    <div className="DetailListFlashCard__header">
                        <div className="DetailListFlashCard__start-header">
                            <h2 className="DetailListFlashCard__title">Test 1 - ETS 2024</h2>
                            <Button className="DetailListFlashCard__btnAdd" onClick={() => showModal(null)}>+ Thêm từ mới</Button>
                            <Button className="DetailListFlashCard__btnAdd">Thêm hàng loạt</Button>
                        </div>
                        <p className="DetailListFlashCard__description">Ôn lại 17/3/2025</p>
                    </div>
                    <div className="DetailListFlashCard__Content">
                        <div>
                            <Button className="DetailListFlashCard__btnPractice" onClick={handleClick}>Luyện tập flashcards</Button>
                        </div>
                        <div className="DetailListFlashCard__listFlashCard">
                            <CardVocabulary showModal={showModal} />
                        </div>
                        <Pagination align="center" defaultCurrent={1} total={50} />
                    </div>
                </div>
            </div>

            <BaseModal
                open={open}
                onCancel={handleClose}
                title={
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {editingVocab ? "Chỉnh sửa từ mới" : "Tạo từ mới"}
                    </div>
                }
            >
                <AddAndEditVocabForm
                    onOK={handleOk}
                    confirmLoading={confirmLoading}
                    initialValues={editingVocab}
                />
            </BaseModal>
        </>
    )
}