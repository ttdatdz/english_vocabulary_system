import { useState } from "react";
import "./CommentItem.scss";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Input } from "antd";
const { TextArea } = Input;

export default function CommentItem({
  avatar,
  name,
  date,
  text,
  replies = [],
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log("Reply sent:", replyText);
      // TODO: handle reply logic here (e.g., update replies list via props or context)
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleDelete = () => {
    console.log("Deleted comment:", text);
    // TODO: thêm logic xóa comment tại đây
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    console.log("Edited comment:", editedText);
    // TODO: cập nhật nội dung comment trong state hoặc context
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  return (
    <div className="comment-item">
      <div>
        <img className="comment-item__avatar" src={avatar} alt="avatar" />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div className="comment-item__info">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexDirection: "row",
            }}
          >
            <p className="comment-item__name">{name}</p>
            <BiEdit
              onClick={handleEdit}
              className="comment-item__icon comment-item__icon--edit"
            />
            <RiDeleteBin6Line
              className="comment-item__icon comment-item__icon--delete"
              onClick={handleDelete}
            />
          </div>

          <p className="comment-item__date">{date}</p>
        </div>

        <div className="comment-item__body">
          {isEditing ? (
            <TextArea
              className="comment-item__textarea"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
          ) : (
            <p className="comment-item__text">{text}</p>
          )}
        </div>

        <div className="comment-item__actions">
          {!isEditing ? (
            <>
              <p
                className="comment-item__reply"
                onClick={() => setShowReplyInput(true)}
              >
                Trả lời
              </p>
            </>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSaveEdit} className="btn-send">
                Lưu
              </button>
              <button onClick={handleCancelEdit} className="btn-cancel">
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Ô nhập phản hồi */}
        {showReplyInput && (
          <div className="comment-item__reply-input">
            <TextArea
              className="comment-item__textarea"
              placeholder="Nhập phản hồi của bạn ..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="comment-item__reply-buttons">
              <button onClick={handleSendReply} className="btn-send">
                Gửi
              </button>
              <button onClick={handleCancelReply} className="btn-cancel">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Hiển thị các reply */}
        {replies.length > 0 && (
          <div className="comment-item__reply-box">
            {replies.map((reply, index) => (
              <CommentItem key={index} {...reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
