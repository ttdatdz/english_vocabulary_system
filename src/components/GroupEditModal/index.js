import React from "react";
import BaseModal from "../BaseModal";

export default function GroupEditModal(props) {
  const {
    open,
    onClose,
    draftGroup,
    onChangeGroupField,
    onAddImage,
    onRemoveImage,
    onSave,
    loading,
    isEditing,
  } = props;

  if (!draftGroup) return null;

  const serverImages = Array.isArray(draftGroup.imageUrls)
    ? draftGroup.imageUrls
    : [];
  const localImagePreviews = Array.isArray(draftGroup.imagePreviews)
    ? draftGroup.imagePreviews
    : [];

  return (
    <BaseModal
      open={open}
      onCancel={onClose}
      title={isEditing ? "Chỉnh sửa nhóm câu hỏi" : "Tạo nhóm câu hỏi mới"}
      width={900}
    >
      <div style={{ maxHeight: 520, overflow: "auto" }}>
        <div className="group-edit-form">
          <div className="group-edit-form__header">
            <h3>
              {isEditing ? "Chỉnh sửa nhóm câu hỏi" : "Tạo nhóm câu hỏi mới"}
            </h3>
          </div>
          <div className="group-edit-form__body">
            <div className="group-edit-form__group">
              <label>Nội dung (hội thoại / đoạn văn)</label>
              <textarea
                value={draftGroup.content || ""}
                onChange={(e) => onChangeGroupField("content", e.target.value)}
                rows={6}
                placeholder="Nhập nội dung hội thoại hoặc đoạn văn"
              />
            </div>

            <div className="group-edit-form__group">
              <label>Hình ảnh</label>
              <div className="group-edit-form__media-section">
                <label className="group-edit-form__upload-btn">
                  <span>+ Thêm hình</span>
                  <input type="file" accept="image/*" onChange={onAddImage} />
                </label>

                {(serverImages.length > 0 || localImagePreviews.length > 0) && (
                  <div className="group-edit-form__image-list">
                    {serverImages.map((url, idx) => (
                      <div
                        key={`server-img-${idx}`}
                        className="group-edit-form__image-item"
                      >
                        <img src={url} alt={`server-${idx}`} />
                        <button
                          type="button"
                          onClick={() => onRemoveImage("server", idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {localImagePreviews.map((url, idx) => (
                      <div
                        key={`local-img-${idx}`}
                        className="group-edit-form__image-item"
                      >
                        <img src={url} alt={`preview-${idx}`} />
                        <button
                          type="button"
                          onClick={() => onRemoveImage("local", idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="group-edit-form__footer" style={{ marginTop: 16 }}>
              <button
                className="group-edit-form__btn group-edit-form__btn--outlined"
                type="button"
                onClick={onClose}
              >
                Huỷ
              </button>
              <button
                className="group-edit-form__btn group-edit-form__btn--solid"
                type="button"
                onClick={onSave}
                disabled={loading}
              >
                {loading
                  ? "Đang lưu..."
                  : isEditing
                    ? "Lưu thay đổi"
                    : "Tạo nhóm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
