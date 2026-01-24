import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, Dropdown, Empty, Spin, message } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    UnorderedListOutlined,
    GroupOutlined,
} from "@ant-design/icons";
import "./DisorderExamPage.scss";
import { get, post, put, del, postFormData } from "../../utils/request";
import CreateToeicQuestion from "../../components/CreateToeicQuestion";
import CreateGroupToeicQuestion from "../../components/CreateGroupToeicQuestion";
import BaseModal from "../../components/BaseModal";

const LETTERS = ["A", "B", "C", "D", "E"];

// ==================== HELPER FUNCTIONS ====================

const isUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);

const mapSingleItemToLocal = (item) => ({
    id: item.id,
    type: "single",
    displayOrder: item.displayOrder,
    detail: item.detail || "",
    result: item.result || "",
    clarify: item.clarify || "",
    imageUrls: (item.images || []).filter(isUrl),
    imageKeys: item.imageKeys || [],
    imageFiles: [],
    imagePreviews: [],
    audioUrl: item.audio || "",
    audioKey: item.audioKey || "",
    audioFile: null,
    audioPreview: "",
    options: (item.options || []).map((o) => o.detail || ""),
    correctOptionIndex: LETTERS.indexOf(item.result),
    isContribute: item.isContribute,
    bankQuestionId: item.bankQuestionId,
});

const mapGroupItemToLocal = (item) => ({
    id: item.id,
    type: "group",
    displayOrder: item.displayOrder,
    title: item.title || "",
    content: item.content || "",
    questionRange: item.questionRange || "",
    imageUrls: (item.groupImages || []).filter(isUrl),
    imageKeys: item.groupImageKeys || [],
    imageFiles: [],
    imagePreviews: [],
    audioUrls: (item.groupAudios || []).filter(isUrl),
    audioKeys: item.groupAudioKeys || [],
    audioFiles: [],
    audioPreviews: [],
    questions: (item.questions || []).map((q) => ({
        id: q.id,
        indexNumber: q.indexNumber,
        detail: q.detail || "",
        result: q.result || "",
        clarify: q.clarify || "",
        imageUrls: (q.images || []).filter(isUrl),
        imageKeys: q.imageKeys || [],
        imageFiles: [],
        imagePreviews: [],
        options: (q.options || []).map((o) => o.detail || ""),
        correctOptionIndex: LETTERS.indexOf(q.result),
    })),
    groupIsContribute: item.groupIsContribute,
    bankGroupId: item.bankGroupId,
});

const mapResponseToLocal = (item) => {
    if (item.type === "single") return mapSingleItemToLocal(item);
    return mapGroupItemToLocal(item);
};

const createEmptySingle = () => ({
    id: null,
    type: "single",
    displayOrder: null,
    detail: "",
    result: "",
    clarify: "",
    imageUrls: [],
    imageKeys: [],
    imageFiles: [],
    imagePreviews: [],
    audioUrl: "",
    audioKey: "",
    audioFile: null,
    audioPreview: "",
    options: ["", ""],
    correctOptionIndex: null,
});

const createEmptyGroup = () => ({
    id: null,
    type: "group",
    displayOrder: null,
    title: "",
    content: "",
    questionRange: "",
    imageUrls: [],
    imageKeys: [],
    imageFiles: [],
    imagePreviews: [],
    audioUrls: [],
    audioKeys: [],
    audioFiles: [],
    audioPreviews: [],
    questions: [],
});

const createEmptyChildQuestion = () => ({
    id: null,
    indexNumber: null,
    detail: "",
    result: "",
    clarify: "",
    imageUrls: [],
    imageKeys: [],
    imageFiles: [],
    imagePreviews: [],
    options: ["", ""],
    correctOptionIndex: null,
});

// ==================== MAIN COMPONENT ====================

export default function DisorderExamPage() {
    const { examId } = useParams();
    const navigate = useNavigate();

    // Exam state
    const [examTitle, setExamTitle] = useState("");
    const [examDuration, setExamDuration] = useState(60);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit title mode
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState("");

    // Modal states
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showChildQuestionModal, setShowChildQuestionModal] = useState(false);

    // Draft states
    const [draftSingle, setDraftSingle] = useState(null);
    const [editingSingleId, setEditingSingleId] = useState(null);
    const [draftGroup, setDraftGroup] = useState(null);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [draftChildQuestion, setDraftChildQuestion] = useState(null);
    const [editingChildId, setEditingChildId] = useState(null);
    const [currentGroupId, setCurrentGroupId] = useState(null);

    // Expanded state
    const [expandedGroupId, setExpandedGroupId] = useState(null);

    // Drag state
    const [draggingId, setDraggingId] = useState(null);
    const [draggingType, setDraggingType] = useState(null);

    // ==================== LOAD DATA ====================

    useEffect(() => {
        loadExamDetail();
    }, [examId]);

    const loadExamDetail = async () => {
        setLoading(true);
        try {
            const res = await get(`/api/disorder-exam/${examId}`, true);
            if (res) {
                setExamTitle(res.title || "");
                setExamDuration(res.duration || 60);
                const mapped = (res.items || []).map(mapResponseToLocal);
                mapped.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                setItems(mapped);
            }
        } catch (err) {
            console.error("Load exam error:", err);
            message.error("Không thể tải đề thi");
        } finally {
            setLoading(false);
        }
    };

    // ==================== EXAM TITLE ====================

    const handleStartEditTitle = () => {
        setTempTitle(examTitle);
        setEditingTitle(true);
    };

    const handleSaveTitle = async () => {
        if (!tempTitle.trim()) {
            message.warning("Tiêu đề không được để trống");
            return;
        }
        try {
            await put({ title: tempTitle.trim() }, `/api/disorder-exam/${examId}`, true);
            setExamTitle(tempTitle.trim());
            setEditingTitle(false);
            message.success("Đã lưu tiêu đề");
        } catch (err) {
            message.error("Lưu tiêu đề thất bại");
        }
    };

    const handleCancelEditTitle = () => {
        setEditingTitle(false);
        setTempTitle("");
    };

    // ==================== SINGLE QUESTION HANDLERS ====================

    const handleAddSingle = () => {
        setDraftSingle(createEmptySingle());
        setEditingSingleId(null);
        setShowSingleModal(true);
    };

    const handleEditSingle = (item) => {
        setDraftSingle({
            ...item,
            audioFile: null,
            audioPreview: "",
            imageFiles: [],
            imagePreviews: [],
        });
        setEditingSingleId(item.id);
        setShowSingleModal(true);
    };

    const handleCloseSingleModal = () => {
        setShowSingleModal(false);
        setDraftSingle(null);
        setEditingSingleId(null);
    };

    const handleSaveSingle = async () => {
        if (!draftSingle?.detail?.trim()) {
            message.warning("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        const trimmedOptions = (draftSingle.options || []).map((o) => (o || "").trim());
        if (trimmedOptions.filter(Boolean).length < 2) {
            message.warning("Vui lòng nhập ít nhất 2 đáp án");
            return;
        }

        const idx = draftSingle.correctOptionIndex;
        if (idx == null || idx < 0 || !trimmedOptions[idx]) {
            message.warning("Vui lòng chọn đáp án đúng");
            return;
        }

        setSaving(true);
        try {
            // Upload media
            let uploadedImageKeys = [];
            let uploadedAudioKey = null;

            const hasNewMedia =
                draftSingle.audioFile || (draftSingle.imageFiles && draftSingle.imageFiles.length > 0);

            if (hasNewMedia) {
                const fd = new FormData();
                if (draftSingle.audioFile) fd.append("audios", draftSingle.audioFile);
                if (draftSingle.imageFiles?.length > 0) {
                    draftSingle.imageFiles.forEach((f) => fd.append("images", f));
                }
                const uploadRes = await postFormData("/api/media/upload", fd, true);
                uploadedAudioKey = uploadRes?.audios?.[0]?.key || null;
                uploadedImageKeys = (uploadRes?.images || []).map((x) => x?.key).filter(Boolean);
            }

            const allImageKeys = [...(draftSingle.imageKeys || []), ...uploadedImageKeys].filter(Boolean);

            const payload = {
                detail: draftSingle.detail.trim(),
                result: LETTERS[idx],
                clarify: (draftSingle.clarify || "").trim(),
                options: trimmedOptions.map((opt, optIdx) => ({
                    mark: LETTERS[optIdx],
                    detail: opt,
                })),
                images: allImageKeys.map((key) => ({ url: key })),
            };

            // Audio logic
            if (draftSingle.removeAudio) {
                payload.audio = null;
            } else if (uploadedAudioKey) {
                payload.audio = uploadedAudioKey;
            } else if (draftSingle.audioKey) {
                payload.audio = draftSingle.audioKey;
            }

            if (editingSingleId) {
                await put(payload, `/api/disorder-exam/${examId}/question/${editingSingleId}`, true);
                message.success("Cập nhật câu hỏi thành công");
            } else {
                await post(payload, `/api/disorder-exam/${examId}/question`, true);
                message.success("Thêm câu hỏi thành công");
            }

            await loadExamDetail();
            handleCloseSingleModal();
        } catch (err) {
            console.error("Save single error:", err);
            message.error(err?.message || "Lưu câu hỏi thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSingle = async (itemId) => {
        if (!window.confirm("Xóa câu hỏi này?")) return;

        try {
            await del(`/api/disorder-exam/${examId}/question/${itemId}`, true);
            message.success("Đã xóa câu hỏi");
            await loadExamDetail();
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    // ==================== GROUP HANDLERS ====================

    const handleAddGroup = () => {
        setDraftGroup(createEmptyGroup());
        setEditingGroupId(null);
        setShowGroupModal(true);
    };

    const handleEditGroup = (item) => {
        setDraftGroup({
            ...item,
            imageFiles: [],
            imagePreviews: [],
            audioFiles: [],
            audioPreviews: [],
        });
        setEditingGroupId(item.id);
        setShowGroupModal(true);
    };

    const handleCloseGroupModal = () => {
        setShowGroupModal(false);
        setDraftGroup(null);
        setEditingGroupId(null);
    };

    const handleSaveGroup = async () => {
        if (!draftGroup?.content?.trim()) {
            message.warning("Vui lòng nhập nội dung nhóm");
            return;
        }

        setSaving(true);
        try {
            // Upload media
            let uploadedImageKeys = [];
            let uploadedAudioKeys = [];

            const hasNewMedia =
                (draftGroup.imageFiles && draftGroup.imageFiles.length > 0) ||
                (draftGroup.audioFiles && draftGroup.audioFiles.length > 0);

            if (hasNewMedia) {
                const fd = new FormData();
                if (draftGroup.imageFiles?.length > 0) {
                    draftGroup.imageFiles.forEach((f) => fd.append("images", f));
                }
                if (draftGroup.audioFiles?.length > 0) {
                    draftGroup.audioFiles.forEach((f) => fd.append("audios", f));
                }
                const uploadRes = await postFormData("/api/media/upload", fd, true);
                uploadedImageKeys = (uploadRes?.images || []).map((x) => x?.key).filter(Boolean);
                uploadedAudioKeys = (uploadRes?.audios || []).map((x) => x?.key).filter(Boolean);
            }

            const allImageKeys = [...(draftGroup.imageKeys || []), ...uploadedImageKeys].filter(Boolean);
            const allAudioKeys = [...(draftGroup.audioKeys || []), ...uploadedAudioKeys].filter(Boolean);

            const payload = {
                title: (draftGroup.title || "").trim(),
                content: draftGroup.content.trim(),
                images: allImageKeys.map((key) => ({ url: key })),
                audios: allAudioKeys.map((key) => ({ url: key })),
            };

            if (editingGroupId) {
                await put(payload, `/api/disorder-exam/${examId}/group/${editingGroupId}`, true);
                message.success("Cập nhật nhóm thành công");
            } else {
                await post(payload, `/api/disorder-exam/${examId}/group`, true);
                message.success("Thêm nhóm thành công");
            }

            await loadExamDetail();
            handleCloseGroupModal();
        } catch (err) {
            console.error("Save group error:", err);
            message.error(err?.message || "Lưu nhóm thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Xóa nhóm câu hỏi này?")) return;

        try {
            await del(`/api/disorder-exam/${examId}/group/${groupId}`, true);
            message.success("Đã xóa nhóm");
            await loadExamDetail();
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    // ==================== CHILD QUESTION HANDLERS ====================

    const handleAddChildQuestion = (groupId) => {
        setCurrentGroupId(groupId);
        setDraftChildQuestion(createEmptyChildQuestion());
        setEditingChildId(null);
        setShowChildQuestionModal(true);
    };

    const handleEditChildQuestion = (groupId, question) => {
        setCurrentGroupId(groupId);
        setDraftChildQuestion({
            ...question,
            imageFiles: [],
            imagePreviews: [],
        });
        setEditingChildId(question.id);
        setShowChildQuestionModal(true);
    };

    const handleCloseChildQuestionModal = () => {
        setShowChildQuestionModal(false);
        setDraftChildQuestion(null);
        setEditingChildId(null);
        setCurrentGroupId(null);
    };

    const handleSaveChildQuestion = async () => {
        if (!draftChildQuestion?.detail?.trim()) {
            message.warning("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        const trimmedOptions = (draftChildQuestion.options || []).map((o) => (o || "").trim());
        if (trimmedOptions.filter(Boolean).length < 2) {
            message.warning("Vui lòng nhập ít nhất 2 đáp án");
            return;
        }

        const idx = draftChildQuestion.correctOptionIndex;
        if (idx == null || idx < 0 || !trimmedOptions[idx]) {
            message.warning("Vui lòng chọn đáp án đúng");
            return;
        }

        setSaving(true);
        try {
            // Upload images
            let uploadedImageKeys = [];
            if (draftChildQuestion.imageFiles?.length > 0) {
                const fd = new FormData();
                draftChildQuestion.imageFiles.forEach((f) => fd.append("images", f));
                const uploadRes = await postFormData("/api/media/upload", fd, true);
                uploadedImageKeys = (uploadRes?.images || []).map((x) => x?.key).filter(Boolean);
            }

            const allImageKeys = [...(draftChildQuestion.imageKeys || []), ...uploadedImageKeys].filter(Boolean);

            const payload = {
                detail: draftChildQuestion.detail.trim(),
                result: LETTERS[idx],
                clarify: (draftChildQuestion.clarify || "").trim(),
                options: trimmedOptions.map((opt, optIdx) => ({
                    mark: LETTERS[optIdx],
                    detail: opt,
                })),
                images: allImageKeys.map((key) => ({ url: key })),
            };

            if (editingChildId) {
                await put(payload, `/api/disorder-exam/${examId}/question/${editingChildId}`, true);
                message.success("Cập nhật câu hỏi thành công");
            } else {
                await post(payload, `/api/disorder-exam/${examId}/group/${currentGroupId}/question`, true);
                message.success("Thêm câu hỏi thành công");
            }

            await loadExamDetail();
            handleCloseChildQuestionModal();
        } catch (err) {
            console.error("Save child question error:", err);
            message.error(err?.message || "Lưu câu hỏi thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChildQuestion = async (groupId, questionId) => {
        if (!window.confirm("Xóa câu hỏi này?")) return;

        try {
            await del(`/api/disorder-exam/${examId}/question/${questionId}`, true);
            message.success("Đã xóa câu hỏi");
            await loadExamDetail();
        } catch (err) {
            message.error("Xóa thất bại");
        }
    };

    // ==================== DRAFT FIELD HANDLERS ====================

    // Single question draft handlers
    const handleChangeSingleField = (field, value) => {
        setDraftSingle((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeSingleOption = (index, value) => {
        setDraftSingle((prev) => {
            const options = [...prev.options];
            options[index] = value;
            return { ...prev, options };
        });
    };

    const handleAddSingleOption = () => {
        setDraftSingle((prev) => {
            if (!prev || prev.options.length >= 5) return prev;
            return { ...prev, options: [...prev.options, ""] };
        });
    };

    const handleRemoveSingleOption = (index) => {
        setDraftSingle((prev) => {
            if (!prev || prev.options.length <= 2) return prev;
            const newOptions = prev.options.filter((_, idx) => idx !== index);
            let newCorrect = prev.correctOptionIndex;
            if (prev.correctOptionIndex === index) newCorrect = null;
            else if (prev.correctOptionIndex > index) newCorrect = prev.correctOptionIndex - 1;
            return { ...prev, options: newOptions, correctOptionIndex: newCorrect };
        });
    };

    const handleMarkSingleCorrect = (index) => {
        setDraftSingle((prev) => ({ ...prev, correctOptionIndex: index }));
    };

    const handleSingleAudioChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDraftSingle((prev) => ({
            ...prev,
            audioFile: file,
            audioPreview: URL.createObjectURL(file),
            removeAudio: false,
        }));
        e.target.value = "";
    };

    const handleClearSingleAudio = () => {
        setDraftSingle((prev) => ({
            ...prev,
            audioFile: null,
            audioPreview: "",
            audioUrl: "",
            audioKey: "",
            removeAudio: true,
        }));
    };

    const handleAddSingleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDraftSingle((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), URL.createObjectURL(file)],
        }));
        e.target.value = "";
    };

    const handleRemoveSingleImage = (source, idx) => {
        setDraftSingle((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                return {
                    ...prev,
                    imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
                    imageKeys: prev.imageKeys.filter((_, i) => i !== idx),
                };
            }
            return {
                ...prev,
                imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
                imagePreviews: prev.imagePreviews.filter((_, i) => i !== idx),
            };
        });
    };

    // Group draft handlers
    const handleChangeGroupField = (field, value) => {
        setDraftGroup((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddGroupImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDraftGroup((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), URL.createObjectURL(file)],
        }));
        e.target.value = "";
    };

    const handleRemoveGroupImage = (source, idx) => {
        setDraftGroup((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                return {
                    ...prev,
                    imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
                    imageKeys: prev.imageKeys.filter((_, i) => i !== idx),
                };
            }
            return {
                ...prev,
                imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
                imagePreviews: prev.imagePreviews.filter((_, i) => i !== idx),
            };
        });
    };

    const handleAddGroupAudio = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDraftGroup((prev) => ({
            ...prev,
            audioFiles: [...(prev.audioFiles || []), file],
            audioPreviews: [...(prev.audioPreviews || []), URL.createObjectURL(file)],
        }));
        e.target.value = "";
    };

    const handleRemoveGroupAudio = (source, idx) => {
        setDraftGroup((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                return {
                    ...prev,
                    audioUrls: prev.audioUrls.filter((_, i) => i !== idx),
                    audioKeys: prev.audioKeys.filter((_, i) => i !== idx),
                };
            }
            return {
                ...prev,
                audioFiles: prev.audioFiles.filter((_, i) => i !== idx),
                audioPreviews: prev.audioPreviews.filter((_, i) => i !== idx),
            };
        });
    };

    // Child question draft handlers
    const handleChangeChildField = (field, value) => {
        setDraftChildQuestion((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeChildOption = (index, value) => {
        setDraftChildQuestion((prev) => {
            const options = [...prev.options];
            options[index] = value;
            return { ...prev, options };
        });
    };

    const handleAddChildOption = () => {
        setDraftChildQuestion((prev) => {
            if (!prev || prev.options.length >= 5) return prev;
            return { ...prev, options: [...prev.options, ""] };
        });
    };

    const handleRemoveChildOption = (index) => {
        setDraftChildQuestion((prev) => {
            if (!prev || prev.options.length <= 2) return prev;
            const newOptions = prev.options.filter((_, idx) => idx !== index);
            let newCorrect = prev.correctOptionIndex;
            if (prev.correctOptionIndex === index) newCorrect = null;
            else if (prev.correctOptionIndex > index) newCorrect = prev.correctOptionIndex - 1;
            return { ...prev, options: newOptions, correctOptionIndex: newCorrect };
        });
    };

    const handleMarkChildCorrect = (index) => {
        setDraftChildQuestion((prev) => ({ ...prev, correctOptionIndex: index }));
    };

    const handleAddChildImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDraftChildQuestion((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), URL.createObjectURL(file)],
        }));
        e.target.value = "";
    };

    const handleRemoveChildImage = (source, idx) => {
        setDraftChildQuestion((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                return {
                    ...prev,
                    imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
                    imageKeys: prev.imageKeys.filter((_, i) => i !== idx),
                };
            }
            return {
                ...prev,
                imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
                imagePreviews: prev.imagePreviews.filter((_, i) => i !== idx),
            };
        });
    };

    // ==================== COMPUTED ====================

    const totalQuestions = useMemo(() => {
        let count = 0;
        items.forEach((item) => {
            if (item.type === "single") {
                count += 1;
            } else {
                count += (item.questions || []).length;
            }
        });
        return count;
    }, [items]);

    // ==================== ADD MENU ====================

    const addMenuItems = [
        {
            key: "single",
            label: (
                <span>
                    <UnorderedListOutlined style={{ marginRight: 8 }} />
                    Câu hỏi đơn
                </span>
            ),
            onClick: handleAddSingle,
        },
        {
            key: "group",
            label: (
                <span>
                    <GroupOutlined style={{ marginRight: 8 }} />
                    Nhóm câu hỏi
                </span>
            ),
            onClick: handleAddGroup,
        },
    ];

    // ==================== RENDER ====================

    const renderSingleCard = (item, index) => {
        const questionNumber = items
            .slice(0, index)
            .reduce((acc, it) => acc + (it.type === "single" ? 1 : (it.questions || []).length), 0) + 1;

        return (
            <div key={`single-${item.id}`} className="disorder-card disorder-card--single">
                <div className="disorder-card__header">
                    <div className="disorder-card__badge disorder-card__badge--single">Câu đơn</div>
                    <span className="disorder-card__number">Câu {questionNumber}</span>
                    <div className="disorder-card__actions">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditSingle(item)}
                        />
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteSingle(item.id)}
                        />
                    </div>
                </div>

                <div className="disorder-card__body">
                    <p className="disorder-card__detail">{item.detail || "Chưa có nội dung"}</p>

                    {item.audioUrl && (
                        <div className="disorder-card__media">
                            <audio src={item.audioUrl} controls />
                        </div>
                    )}

                    {item.imageUrls?.length > 0 && (
                        <div className="disorder-card__images">
                            {item.imageUrls.map((url, idx) => (
                                <img key={idx} src={url} alt={`img-${idx}`} />
                            ))}
                        </div>
                    )}

                    <div className="disorder-card__options">
                        {item.options?.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`disorder-card__option ${item.correctOptionIndex === idx ? "disorder-card__option--correct" : ""}`}
                            >
                                <span className="disorder-card__option-mark">{LETTERS[idx]}.</span>
                                <span>{opt}</span>
                                {item.correctOptionIndex === idx && <span className="disorder-card__check">✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderGroupCard = (item, index) => {
        const isExpanded = expandedGroupId === item.id;
        const startNumber = items
            .slice(0, index)
            .reduce((acc, it) => acc + (it.type === "single" ? 1 : (it.questions || []).length), 0) + 1;

        return (
            <div key={`group-${item.id}`} className="disorder-card disorder-card--group">
                <div
                    className="disorder-card__header disorder-card__header--clickable"
                    onClick={() => setExpandedGroupId(isExpanded ? null : item.id)}
                >
                    <div className="disorder-card__badge disorder-card__badge--group">Nhóm</div>
                    <span className="disorder-card__title">
                        {item.title || `Câu ${startNumber} - ${startNumber + (item.questions?.length || 1) - 1}`}
                    </span>
                    <span className="disorder-card__count">({item.questions?.length || 0} câu)</span>
                    <div className="disorder-card__actions" onClick={(e) => e.stopPropagation()}>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditGroup(item)}
                        />
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteGroup(item.id)}
                        />
                    </div>
                </div>

                {isExpanded && (
                    <div className="disorder-card__body">
                        {item.content && (
                            <div className="disorder-card__content">
                                <pre>{item.content}</pre>
                            </div>
                        )}

                        {item.audioUrls?.length > 0 && (
                            <div className="disorder-card__media">
                                {item.audioUrls.map((url, idx) => (
                                    <audio key={idx} src={url} controls />
                                ))}
                            </div>
                        )}

                        {item.imageUrls?.length > 0 && (
                            <div className="disorder-card__images">
                                {item.imageUrls.map((url, idx) => (
                                    <img key={idx} src={url} alt={`img-${idx}`} />
                                ))}
                            </div>
                        )}

                        <div className="disorder-card__children">
                            <div className="disorder-card__children-header">
                                <span>Câu hỏi trong nhóm</span>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddChildQuestion(item.id)}
                                >
                                    Thêm câu
                                </Button>
                            </div>

                            {item.questions?.map((q, qIdx) => (
                                <div key={q.id} className="disorder-card__child">
                                    <div className="disorder-card__child-header">
                                        <span>Câu {startNumber + qIdx}</span>
                                        <div className="disorder-card__child-actions">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditChildQuestion(item.id, q)}
                                            />
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteChildQuestion(item.id, q.id)}
                                            />
                                        </div>
                                    </div>
                                    <p className="disorder-card__child-detail">{q.detail}</p>
                                    <div className="disorder-card__child-options">
                                        {q.options?.map((opt, optIdx) => (
                                            <span
                                                key={optIdx}
                                                className={q.correctOptionIndex === optIdx ? "correct" : ""}
                                            >
                                                {LETTERS[optIdx]}. {opt}
                                                {q.correctOptionIndex === optIdx && " ✓"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="disorder-page disorder-page--loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="disorder-page">
            {/* HEADER */}
            <div className="disorder-page__header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="disorder-page__back"
                >
                    Quay lại
                </Button>

                <div className="disorder-page__title-section">
                    {editingTitle ? (
                        <div className="disorder-page__title-edit">
                            <Input
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onPressEnter={handleSaveTitle}
                                autoFocus
                            />
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveTitle}>
                                Lưu
                            </Button>
                            <Button onClick={handleCancelEditTitle}>Hủy</Button>
                        </div>
                    ) : (
                        <div className="disorder-page__title-display">
                            <h1>{examTitle}</h1>
                            <Button type="text" icon={<EditOutlined />} onClick={handleStartEditTitle} />
                        </div>
                    )}
                </div>

                <div className="disorder-page__stats">
                    <span className="disorder-page__stat">
                        <strong>{totalQuestions}</strong> câu hỏi
                    </span>
                    <span className="disorder-page__stat">
                        <strong>{examDuration}</strong> phút
                    </span>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="disorder-page__toolbar">
                <Dropdown menu={{ items: addMenuItems }} trigger={["click"]}>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm câu hỏi
                    </Button>
                </Dropdown>
            </div>

            {/* CONTENT */}
            <div className="disorder-page__content">
                {items.length === 0 ? (
                    <Empty
                        description="Chưa có câu hỏi nào"
                        className="disorder-page__empty"
                    >
                        <Dropdown menu={{ items: addMenuItems }} trigger={["click"]}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Thêm câu hỏi đầu tiên
                            </Button>
                        </Dropdown>
                    </Empty>
                ) : (
                    <div className="disorder-page__list">
                        {items.map((item, index) =>
                            item.type === "single"
                                ? renderSingleCard(item, index)
                                : renderGroupCard(item, index)
                        )}
                    </div>
                )}
            </div>

            {/* SINGLE QUESTION MODAL */}
            <CreateToeicQuestion
                open={showSingleModal}
                onClose={handleCloseSingleModal}
                draftQuestion={draftSingle}
                onChangeDraftField={handleChangeSingleField}
                onChangeOption={handleChangeSingleOption}
                onAddOption={handleAddSingleOption}
                onRemoveOption={handleRemoveSingleOption}
                onMarkCorrect={handleMarkSingleCorrect}
                onAudioChange={handleSingleAudioChange}
                onClearAudio={handleClearSingleAudio}
                onAddImage={handleAddSingleImage}
                onRemoveImage={handleRemoveSingleImage}
                onSave={handleSaveSingle}
                partNumber="Ngẫu nhiên"
                isEditing={editingSingleId != null}
                questionIndex={totalQuestions + 1}
                loading={saving}
            />

            {/* GROUP EDIT MODAL */}
            <BaseModal
                open={showGroupModal}
                onCancel={handleCloseGroupModal}
                title={editingGroupId ? "Chỉnh sửa nhóm câu hỏi" : "Tạo nhóm câu hỏi mới"}
                width={800}
            >
                {draftGroup && (
                    <div className="group-edit-modal">
                        <div className="group-edit-modal__field">
                            <label>Tiêu đề (tùy chọn)</label>
                            <Input
                                value={draftGroup.title}
                                onChange={(e) => handleChangeGroupField("title", e.target.value)}
                                placeholder="VD: Đọc đoạn văn và trả lời câu hỏi"
                            />
                        </div>

                        <div className="group-edit-modal__field">
                            <label>Nội dung (đoạn văn / hội thoại) *</label>
                            <Input.TextArea
                                value={draftGroup.content}
                                onChange={(e) => handleChangeGroupField("content", e.target.value)}
                                rows={6}
                                placeholder="Nhập nội dung đoạn văn hoặc hội thoại"
                            />
                        </div>

                        <div className="group-edit-modal__field">
                            <label>Hình ảnh</label>
                            <div className="group-edit-modal__media">
                                <label className="group-edit-modal__upload">
                                    <span>+ Thêm hình</span>
                                    <input type="file" accept="image/*" onChange={handleAddGroupImage} />
                                </label>
                                <div className="group-edit-modal__preview-list">
                                    {draftGroup.imageUrls?.map((url, idx) => (
                                        <div key={`server-${idx}`} className="group-edit-modal__preview-item">
                                            <img src={url} alt="" />
                                            <button onClick={() => handleRemoveGroupImage("server", idx)}>✕</button>
                                        </div>
                                    ))}
                                    {draftGroup.imagePreviews?.map((url, idx) => (
                                        <div key={`local-${idx}`} className="group-edit-modal__preview-item">
                                            <img src={url} alt="" />
                                            <button onClick={() => handleRemoveGroupImage("local", idx)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="group-edit-modal__field">
                            <label>Âm thanh</label>
                            <div className="group-edit-modal__media">
                                <label className="group-edit-modal__upload">
                                    <span>+ Thêm audio</span>
                                    <input type="file" accept="audio/*" onChange={handleAddGroupAudio} />
                                </label>
                                <div className="group-edit-modal__audio-list">
                                    {draftGroup.audioUrls?.map((url, idx) => (
                                        <div key={`server-${idx}`} className="group-edit-modal__audio-item">
                                            <audio src={url} controls />
                                            <button onClick={() => handleRemoveGroupAudio("server", idx)}>Xóa</button>
                                        </div>
                                    ))}
                                    {draftGroup.audioPreviews?.map((url, idx) => (
                                        <div key={`local-${idx}`} className="group-edit-modal__audio-item">
                                            <audio src={url} controls />
                                            <button onClick={() => handleRemoveGroupAudio("local", idx)}>Xóa</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="group-edit-modal__footer">
                            <Button onClick={handleCloseGroupModal}>Hủy</Button>
                            <Button type="primary" onClick={handleSaveGroup} loading={saving}>
                                {editingGroupId ? "Lưu thay đổi" : "Tạo nhóm"}
                            </Button>
                        </div>
                    </div>
                )}
            </BaseModal>

            {/* CHILD QUESTION MODAL */}
            <CreateGroupToeicQuestion
                open={showChildQuestionModal}
                onClose={handleCloseChildQuestionModal}
                draftQuestion={draftChildQuestion}
                onChangeDraftField={handleChangeChildField}
                onChangeOption={handleChangeChildOption}
                onAddOption={handleAddChildOption}
                onRemoveOption={handleRemoveChildOption}
                onMarkCorrect={handleMarkChildCorrect}
                onAddImage={handleAddChildImage}
                onRemoveImage={handleRemoveChildImage}
                onSave={handleSaveChildQuestion}
                partNumber="Ngẫu nhiên"
                isEditing={editingChildId != null}
                questionIndex={
                    currentGroupId
                        ? (items.find((i) => i.id === currentGroupId)?.questions?.length || 0) + 1
                        : 1
                }
                loading={saving}
                isGroupQuestion={true}
            />
        </div>
    );
}