import "./ListTopicOfTab.scss";
import { Button, Pagination } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import BaseModal from "../BaseModal";
import { useState } from "react";
import {
  confirmBasic,
  confirmDelete,
  confirmShare,
  showErrorMessage,
  showSuccess,
  showWaringMessage,
} from "../../utils/alertHelper";
import AddAndEditTopicForm from "../AddAndEditTopicForm";
import { useNavigate } from "react-router-dom";
import { del, patch, post, put } from "../../utils/request";
import { IoShareSocialOutline } from "react-icons/io5";

export default function ListTopicOfTab(props) {
  const { list, activeTab, onCreateTopic } = props;
  const navigate = useNavigate();

  const [editingTopic, setEditingTopic] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const topicsToShow = list.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const showModal = (topic = null) => {
    if (localStorage.getItem("accessToken") == null) {
      showErrorMessage("Bạn chưa Đăng nhập.");
      return;
    }
    setEditingTopic(topic);
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
      if (onCreateTopic) onCreateTopic();
    }, 1000);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleClick = (item) => {
    if (localStorage.getItem("accessToken"))
      navigate(`/VocabularyTopics/DetailTopic/${item.id}`);
    else navigate(`/ReviewFlashCard/${item.id}`);
  };
  const handleDelete = async (id) => {
    const confirmed = await confirmDelete(
      "Bạn có chắc chắn muốn xóa chủ đề này?"
    );
    if (confirmed) {
      const result = await del(`api/flashcard/deleteTopic/${id}`);
      if (result) {
        showSuccess("Đã xóa thành công!");
        if (props.onTopicCreated) props.onTopicCreated(); // fetch lại list
      } else {
        showErrorMessage("Không thể xóa. Vui lòng thử lại.");
      }
    }
  };
  const handleShare = async (id) => {
    const confirmed = await confirmShare(
      "Bạn có chắc chắn muốn share chủ đề này?"
    );
    if (confirmed) {
      const result = await patch(null, `api/flashcard/shareTopic/${id}`);
      console.log("result share", result);
      if (result) {
        showSuccess("Đã share thành công!");
        if (props.onTopicCreated) props.onTopicCreated(); // fetch lại list
      } else {
        showWaringMessage(
          "Không thể share. Vì đây là topic bạn đã lấy từ kho từ vựng chung."
        );
      }
    }
  };
  const handleSavePublishTopic = async (item) => {
    if (localStorage.getItem("accessToken") == null) {
      showErrorMessage("Bạn chưa Đăng nhập.");
      return;
    }
    const confirmed = await confirmBasic(
      "Lưu chủ đề này vào kho từ vựng của bạn?"
    );
    if (confirmed) {
      const result = await post(
        {},
        `api/flashcard/savePublishTopic/${item.id}`,
        true
      );

      if (result === true) {
        showSuccess("Đã lưu chủ đề thành công.");
        if (props.onTopicCreated) props.onTopicCreated();
      } else {
        showErrorMessage(result.message);
      }
    }
  };

  return (
    <>
      {activeTab === 1 && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button
            type="primary"
            className="create-topic-button"
            onClick={() => showModal(null)}
          >
            + Tạo chủ đề
          </Button>
        </div>
      )}

      <div className="topic-list">
        {!list || list.length === 0 ? (
          <div className="no-topic-text">Không có chủ đề nào</div>
        ) : (
          topicsToShow.map((item, index) => (
            <div
              key={item.id}
              className="topic-item"
              onClick={() => {
                handleClick(item);
              }}
            >
              <div className="topic-item__index">
                {(currentPage - 1) * pageSize + index + 1}
              </div>
              <div className="topic-item__title">{item.title}</div>

              {activeTab === 1 && (
                <div>
                  <div className="topic-item__actions">
                    <EditOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        showModal(item);
                      }}
                      style={{ color: "#f59e0b" }}
                    />
                    <DeleteOutlined
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(item.id);
                      }}
                      style={{ color: "#ef4444", marginLeft: 10 }}
                    />
                  </div>
                </div>
              )}

              <InfoCircleOutlined className="topic-item__info" />
              {activeTab !== 6 && (
                <div className="topic-item__actions">
                  <IoShareSocialOutline
                    style={{ color: "#FF0000", cursor: "pointer" }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleShare(item.id);
                    }}
                  />
                </div>
              )}
              {activeTab === 6 && (
                <Button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleSavePublishTopic(item);
                  }}
                  className="btnApply"
                  type="link"
                  style={{ marginLeft: "auto" }}
                >
                  Áp dụng
                </Button>
              )}
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

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            {editingTopic ? "Chỉnh sửa chủ đề" : "Tạo chủ đề"}
          </div>
        }
      >
        <AddAndEditTopicForm
          onOK={handleOk}
          confirmLoading={confirmLoading}
          initialValues={editingTopic}
          onTopicCreated={props.onTopicCreated}
        />
      </BaseModal>
    </>
  );
}
