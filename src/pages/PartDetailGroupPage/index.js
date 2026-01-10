import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./PartDetailGroupPage.scss";
import crown from "../../assets/images/crown.png";
import { postFormData, post, put, get, del } from "../../utils/request";
import CreateToeicQuestion from "../../components/CreateToeicQuestion";

const LETTERS = ["A", "B", "C", "D", "E"];

// Helper: lấy số câu hỏi mỗi nhóm theo part
// const getQuestionsPerGroup = (part) => {
//     switch (String(part)) {
//         case "3":
//         case "Part 3":
//             return 3;  // Part 3: 3 câu/nhóm
//         case "4":
//         case "Part 4":
//             return 3;  // Part 4: 3 câu/nhóm
//         case "7":
//         case "Part 7":
//             return 5;  // Part 7: 5 câu/nhóm (hoặc có thể là 2-5 tuỳ loại)
//         default:
//             return 3;
//     }
// };

// Helper: lấy số bắt đầu của part
const getPartStartIndex = (part) => {
    switch (String(part)) {
        case "1":
        case "Part 1":
            return 1;
        case "2":
        case "Part 2":
            return 7;
        case "3":
        case "Part 3":
            return 32;
        case "4":
        case "Part 4":
            return 71;
        case "5":
        case "Part 5":
            return 101;
        case "6":
        case "Part 6":
            return 131;
        case "7":
        case "Part 7":
            return 147;
        default:
            return 1;
    }
};

// Helper: tạo title và questionRange dựa vào thứ tự group
// const generateGroupMetadata = (groupOrder, part, questionsCount) => {
//      ✅ Nếu không có câu hỏi
//     if (!questionsCount || questionsCount === 0) {
//         let contentType = "content";
//         switch (String(part)) {
//             case "3":
//             case "Part 3":
//                 contentType = "conversation";
//                 break;
//             case "4":
//             case "Part 4":
//                 contentType = "talk";
//                 break;
//             case "7":
//             case "Part 7":
//                 contentType = "passage";
//                 break;
//         }

//         return {
//             title: `No questions - ${contentType}`,
//             questionRange: "",
//             startIndex: null,
//             endIndex: null,
//         };
//     }

//     const startIndex = getPartStartIndex(part);

//     // ✅ Tính vị trí bắt đầu dựa vào tất cả groups trước đó
//     // groupOrder là thứ tự của group này trong danh sách
//     const groupStartQuestion = startIndex + (groupOrder * questionsCount);
//     const groupEndQuestion = groupStartQuestion + questionsCount - 1;

//     let contentType = "content";
//     switch (String(part)) {
//         case "3":
//         case "Part 3":
//             contentType = "conversation";
//             break;
//         case "4":
//         case "Part 4":
//             contentType = "talk";
//             break;
//         case "7":
//         case "Part 7":
//             contentType = "passage";
//             break;
//     }

//     return {
//         title: `Use the given ${contentType} to answer the questions ${groupStartQuestion} to ${groupEndQuestion}`,
//         questionRange: `${groupStartQuestion}-${groupEndQuestion}`,
//         startIndex: groupStartQuestion,
//         endIndex: groupEndQuestion,
//     };
// };

// Map GroupQuestionResponseDTO từ backend sang local model
function mapGroupQuestionResponseToLocal(group) {
    if (!group) return null;

    // Backend trả về presigned URLs
    const imageUrls = Array.isArray(group.images) ? group.images.filter(Boolean) : [];
    const audioUrls = Array.isArray(group.audios) ? group.audios.filter(Boolean) : [];

    return {
        id: group.id ?? null,
        part: group.part ?? "",
        title: group.title || "",
        content: group.content || "",
        questionRange: group.questionRange || "",
        examId: group.examId ?? null,

        imageUrls: imageUrls,  // ✅ Presigned URLs để hiển thị
        audioUrls: audioUrls,  // ✅ Presigned URLs để hiển thị

        imageKeys: [],  // ✅ Keys sẽ được giữ riêng trong local state
        audioKeys: [],  // ✅ Keys sẽ được giữ riêng trong local state

        imageFiles: [],
        imagePreviews: [],
        audioFiles: [],
        audioPreviews: [],

        questions: Array.isArray(group.questions)
            ? group.questions.map(mapToeicQuestionResponseToLocal)
            : [],
    };
}
// Map ToeicQuestionResponse sang local model
function mapToeicQuestionResponseToLocal(q) {
    if (!q) return null;

    const correctIdx = LETTERS.indexOf(q.result);
    const imageUrls = Array.isArray(q.images) ? q.images.filter(Boolean) : [];

    return {
        id: q.id ?? null,
        indexNumber: q.indexNumber ?? null,
        part: q.part ?? "",
        detail: q.detail || "",
        result: q.result || "",

        imageUrls,
        imageKeys: [],  // ✅ Keys sẽ được lưu riêng

        imageFiles: [],
        imagePreviews: [],

        options: (q.options || []).map((o) => o.detail || ""),
        correctOptionIndex: correctIdx >= 0 ? correctIdx : null,

        conversation: null,
        clarify: q.clarify || "",
    };
}

const createEmptyGroup = (part, examId) => ({
    id: null,
    part: String(part),
    title: "",
    content: "",
    questionRange: "",
    examId: Number(examId),

    imageUrls: [],
    audioUrls: [],
    imageKeys: [],
    audioKeys: [],

    imageFiles: [],
    imagePreviews: [],
    audioFiles: [],
    audioPreviews: [],

    questions: [],
});

const createEmptyQuestion = (part) => ({
    id: null,
    indexNumber: null,
    part: String(part),
    detail: "",
    result: "",

    imageUrls: [],
    imageKeys: [],

    imageFiles: [],
    imagePreviews: [],

    options: ["", ""],
    correctOptionIndex: null,

    conversation: null,
    clarify: "",
});

const buildMediaPayload = ({ existingKeys = [], uploadedKeys = [] }) => {
    const all = [...(existingKeys || []), ...(uploadedKeys || [])].filter(Boolean);
    const uniq = Array.from(new Set(all));
    return uniq.map((key) => ({ url: key }));
};

// Helper: extract start index từ questionRange "32-35" -> 32
const extractStartIndex = (range) => {
    try {
        return parseInt(range.split("-")[0].trim());
    } catch (e) {
        return 1;
    }
};

export default function PartDetailGroupPage() {
    const location = useLocation();
    const routeState = location.state || {};
    const { examId, partNumber } = useParams();
    const navigate = useNavigate();

    const [examTitle, setExamTitle] = useState(routeState.examName || "");
    const [groups, setGroups] = useState([]);

    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [draftGroup, setDraftGroup] = useState(null);
    const [creatingNewGroup, setCreatingNewGroup] = useState(false);

    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [draftQuestion, setDraftQuestion] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [currentGroupId, setCurrentGroupId] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [draggingGroupId, setDraggingGroupId] = useState(null);

    // Load groups từ route state hoặc API, sau đó sort
    useEffect(() => {
        let cancelled = false;

        const loadGroups = async () => {
            try {
                const fromState = routeState.partGroups;
                if (Array.isArray(fromState) && fromState.length > 0) {
                    const mapped = fromState.map(mapGroupQuestionResponseToLocal);
                    const sorted = sortGroups(mapped);
                    if (!cancelled) setGroups(sorted);
                    return;
                }

                const examData = await get(`/api/exam/detail/${examId}`, true);
                const list = Array.isArray(examData?.groupQuestions) ? examData.groupQuestions : [];
                const partGroups = list.filter((g) => String(g.part) === String(partNumber));
                const mapped = partGroups.map(mapGroupQuestionResponseToLocal);
                const sorted = sortGroups(mapped);

                if (!cancelled) setGroups(sorted);

                if (!cancelled && sorted.length === 0) {
                    setCreatingNewGroup(true);
                    setDraftGroup(createEmptyGroup(String(partNumber), examId));
                }
            } catch (err) {
                console.error("Load groups error", err);
            }
        };

        loadGroups();

        return () => {
            cancelled = true;
        };
    }, [examId, partNumber, routeState.partGroups]);

    // Sort groups theo questionRange (ví dụ: "32-34" < "35-37")
    // Sort groups theo questionRange, nhưng đưa groups rỗng xuống cuối
    const sortGroups = (groupsList) => {
        return [...groupsList].sort((a, b) => {
            // Groups rỗng (không có questionRange) luôn ở cuối
            if (!a.questionRange && !b.questionRange) return 0;
            if (!a.questionRange) return 1;  // a xuống cuối
            if (!b.questionRange) return -1; // b xuống cuối

            // Groups có questionRange thì sort theo số
            const startA = extractStartIndex(a.questionRange);
            const startB = extractStartIndex(b.questionRange);
            return startA - startB;
        });
    };

    // Recalculate tất cả metadata cho groups
    const recalculateAllGroups = (groupsList) => {
        let currentQuestionIndex = getPartStartIndex(partNumber);

        return groupsList.map((group) => {
            const questionsCount = group.questions.length;

            // ✅ Nếu không có câu hỏi
            if (questionsCount === 0) {
                let contentType = "content";
                switch (String(partNumber)) {
                    case "3":
                    case "Part 3":
                        contentType = "conversation";
                        break;
                    case "4":
                    case "Part 4":
                        contentType = "talk";
                        break;
                    case "7":
                    case "Part 7":
                        contentType = "passage";
                        break;
                }

                return {
                    ...group,
                    title: `No questions - ${contentType}`,
                    questionRange: "",
                    questions: [],
                };
            }

            // ✅ Có câu hỏi - tính toán bình thường
            const groupStartQuestion = currentQuestionIndex;
            const groupEndQuestion = currentQuestionIndex + questionsCount - 1;

            let contentType = "content";
            switch (String(partNumber)) {
                case "3":
                case "Part 3":
                    contentType = "conversation";
                    break;
                case "4":
                case "Part 4":
                    contentType = "talk";
                    break;
                case "7":
                case "Part 7":
                    contentType = "passage";
                    break;
            }

            const title = `Use the given ${contentType} to answer the questions ${groupStartQuestion} to ${groupEndQuestion}`;
            const questionRange = `${groupStartQuestion}-${groupEndQuestion}`;

            // Cập nhật indexNumber cho các câu hỏi con
            const updatedQuestions = group.questions.map((q, qIdx) => ({
                ...q,
                indexNumber: groupStartQuestion + qIdx,
            }));

            // Di chuyển currentQuestionIndex cho group tiếp theo
            currentQuestionIndex += questionsCount;

            return {
                ...group,
                title,
                questionRange,
                questions: updatedQuestions,
            };
        });
    };

    const handleBack = () => navigate(-1);

    const handleClickGroupCard = (id) => {
        setExpandedGroupId((prev) => (prev === id ? null : id));
    };

    // === GROUP HANDLERS ===
    const handleStartCreateGroup = () => {
        setDraftGroup(createEmptyGroup(String(partNumber), examId));
        setCreatingNewGroup(true);
        setEditingGroupId(null);
        setExpandedGroupId(null);
    };

    const handleEditGroup = (group) => {
        setDraftGroup({
            ...group,
            imageFiles: [],
            imagePreviews: [],
            audioFiles: [],
            audioPreviews: [],
            // ✅ GIỮ NGUYÊN KEYS
            imageKeys: group.imageKeys || [],
            audioKeys: group.audioKeys || [],
        });
        setEditingGroupId(group.id);
        setCreatingNewGroup(false);
        setExpandedGroupId(group.id);
    };

    const handleCancelGroupEdit = () => {
        setCreatingNewGroup(false);
        setEditingGroupId(null);
        setDraftGroup(null);
        setExpandedGroupId(null);
    };

    const handleChangeGroupField = (field, value) => {
        setDraftGroup((prev) => ({ ...prev, [field]: value }));
    };

    // Group media handlers
    const handleAddGroupImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setDraftGroup((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), previewUrl],
        }));
    };

    const handleRemoveGroupImage = (source, idx) => {
        setDraftGroup((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                const newUrls = (prev.imageUrls || []).filter((_, i) => i !== idx);
                const newKeys = (prev.imageKeys || []).filter((_, i) => i !== idx);
                return { ...prev, imageUrls: newUrls, imageKeys: newKeys };
            }
            const newFiles = (prev.imageFiles || []).filter((_, i) => i !== idx);
            const newPreviews = (prev.imagePreviews || []).filter((_, i) => i !== idx);
            return { ...prev, imageFiles: newFiles, imagePreviews: newPreviews };
        });
    };

    const handleAddGroupAudio = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setDraftGroup((prev) => ({
            ...prev,
            audioFiles: [...(prev.audioFiles || []), file],
            audioPreviews: [...(prev.audioPreviews || []), previewUrl],
        }));
    };

    const handleRemoveGroupAudio = (source, idx) => {
        setDraftGroup((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                const newUrls = (prev.audioUrls || []).filter((_, i) => i !== idx);
                const newKeys = (prev.audioKeys || []).filter((_, i) => i !== idx);
                return { ...prev, audioUrls: newUrls, audioKeys: newKeys };
            }
            const newFiles = (prev.audioFiles || []).filter((_, i) => i !== idx);
            const newPreviews = (prev.audioPreviews || []).filter((_, i) => i !== idx);
            return { ...prev, audioFiles: newFiles, audioPreviews: newPreviews };
        });
    };

    const handleSaveGroup = async () => {
        if (!draftGroup?.content?.trim()) {
            alert("Vui lòng nhập nội dung nhóm câu hỏi");
            return;
        }

        setUploading(true);

        try {
            // Upload media
            let uploadedImageKeys = [];
            let uploadedAudioKeys = [];

            const fd = new FormData();

            if (draftGroup.imageFiles && draftGroup.imageFiles.length > 0) {
                draftGroup.imageFiles.forEach((f) => fd.append("images", f));
            }
            if (draftGroup.audioFiles && draftGroup.audioFiles.length > 0) {
                draftGroup.audioFiles.forEach((f) => fd.append("audios", f));
            }

            if (
                (draftGroup.imageFiles && draftGroup.imageFiles.length > 0) ||
                (draftGroup.audioFiles && draftGroup.audioFiles.length > 0)
            ) {
                const uploadRes = await postFormData("/api/media/upload", fd, true);

                const imgList = Array.isArray(uploadRes?.images) ? uploadRes.images : [];
                uploadedImageKeys = imgList.map((x) => x?.key).filter(Boolean);

                const audioList = Array.isArray(uploadRes?.audios) ? uploadRes.audios : [];
                uploadedAudioKeys = audioList.map((x) => x?.key).filter(Boolean);
            }

            // Build payload - GỬI KEYS
            const existingImageKeys = Array.isArray(draftGroup.imageKeys) ? draftGroup.imageKeys : [];
            const existingAudioKeys = Array.isArray(draftGroup.audioKeys) ? draftGroup.audioKeys : [];

            const imagesPayload = buildMediaPayload({
                existingKeys: existingImageKeys,
                uploadedKeys: uploadedImageKeys,
            });

            const audiosPayload = buildMediaPayload({
                existingKeys: existingAudioKeys,
                uploadedKeys: uploadedAudioKeys,
            });

            const allImageKeys = [...existingImageKeys, ...uploadedImageKeys].filter(Boolean);
            const allAudioKeys = [...existingAudioKeys, ...uploadedAudioKeys].filter(Boolean);

            let updatedGroups;

            if (editingGroupId != null) {
                // Update group - giữ nguyên vị trí và questions
                const currentGroup = groups.find((g) => g.id === editingGroupId);

                const tempGroups = groups.map((g) =>
                    g.id === editingGroupId
                        ? {
                            ...g,
                            content: draftGroup.content.trim(),
                            imageKeys: allImageKeys,
                            audioKeys: allAudioKeys,
                            questions: currentGroup.questions,
                        }
                        : g
                );

                updatedGroups = recalculateAllGroups(tempGroups);
                const recalculatedGroup = updatedGroups.find((g) => g.id === editingGroupId);

                const basePayload = {
                    part: String(partNumber),
                    title: recalculatedGroup.title,
                    questionRange: recalculatedGroup.questionRange,
                    content: draftGroup.content.trim(),
                    examId: Number(examId),
                    images: imagesPayload,
                    audios: audiosPayload,
                    questions: recalculatedGroup.questions.map((q) => ({
                        indexNumber: q.indexNumber,
                        detail: q.detail,
                        result: q.result,
                        clarify: q.clarify,
                        audios: [],
                        conversation: null,
                        options: q.options.map((opt, idx) => ({
                            mark: LETTERS[idx],
                            detail: opt,
                        })),
                        images: q.imageKeys.map((key) => ({ url: key })),
                    })),
                };

                const response = await put(basePayload, `/api/group-question/${editingGroupId}`, true);

                const updatedLocal = mapGroupQuestionResponseToLocal(response);
                updatedLocal.imageKeys = allImageKeys;
                updatedLocal.audioKeys = allAudioKeys;
                updatedLocal.imageFiles = [];
                updatedLocal.imagePreviews = [];
                updatedLocal.audioFiles = [];
                updatedLocal.audioPreviews = [];
                updatedLocal.questions = recalculatedGroup.questions;

                setGroups((prev) => {
                    const next = prev.map((g) => (g.id === editingGroupId ? updatedLocal : g));
                    return sortGroups(next);
                });

                // Update global cache with updated questions from this group (if provided by the response)
                if (response?.questions && Array.isArray(response.questions)) {
                    if (window.__toeicExamData?.questions) {
                        const existing = window.__toeicExamData.questions || [];
                        const updatedQs = response.questions;
                        const merged = existing.filter((q) => !updatedQs.some((uq) => uq.id === q.id)).concat(updatedQs);
                        window.__toeicExamData = { ...window.__toeicExamData, questions: merged };
                    } else {
                        window.__toeicExamData = { ...(window.__toeicExamData || {}), questions: response.questions };
                    }
                }
            } else {
                // ✅ CREATE NEW GROUP - Reload sau khi tạo
                // Tính toán metadata TRƯỚC khi gửi lên backend
                const tempGroups = [...groups.filter(g => g.questionRange), draftGroup]; // Lọc bỏ groups rỗng cũ
                const recalculated = recalculateAllGroups(tempGroups);
                const newGroup = recalculated[recalculated.length - 1];

                const basePayload = {
                    part: String(partNumber),
                    title: newGroup.title,
                    questionRange: newGroup.questionRange,
                    content: draftGroup.content.trim(),
                    examId: Number(examId),
                    images: imagesPayload,
                    audios: audiosPayload,
                    questions: [],
                };

                const saved = await post(basePayload, "/api/group-question", true);

                if (!saved || !saved.id) {
                    throw new Error("Create group failed");
                }

                // ✅ RELOAD để lấy URLs
                const reloadedGroup = await get(`/api/group-question/${saved.id}`, true);

                const createdLocal = mapGroupQuestionResponseToLocal(reloadedGroup);
                createdLocal.imageKeys = allImageKeys;
                createdLocal.audioKeys = allAudioKeys;
                createdLocal.imageFiles = [];
                createdLocal.imagePreviews = [];
                createdLocal.audioFiles = [];
                createdLocal.audioPreviews = [];

                // ✅ Đảm bảo title và questionRange từ backend
                createdLocal.title = reloadedGroup.title || newGroup.title;
                createdLocal.questionRange = reloadedGroup.questionRange || newGroup.questionRange;

                setGroups((prev) => {
                    // Loại bỏ groups rỗng cũ, thêm group mới
                    const filtered = prev.filter(g => g.questionRange);
                    const next = [...filtered, createdLocal];
                    return sortGroups(next);
                });
            }

            setCreatingNewGroup(false);
            setEditingGroupId(null);
            setDraftGroup(null);
        } catch (err) {
            console.error("Save group error", err);
            alert(err?.message || "Lưu nhóm câu hỏi thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Xoá nhóm câu hỏi này?")) return;

        setUploading(true);
        try {
            await del(`/api/group-question/${groupId}`, true);

            const nextGroups = groups.filter((g) => g.id !== groupId);
            const recalculated = recalculateAllGroups(nextGroups);

            // Update tất cả groups còn lại
            for (const group of recalculated) {
                if (group.id) {
                    const payload = {
                        part: String(partNumber),
                        title: group.title,
                        questionRange: group.questionRange,
                        content: group.content,
                        examId: Number(examId),
                        images: group.imageKeys.map((key) => ({ url: key })),  // ✅ Gửi keys
                        audios: group.audioKeys.map((key) => ({ url: key })),  // ✅ Gửi keys
                        questions: group.questions.map((q) => ({
                            indexNumber: q.indexNumber,
                            detail: q.detail,
                            result: q.result,
                            clarify: q.clarify,
                            audios: [],
                            conversation: null,
                            options: q.options.map((opt, idx) => ({
                                mark: LETTERS[idx],
                                detail: opt,
                            })),
                            images: q.imageKeys.map((key) => ({ url: key })),
                        })),
                    };

                    await put(payload, `/api/group-question/${group.id}`, true);
                }
            }

            setGroups(recalculated);

            // Sync global cache: remove questions for this part that no longer exist and update indexNumbers
            if (window.__toeicExamData?.questions) {
                const remainingIds = new Set(
                    recalculated.flatMap((g) => (g.questions || []).map((q) => q.id)).filter(Boolean)
                );

                // keep questions that are not from this part OR that are still present
                let newQuestions = (window.__toeicExamData.questions || []).filter(
                    (q) => String(q.part) !== String(partNumber) || remainingIds.has(q.id)
                );

                // update indexNumber for remaining questions in this part
                newQuestions = newQuestions.map((qq) => {
                    if (String(qq.part) !== String(partNumber)) return qq;
                    if (remainingIds.has(qq.id)) {
                        for (const g of recalculated) {
                            const found = (g.questions || []).find((x) => x.id === qq.id);
                            if (found) return { ...qq, indexNumber: found.indexNumber };
                        }
                    }
                    return qq;
                });

                window.__toeicExamData = { ...window.__toeicExamData, questions: newQuestions };
            }

            if (expandedGroupId === groupId) setExpandedGroupId(null);
            if (editingGroupId === groupId) {
                setEditingGroupId(null);
                setDraftGroup(null);
            }
        } catch (err) {
            console.error("Delete group error", err);
            alert(err?.message || "Xoá nhóm thất bại");
        } finally {
            setUploading(false);
        }
    };

    // === DRAG & DROP GROUPS ===
    const handleDragStartGroup = (groupId) => {
        setDraggingGroupId(groupId);
    };

    const handleDragOverGroup = (e) => {
        e.preventDefault();
    };

    const handleDropOnGroup = async (targetId) => {
        if (!draggingGroupId || draggingGroupId === targetId) {
            setDraggingGroupId(null);
            return;
        }

        const from = groups.findIndex((g) => g.id === draggingGroupId);
        const to = groups.findIndex((g) => g.id === targetId);

        if (from === -1 || to === -1) {
            setDraggingGroupId(null);
            return;
        }

        const reordered = [...groups];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        const recalculated = recalculateAllGroups(reordered);

        setGroups(recalculated);
        setDraggingGroupId(null);

        // Update tất cả groups
        try {
            for (const group of recalculated) {
                if (group.id) {
                    const payload = {
                        part: String(partNumber),
                        title: group.title,
                        questionRange: group.questionRange,
                        content: group.content,
                        examId: Number(examId),
                        images: group.imageKeys.map((key) => ({ url: key })),
                        audios: group.audioKeys.map((key) => ({ url: key })),
                        questions: group.questions.map((q) => ({
                            indexNumber: q.indexNumber,
                            detail: q.detail,
                            result: q.result,
                            clarify: q.clarify,
                            audios: [],
                            conversation: null,
                            options: q.options.map((opt, idx) => ({
                                mark: LETTERS[idx],
                                detail: opt,
                            })),
                            images: q.imageKeys.map((key) => ({ url: key })),
                        })),
                    };

                    await put(payload, `/api/group-question/${group.id}`, true);
                }
            }
        } catch (err) {
            console.error("Reorder groups error", err);
        }

        // Update global question indexNumbers in cache to reflect new ordering
        if (window.__toeicExamData?.questions) {
            const idxMap = new Map();
            for (const g of recalculated) {
                for (const q of g.questions || []) {
                    if (q?.id != null) idxMap.set(q.id, q.indexNumber);
                }
            }
            window.__toeicExamData = {
                ...window.__toeicExamData,
                questions: (window.__toeicExamData.questions || []).map((qq) =>
                    idxMap.has(qq.id) ? { ...qq, indexNumber: idxMap.get(qq.id) } : qq
                ),
            };
        }
    };

    const handleDragEndGroup = () => {
        setDraggingGroupId(null);
    };

    // === QUESTION HANDLERS ===
    const handleStartCreateQuestion = (groupId) => {
        setCurrentGroupId(groupId);
        setDraftQuestion(createEmptyQuestion(String(partNumber)));
        setEditingQuestionId(null);
        setShowQuestionModal(true);
    };

    const handleEditQuestion = (groupId, question) => {
        setCurrentGroupId(groupId);
        setDraftQuestion({
            ...question,
            imageFiles: [],
            imagePreviews: [],
        });
        setEditingQuestionId(question.id);
        setShowQuestionModal(true);
    };

    const handleCloseQuestionModal = () => {
        setShowQuestionModal(false);
        setEditingQuestionId(null);
        setDraftQuestion(null);
        setCurrentGroupId(null);
    };

    const handleChangeDraftField = (field, value) => {
        setDraftQuestion((prev) => ({ ...prev, [field]: value }));
    };

    const handleChangeOption = (index, value) => {
        setDraftQuestion((prev) => {
            const options = [...prev.options];
            options[index] = value;
            return { ...prev, options };
        });
    };

    const handleAddOption = () => {
        setDraftQuestion((prev) => {
            if (!prev || prev.options.length >= 5) return prev;
            return { ...prev, options: [...prev.options, ""] };
        });
    };

    const handleRemoveOption = (index) => {
        setDraftQuestion((prev) => {
            if (!prev || prev.options.length <= 2) return prev;

            const newOptions = prev.options.filter((_, idx) => idx !== index);
            let newCorrect = prev.correctOptionIndex;

            if (prev.correctOptionIndex === index) newCorrect = null;
            else if (prev.correctOptionIndex != null && prev.correctOptionIndex > index) {
                newCorrect = prev.correctOptionIndex - 1;
            }

            return { ...prev, options: newOptions, correctOptionIndex: newCorrect };
        });
    };

    const handleMarkCorrect = (index) => {
        setDraftQuestion((prev) => ({ ...prev, correctOptionIndex: index }));
    };

    const handleAddImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setDraftQuestion((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), file],
            imagePreviews: [...(prev.imagePreviews || []), previewUrl],
        }));
    };

    const handleRemoveImage = (source, idx) => {
        setDraftQuestion((prev) => {
            if (!prev) return prev;
            if (source === "server") {
                const newUrls = (prev.imageUrls || []).filter((_, i) => i !== idx);
                const newKeys = (prev.imageKeys || []).filter((_, i) => i !== idx);
                return { ...prev, imageUrls: newUrls, imageKeys: newKeys };
            }
            const newFiles = (prev.imageFiles || []).filter((_, i) => i !== idx);
            const newPreviews = (prev.imagePreviews || []).filter((_, i) => i !== idx);
            return { ...prev, imageFiles: newFiles, imagePreviews: newPreviews };
        });
    };

    const handleSaveQuestion = async () => {
        if (!draftQuestion?.detail?.trim()) {
            alert("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        const trimmedOptions = (draftQuestion.options || []).map((o) => (o || "").trim());
        const filled = trimmedOptions.filter(Boolean);
        if (filled.length < 2) {
            alert("Vui lòng nhập ít nhất 2 đáp án");
            return;
        }

        const idx = draftQuestion.correctOptionIndex;
        if (idx == null || idx < 0 || !trimmedOptions[idx]) {
            alert("Vui lòng chọn đáp án đúng");
            return;
        }

        setUploading(true);

        try {
            // Upload media
            let uploadedImageKeys = [];

            const fd = new FormData();

            if (draftQuestion.imageFiles && draftQuestion.imageFiles.length > 0) {
                draftQuestion.imageFiles.forEach((f) => fd.append("images", f));
            }

            if (draftQuestion.imageFiles && draftQuestion.imageFiles.length > 0) {
                const uploadRes = await postFormData("/api/media/upload", fd, true);

                const imgList = Array.isArray(uploadRes?.images) ? uploadRes.images : [];
                uploadedImageKeys = imgList.map((x) => x?.key).filter(Boolean);
            }

            // Build payload
            const existingKeys = Array.isArray(draftQuestion.imageKeys) ? draftQuestion.imageKeys : [];
            const imagesPayload = buildMediaPayload({
                existingKeys,
                uploadedKeys: uploadedImageKeys,
            });

            const basePayload = {
                part: String(partNumber),
                detail: draftQuestion.detail.trim(),
                conversation: null,
                clarify: (draftQuestion.clarify || "").trim(),
                examId: Number(examId),
                random: false,
                options: trimmedOptions.map((opt, optIdx) => ({
                    mark: LETTERS[optIdx],
                    detail: opt,
                })),
                result: LETTERS[idx],
                audios: [], // ✅ Group question không có audio
                images: imagesPayload,
            };

            if (editingQuestionId != null) {
                // Update question - recalculate group
                await put(basePayload, `/api/toeic-question/${editingQuestionId}`, true);

                const updatedLocal = {
                    ...draftQuestion,
                    detail: basePayload.detail,
                    clarify: basePayload.clarify,
                    result: basePayload.result,
                    options: trimmedOptions,
                    correctOptionIndex: idx,
                    imageKeys: [...existingKeys, ...uploadedImageKeys].filter(Boolean),
                    imageFiles: [],
                    imagePreviews: [],
                };

                // ✅ Recalculate groups
                const updatedGroups = groups.map((g) =>
                    g.id === currentGroupId
                        ? {
                            ...g,
                            questions: g.questions.map((q) =>
                                q.id === editingQuestionId ? updatedLocal : q
                            ),
                        }
                        : g
                );
                const recalculated = recalculateAllGroups(updatedGroups);

                setGroups(recalculated);

                // ✅ UPDATE GROUP với title và questionRange mới
                const updatedGroup = recalculated.find(g => g.id === currentGroupId);
                if (updatedGroup) {
                    const groupPayload = {
                        part: String(partNumber),
                        title: updatedGroup.title,
                        questionRange: updatedGroup.questionRange,
                        content: updatedGroup.content,
                        examId: Number(examId),
                        images: updatedGroup.imageKeys.map((key) => ({ url: key })),
                        audios: updatedGroup.audioKeys.map((key) => ({ url: key })),
                        questions: updatedGroup.questions.map((q) => ({
                            indexNumber: q.indexNumber,
                            detail: q.detail,
                            result: q.result,
                            clarify: q.clarify,
                            audios: [], // ✅ Group question không có audio
                            conversation: null,
                            options: q.options.map((opt, idx) => ({
                                mark: LETTERS[idx],
                                detail: opt,
                            })),
                            images: q.imageKeys.map((key) => ({ url: key })),
                        })),
                    };

                    await put(groupPayload, `/api/group-question/${currentGroupId}`, true);
                }

                // Update global cache
                if (window.__toeicExamData?.questions) {
                    window.__toeicExamData = {
                        ...window.__toeicExamData,
                        questions: (window.__toeicExamData.questions || []).map((qq) =>
                            qq?.id === editingQuestionId
                                ? {
                                    ...qq,
                                    detail: basePayload.detail,
                                    result: basePayload.result,
                                    clarify: basePayload.clarify,
                                    options: basePayload.options
                                        ? basePayload.options.map((o) => ({ mark: o.mark, detail: o.detail }))
                                        : qq.options,
                                    images: (basePayload.images || []).map((i) => i.url),
                                }
                                : qq
                        ),
                    };
                }
            } else {
                // Create new question
                const saved = await post(basePayload, "/api/toeic-question", true);

                if (!saved) {
                    throw new Error("Create question failed");
                }

                const createdLocal = mapToeicQuestionResponseToLocal(saved);
                const updateGroupIdForQuestion = {
                    "groupId": currentGroupId
                };

                await put(updateGroupIdForQuestion, `/api/group-question/question/${createdLocal.id}`);

                createdLocal.imageKeys = [...existingKeys, ...uploadedImageKeys].filter(Boolean);

                // ✅ Recalculate groups
                const updatedGroups = groups.map((g) =>
                    g.id === currentGroupId
                        ? { ...g, questions: [...g.questions, createdLocal] }
                        : g
                );
                const recalculated = recalculateAllGroups(updatedGroups);

                setGroups(recalculated);

                // ✅ UPDATE GROUP với title và questionRange mới
                const updatedGroup = recalculated.find(g => g.id === currentGroupId);
                if (updatedGroup) {
                    const groupPayload = {
                        part: String(partNumber),
                        title: updatedGroup.title,
                        questionRange: updatedGroup.questionRange,
                        content: updatedGroup.content,
                        examId: Number(examId),
                        images: updatedGroup.imageKeys.map((key) => ({ url: key })),
                        audios: updatedGroup.audioKeys.map((key) => ({ url: key })),
                        questions: updatedGroup.questions.map((q) => ({
                            indexNumber: q.indexNumber,
                            detail: q.detail,
                            result: q.result,
                            clarify: q.clarify,
                            audios: [], // ✅ Group question không có audio
                            conversation: null,
                            options: q.options.map((opt, idx) => ({
                                mark: LETTERS[idx],
                                detail: opt,
                            })),
                            images: q.imageKeys.map((key) => ({ url: key })),
                        })),
                    };

                    await put(groupPayload, `/api/group-question/${currentGroupId}`, true);
                }

                // Update global cache
                if (saved) {
                    if (window.__toeicExamData?.questions) {
                        window.__toeicExamData = {
                            ...window.__toeicExamData,
                            questions: [...(window.__toeicExamData.questions || []), saved],
                        };
                    } else {
                        window.__toeicExamData = { ...(window.__toeicExamData || {}), questions: [saved] };
                    }
                }
            }

            handleCloseQuestionModal();
        } catch (err) {
            console.error("Save question error", err);
            alert(err?.message || "Lưu câu hỏi thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteQuestion = async (groupId, questionId) => {
        if (!window.confirm("Xoá câu hỏi này?")) return;

        setUploading(true);
        try {
            await del(`/api/toeic-question/${questionId}`, true);

            // ✅ Recalculate groups
            const updatedGroups = groups.map((g) =>
                g.id === groupId
                    ? { ...g, questions: g.questions.filter((q) => q.id !== questionId) }
                    : g
            );
            const recalculated = recalculateAllGroups(updatedGroups);

            setGroups(recalculated);

            // ✅ UPDATE GROUP với title và questionRange mới
            const updatedGroup = recalculated.find(g => g.id === groupId);
            if (updatedGroup) {
                const groupPayload = {
                    part: String(partNumber),
                    title: updatedGroup.title,
                    questionRange: updatedGroup.questionRange,
                    content: updatedGroup.content,
                    examId: Number(examId),
                    images: updatedGroup.imageKeys.map((key) => ({ url: key })),
                    audios: updatedGroup.audioKeys.map((key) => ({ url: key })),
                    questions: updatedGroup.questions.map((q) => ({
                        indexNumber: q.indexNumber,
                        detail: q.detail,
                        result: q.result,
                        clarify: q.clarify,
                        audio: null,
                        conversation: null,
                        options: q.options.map((opt, idx) => ({
                            mark: LETTERS[idx],
                            detail: opt,
                        })),
                        images: q.imageKeys.map((key) => ({ url: key })),
                    })),
                };

                await put(groupPayload, `/api/group-question/${groupId}`, true);
            }

            // Update global cache so CreateToeicExam reflects deletion immediately
            if (window.__toeicExamData?.questions) {
                window.__toeicExamData = {
                    ...window.__toeicExamData,
                    questions: window.__toeicExamData.questions.filter((q) => q?.id !== questionId),
                };
            }

            if (editingQuestionId === questionId) {
                handleCloseQuestionModal();
            }
        } catch (err) {
            console.error("Delete question error", err);
            alert(err?.message || "Xoá câu hỏi thất bại");
        } finally {
            setUploading(false);
        }
    };

    // === RENDER ===
    const renderGroupCard = (group, index) => {
        const isExpanded = expandedGroupId === group.id && editingGroupId !== group.id;
        const isEditing = editingGroupId === group.id;
        const isDragging = draggingGroupId === group.id;

        return (
            <div
                key={group.id || `group-${index}`}
                className={
                    "group-card" +
                    (isExpanded ? " group-card--expanded" : " group-card--collapsed") +
                    (isEditing ? " group-card--editing" : "") +
                    (isDragging ? " group-card--dragging" : "")
                }
                draggable={!isEditing}
                onDragStart={() => handleDragStartGroup(group.id)}
                onDragOver={handleDragOverGroup}
                onDrop={() => handleDropOnGroup(group.id)}
                onDragEnd={handleDragEndGroup}
            >
                <div className="group-card__header" onClick={() => !isEditing && handleClickGroupCard(group.id)}>
                    <div className="group-card__drag-handle">⋮⋮</div>
                    <div className="group-card__title">
                        {`Nhóm ${index + 1} - `}
                        <span className="group-card__part-name">Part {partNumber}</span>
                        {group.questionRange && (
                            <span className="group-card__range"> ({group.questionRange})</span>
                        )}
                    </div>
                    <div className="group-card__actions">
                        <button
                            className="group-card__btn group-card__btn--ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditGroup(group);
                            }}
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            className="group-card__btn group-card__btn--ghost group-card__btn--danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                            }}
                        >
                            Xoá
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="group-card__body">
                        <p className="group-card__text">
                            <strong>Tiêu đề:</strong> {group.title || "Chưa có tiêu đề"}
                        </p>
                        {group.content && (
                            <p className="group-card__text">
                                <strong>Nội dung:</strong> {group.content}
                            </p>
                        )}

                        {group.audioUrls && group.audioUrls.length > 0 && (
                            <div className="group-card__media">
                                <strong>Âm thanh:</strong>
                                {group.audioUrls.map((url, idx) => (
                                    <audio key={idx} src={url} controls style={{ marginTop: 4, width: "100%" }} />
                                ))}
                            </div>
                        )}

                        {group.imageUrls && group.imageUrls.length > 0 && (
                            <div className="group-card__media">
                                <strong>Hình ảnh:</strong>
                                <div className="group-card__images">
                                    {group.imageUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`group-img-${idx}`}
                                            className="group-card__img"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="group-card__questions">
                            <div className="group-card__questions-header">
                                <strong>Câu hỏi ({group.questions?.length || 0})</strong>
                                <button
                                    className="group-card__btn group-card__btn--solid"
                                    onClick={() => handleStartCreateQuestion(group.id)}
                                >
                                    + Thêm câu hỏi
                                </button>
                            </div>

                            {group.questions && group.questions.length > 0 && (
                                <div className="group-card__question-list">
                                    {group.questions.map((q, qIdx) => (
                                        <div key={q.id || `q-${qIdx}`} className="question-mini-card">
                                            <div className="question-mini-card__header">
                                                <span>Câu {q.indexNumber || qIdx + 1}</span>
                                                <div className="question-mini-card__actions">
                                                    <button
                                                        className="question-mini-card__btn"
                                                        onClick={() => handleEditQuestion(group.id, q)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="question-mini-card__btn question-mini-card__btn--danger"
                                                        onClick={() =>
                                                            handleDeleteQuestion(group.id, q.id)
                                                        }
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="question-mini-card__text">
                                                {q.detail || "Chưa có nội dung"}
                                            </p>
                                            {q.options && q.options.length > 0 && (
                                                <ul className="question-mini-card__options">
                                                    {q.options.map((opt, optIdx) => (
                                                        <li key={optIdx}>
                                                            {LETTERS[optIdx]}. {opt}
                                                            {q.correctOptionIndex === optIdx && (
                                                                <strong
                                                                    style={{
                                                                        color: "#16a34a",
                                                                        marginLeft: 6,
                                                                    }}
                                                                >
                                                                    ✓
                                                                </strong>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderGroupEditForm = () => {
        if (!draftGroup) return null;

        const serverImages = Array.isArray(draftGroup.imageUrls) ? draftGroup.imageUrls : [];
        const localImagePreviews = Array.isArray(draftGroup.imagePreviews)
            ? draftGroup.imagePreviews
            : [];

        const serverAudios = Array.isArray(draftGroup.audioUrls) ? draftGroup.audioUrls : [];
        const localAudioPreviews = Array.isArray(draftGroup.audioPreviews)
            ? draftGroup.audioPreviews
            : [];

        return (
            <div className="group-edit-form">
                <div className="group-edit-form__header">
                    <h3>
                        {editingGroupId != null
                            ? "Chỉnh sửa nhóm câu hỏi"
                            : "Tạo nhóm câu hỏi mới"}
                    </h3>
                </div>

                <div className="group-edit-form__body">
                    <div className="group-edit-form__group">
                        <label>Nội dung (hội thoại / đoạn văn)</label>
                        <textarea
                            value={draftGroup.content || ""}
                            onChange={(e) => handleChangeGroupField("content", e.target.value)}
                            rows={6}
                            placeholder="Nhập nội dung hội thoại hoặc đoạn văn"
                        />
                    </div>

                    {/* Group Images */}
                    <div className="group-edit-form__group">
                        <label>Hình ảnh</label>
                        <div className="group-edit-form__media-section">
                            <label className="group-edit-form__upload-btn">
                                <span>+ Thêm hình</span>
                                <input type="file" accept="image/*" onChange={handleAddGroupImage} />
                            </label>

                            {(serverImages.length > 0 || localImagePreviews.length > 0) && (
                                <div className="group-edit-form__image-list">
                                    {serverImages.map((url, idx) => (
                                        <div key={`server-img-${idx}`} className="group-edit-form__image-item">
                                            <img src={url} alt={`server-${idx}`} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGroupImage("server", idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {localImagePreviews.map((url, idx) => (
                                        <div key={`local-img-${idx}`} className="group-edit-form__image-item">
                                            <img src={url} alt={`preview-${idx}`} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGroupImage("local", idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Audios */}
                    <div className="group-edit-form__group">
                        <label>Âm thanh</label>
                        <div className="group-edit-form__media-section">
                            <label className="group-edit-form__upload-btn">
                                <span>+ Thêm audio</span>
                                <input type="file" accept="audio/*" onChange={handleAddGroupAudio} />
                            </label>

                            {(serverAudios.length > 0 || localAudioPreviews.length > 0) && (
                                <div className="group-edit-form__audio-list">
                                    {serverAudios.map((url, idx) => (
                                        <div key={`server-audio-${idx}`} className="group-edit-form__audio-item">
                                            <audio src={url} controls />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGroupAudio("server", idx)}
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    ))}
                                    {localAudioPreviews.map((url, idx) => (
                                        <div key={`local-audio-${idx}`} className="group-edit-form__audio-item">
                                            <audio src={url} controls />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGroupAudio("local", idx)}
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="group-edit-form__footer">
                    <button
                        className="group-edit-form__btn group-edit-form__btn--outlined"
                        onClick={handleCancelGroupEdit}
                    >
                        Huỷ
                    </button>
                    <button
                        className="group-edit-form__btn group-edit-form__btn--solid"
                        onClick={handleSaveGroup}
                        disabled={uploading}
                    >
                        {uploading ? "Đang lưu..." : editingGroupId != null ? "Lưu thay đổi" : "Tạo nhóm"}
                    </button>
                </div>
            </div>
        );
    };

    const showGroupForm = creatingNewGroup || editingGroupId != null;

    return (
        <div className="part-detail-group">
            <div className="part-detail-group__hero">
                <div className="part-detail-group__hero-left">
                    <button className="part-detail-group__btn part-detail-group__btn--ghost" onClick={handleBack}>
                        ⟵ Quay lại
                    </button>
                </div>

                <div className="part-detail-group__hero-center">
                    <p>{examTitle} -</p>
                    <span className="part-detail-group__part-name">Part {partNumber}</span>
                </div>

                <div className="part-detail-group__hero-actions">
                    <button className="part-detail-group__btn part-detail-group__btn--outlined">
                        <img src={crown} className="crown-icon" alt="crown-icon" />
                        Ngân hàng câu hỏi
                    </button>
                    <button
                        className="part-detail-group__btn part-detail-group__btn--solid"
                        onClick={handleStartCreateGroup}
                    >
                        + Thêm nhóm câu hỏi
                    </button>
                </div>
            </div>

            <div className="part-detail-group__content">
                <div className="part-detail-group__left">
                    {groups.length === 0 && !showGroupForm && (
                        <div className="part-detail-group__empty">
                            <p>Part này chưa có nhóm câu hỏi nào.</p>
                            <button
                                className="part-detail-group__btn part-detail-group__btn--solid"
                                onClick={handleStartCreateGroup}
                            >
                                + Thêm nhóm đầu tiên
                            </button>
                        </div>
                    )}

                    {showGroupForm && renderGroupEditForm()}

                    {groups.length > 0 && (
                        <div className="part-detail-group__group-list">
                            {groups.map((g, index) => renderGroupCard(g, index))}
                        </div>
                    )}
                </div>
            </div>

            <CreateToeicQuestion
                open={showQuestionModal}
                onClose={handleCloseQuestionModal}
                draftQuestion={draftQuestion}
                onChangeDraftField={handleChangeDraftField}
                onChangeOption={handleChangeOption}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onMarkCorrect={handleMarkCorrect}
                onAudioChange={null}
                onClearAudio={null}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onSave={handleSaveQuestion}
                partNumber={partNumber}
                isEditing={editingQuestionId != null}
                questionIndex={(groups.find((g) => g.id === currentGroupId)?.questions?.length || 0) + 1}
                loading={uploading}
                isGroupQuestion={true}
            />
        </div>
    );
}