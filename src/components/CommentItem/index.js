import { useEffect, useState } from "react";
import "./CommentItem.scss";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Input } from "antd";
import dayjs from "dayjs";
import {
  DeleteComment,
  ReplyComment,
  UpdateComment,
  UpdateReplyComment,
  DeleteReplyComment,
} from "../../services/Exam/commentExamService";
import {
  confirmDelete,
  showErrorMessage,
  showSuccess,
} from "../../utils/alertHelper";

const { TextArea } = Input;

export default function CommentItem({
  id,
  userId,
  avatar,
  userName,
  createAt,
  content,
  replies,
  ReloadListComment,
  currentUserId,
  parentReplyID = null, // null nếu là bình luận, ID nếu là phản hồi
  rootCommentID = null, // ID của bình luận gốc
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content);
  const isOwnComment = currentUserId === userId;
  const isReply = parentReplyID !== null; // Xác định đây là phản hồi hay bình luận
  useEffect(() => {
    setEditedText(content);
  }, [content]);
  const handleSendReply = async () => {
    // console.log(
    //   "Check rootCommentID, parentReplyID, id:",
    //   rootCommentID,
    //   parentReplyID,
    //   id
    // );
    try {
      if (!replyText.trim()) {
        showErrorMessage("Nội dung phản hồi không được để trống!");
        return;
      }
      if (!currentUserId) {
        showErrorMessage("Vui lòng đăng nhập để gửi phản hồi!");
        return;
      }
      const values = {
        commentID: rootCommentID || id, // Dùng rootCommentID nếu có, nếu không dùng id (cho bình luận gốc)
        parentReplyID: isReply ? id : null, // Nếu là phản hồi, id hiện tại là parentReplyID
        content: replyText,
      };
      console.log("Sending reply values:", values);
      const result = await ReplyComment(values);
      if (!result) {
        showErrorMessage(
          "Gửi phản hồi thất bại! Không nhận được phản hồi từ server."
        );
        return;
      }
      showSuccess("Gửi phản hồi thành công!");
      setReplyText("");
      setShowReplyInput(false);
      ReloadListComment();
    } catch (error) {
      showErrorMessage(
        "Gửi phản hồi thất bại! Vui lòng kiểm tra kết nối hoặc thử lại.",
        error
      );
    }
  };

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleDelete = async (Id) => {
    if (replies && replies.length > 0) {
      const confirmed = await confirmDelete(
        "Bình luận có phản hồi. Bạn có chắc muốn xóa không?"
      );
      if (!confirmed) return;

      try {
        // Xóa tất cả phản hồi con
        for (const reply of replies) {
          if (reply.id) {
            await DeleteReplyComment(reply.id);
          }
        }
      } catch (error) {
        showErrorMessage("Xóa phản hồi con thất bại!", error);
        return;
      }
    } else {
      const confirmed = await confirmDelete(
        "Bạn có chắc muốn xóa bình luận hoặc phản hồi này?"
      );
      if (!confirmed) return;
    }

    try {
      const result = isReply
        ? await DeleteReplyComment(Id)
        : await DeleteComment(Id);
      if (!result) {
        showErrorMessage("Xóa thất bại! Dữ liệu không hợp lệ.");
        return;
      }
      showSuccess("Xóa thành công!");
      ReloadListComment();
    } catch (error) {
      showErrorMessage("Xóa thất bại! Có thể do dữ liệu không tồn tại.", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedText.trim()) {
        showErrorMessage("Nội dung không được để trống!");
        return;
      }
      const values = { content: editedText };
      const result = isReply
        ? await UpdateReplyComment(values, id)
        : await UpdateComment(values, id);
      if (!result) {
        showErrorMessage("Cập nhật thất bại! Dữ liệu không hợp lệ.");
        return;
      }
      showSuccess("Cập nhật thành công!");
      ReloadListComment();
      setIsEditing(false);
    } catch (error) {
      showErrorMessage(
        "Cập nhật thất bại! Có thể do dữ liệu không tồn tại.",
        error
      );
    }
  };

  const handleCancelEdit = () => {
    setEditedText(content);
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
            <p className="comment-item__name">{userName}</p>
            {isOwnComment && (
              <>
                <BiEdit
                  onClick={handleEdit}
                  className="comment-item__icon comment-item__icon--edit"
                />
                <RiDeleteBin6Line
                  className="comment-item__icon comment-item__icon--delete"
                  onClick={() => handleDelete(id)}
                />
              </>
            )}
          </div>

          <p className="comment-item__date">
            {dayjs(createAt).format("YYYY-MM-DD")}
          </p>
        </div>

        <div className="comment-item__body">
          {isEditing ? (
            <TextArea
              className="comment-item__textarea"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
          ) : (
            <p className="comment-item__text">{content}</p>
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

        {replies && replies.length > 0 && (
          <div className="comment-item__reply-box">
            {replies.map((reply, index) => (
              <CommentItem
                key={index}
                {...reply}
                ReloadListComment={ReloadListComment}
                currentUserId={currentUserId}
                parentReplyID={id} // ID của item hiện tại là parentReplyID cho reply con
                rootCommentID={rootCommentID || id} // Truyền rootCommentID, dùng id nếu là bình luận gốc
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
