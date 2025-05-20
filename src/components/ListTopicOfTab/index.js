import "./ListTopicOfTab.scss";
import { Button, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import BaseModal from "../BaseModal";
import { useState } from "react";
import { confirmDelete } from "../../utils/alertHelper";
import AddAndEditTopicForm from "../AddAndEditTopicForm";
import { useNavigate } from "react-router-dom";

export default function ListTopicOfTab(props) {
    const { list, activeTab } = props;
    const navigate = useNavigate();


    const [editingTopic, setEditingTopic] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = (topic = null) => {
        setEditingTopic(topic);
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
    const handleClick = () => {
        navigate('/VocabularyTopics/DetailTopic');
    }

    return (
        <>
            {activeTab === 1 && (
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Button type="primary" className="create-topic-button" onClick={() => showModal(null)}>
                        + Tạo chủ đề
                    </Button>
                </div>
            )}

            <div className="topic-list">
                {list.map((item, index) => (
                    <div key={item.id} className="topic-item" onClick={handleClick}>
                        <div className="topic-item__index">{index + 1}</div>
                        <div className="topic-item__title">{item.title}</div>

                        {activeTab === 1 && (
                            <div className="topic-item__actions">
                                <EditOutlined onClick={() => showModal(item)} style={{ color: "#f59e0b" }} />
                                <DeleteOutlined onClick={() => confirmDelete()} style={{ color: "#ef4444", marginLeft: 10 }} />
                            </div>
                        )}

                        <InfoCircleOutlined className="topic-item__info" />

                        {activeTab === 3 && (
                            <Button className="btnApply" type="link" style={{ marginLeft: "auto" }}>
                                Áp dụng
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Pagination align="center" defaultCurrent={1} total={50} />

            <BaseModal
                open={open}
                onCancel={handleClose}
                title={
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {editingTopic ? "Chỉnh sửa chủ đề" : "Tạo chủ đề"}
                    </div>
                }
            >
                <AddAndEditTopicForm
                    onOK={handleOk}
                    confirmLoading={confirmLoading}
                    initialValues={editingTopic}
                />
            </BaseModal>
        </>
    );
}
