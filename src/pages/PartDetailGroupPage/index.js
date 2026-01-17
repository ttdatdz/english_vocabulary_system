import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./PartDetailGroupPage.scss";
import crown from "../../assets/images/crown.png";
import { postFormData, post, put, get, del } from "../../utils/request";
import CreateGroupToeicQuestion from "../../components/CreateGroupToeicQuestion";

const LETTERS = ["A", "B", "C", "D", "E"];

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

const isUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);

function mapGroupQuestionResponseToLocal(group) {
  if (!group) return null;

  const rawImages = Array.isArray(group.images)
    ? group.images.filter(Boolean)
    : [];
  const rawAudios = Array.isArray(group.audios)
    ? group.audios.filter(Boolean)
    : [];

  // CHỈ lấy URL cho hiển thị
  const imageUrls = rawImages.filter(isUrl);
  const audioUrls = rawAudios.filter(isUrl);

  // KEY giữ riêng để PUT/POST
  const imageKeys = Array.isArray(group.imageKeys)
    ? group.imageKeys.filter(Boolean)
    : [];
  const audioKeys = Array.isArray(group.audioKeys)
    ? group.audioKeys.filter(Boolean)
    : [];

  return {
    id: group.id ?? null,
    part: group.part ?? "",
    title: group.title || "",
    content: group.content || "",
    questionRange: group.questionRange || "",
    examId: group.examId ?? null,

    imageUrls, // render
    audioUrls, // render
    imageKeys, // PUT/POST
    audioKeys, // PUT/POST

    imageFiles: [],
    imagePreviews: [],
    audioFiles: [],
    audioPreviews: [],

    questions: Array.isArray(group.questions)
      ? group.questions.map(mapToeicQuestionResponseToLocal)
      : [],
  };
}

function mapToeicQuestionResponseToLocal(q) {
  if (!q) return null;

  const correctIdx = LETTERS.indexOf(q.result);
  const rawImages = Array.isArray(q.images) ? q.images.filter(Boolean) : [];

  const imageUrls = rawImages.filter(isUrl); // render
  const imageKeys = Array.isArray(q.imageKeys)
    ? q.imageKeys.filter(Boolean)
    : []; // payload

  return {
    id: q.id ?? null,
    indexNumber: q.indexNumber ?? null,
    part: q.part ?? "",
    detail: q.detail || "",
    result: q.result || "",

    imageUrls,
    imageKeys,

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

  // Load groups từ route state hoặc API

  useEffect(() => {
    let cancelled = false;

    const loadGroups = async () => {
      try {
        // 1) Luôn gọi exam detail (bỏ routeState ưu tiên)
        const examData = await get(`/api/exam/detail/${examId}`, true);
        const list = Array.isArray(examData?.groupQuestions)
          ? examData.groupQuestions
          : [];

        // 2) Lọc theo part
        const partGroups = list.filter(
          (g) => String(g.part) === String(partNumber)
        );

        // 3) Song song gọi chi tiết từng group để lấy URL hình/audio chuẩn
        const details = await Promise.all(
          partGroups.map(async (g) => {
            try {
              const full = await get(`/api/group-question/${g.id}`, true);
              return full || g; // fallback nếu lỗi
            } catch (e) {
              console.error("Load group detail error", g.id, e);
              return g;
            }
          })
        );

        // 4) Map → sort → set state
        const mapped = details.map(mapGroupQuestionResponseToLocal);
        const sorted = sortGroups(mapped);

        if (!cancelled) setGroups(sorted);

        // 5) Nếu không có group nào → mở form tạo mới
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
  }, [examId, partNumber]);

  // Sort groups theo questionRange
  const sortGroups = (groupsList) => {
    return [...groupsList].sort((a, b) => {
      if (!a.questionRange && !b.questionRange) return 0;
      if (!a.questionRange) return 1;
      if (!b.questionRange) return -1;

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

      const updatedQuestions = group.questions.map((q, qIdx) => ({
        ...q,
        indexNumber: groupStartQuestion + qIdx,
      }));

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
      // ✅ Keys đã có sẵn từ server
      imageKeys: [...(group.imageKeys || [])],
      audioKeys: [...(group.audioKeys || [])],
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
    e.target.value = "";
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
      const newPreviews = (prev.imagePreviews || []).filter(
        (_, i) => i !== idx
      );
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
    e.target.value = "";
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
      const newPreviews = (prev.audioPreviews || []).filter(
        (_, i) => i !== idx
      );
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
      // Upload media mới (nếu có)
      let uploadedImageKeys = [];
      let uploadedAudioKeys = [];

      const fd = new FormData();
      let hasNewMedia = false;

      if (draftGroup.imageFiles && draftGroup.imageFiles.length > 0) {
        draftGroup.imageFiles.forEach((f) => fd.append("images", f));
        hasNewMedia = true;
      }
      if (draftGroup.audioFiles && draftGroup.audioFiles.length > 0) {
        draftGroup.audioFiles.forEach((f) => fd.append("audios", f));
        hasNewMedia = true;
      }

      if (hasNewMedia) {
        const uploadRes = await postFormData("/api/media/upload", fd, true);

        const imgList = Array.isArray(uploadRes?.images)
          ? uploadRes.images
          : [];
        uploadedImageKeys = imgList.map((x) => x?.key).filter(Boolean);

        const audioList = Array.isArray(uploadRes?.audios)
          ? uploadRes.audios
          : [];
        uploadedAudioKeys = audioList.map((x) => x?.key).filter(Boolean);
      }

      // ✅ Gộp keys cũ (từ server) + keys mới (vừa upload)
      const existingImageKeys = Array.isArray(draftGroup.imageKeys)
        ? draftGroup.imageKeys
        : [];
      const existingAudioKeys = Array.isArray(draftGroup.audioKeys)
        ? draftGroup.audioKeys
        : [];

      const allImageKeys = [...existingImageKeys, ...uploadedImageKeys].filter(
        Boolean
      );
      const allAudioKeys = [...existingAudioKeys, ...uploadedAudioKeys].filter(
        Boolean
      );

      const imagesPayload = allImageKeys.map((key) => ({ url: key }));
      const audiosPayload = allAudioKeys.map((key) => ({ url: key }));

      if (editingGroupId != null) {
        // ==================== UPDATE GROUP ====================
        const currentGroup = groups.find((g) => g.id === editingGroupId);

        // Tính toán title và questionRange
        const tempGroups = groups.map((g) =>
          g.id === editingGroupId
            ? {
                ...g,
                content: draftGroup.content.trim(),
                imageKeys: allImageKeys,
                audioKeys: allAudioKeys,
                // GIỮ NGUYÊN url đang hiển thị
                imageUrls: g.imageUrls,
                audioUrls: g.audioUrls,
                questions: currentGroup.questions,
              }
            : g
        );
        const recalculated = recalculateAllGroups(tempGroups);
        const recalculatedGroup = recalculated.find(
          (g) => g.id === editingGroupId
        );

        const basePayload = {
          part: String(partNumber),
          title: recalculatedGroup.title,
          questionRange: recalculatedGroup.questionRange,
          content: draftGroup.content.trim(),
          examId: Number(examId),
        };

        if (
          uploadedImageKeys.length > 0 ||
          draftGroup.imageKeys?.length !== currentGroup.imageKeys?.length
        ) {
          basePayload.images = imagesPayload;
        }

        if (
          uploadedAudioKeys.length > 0 ||
          draftGroup.audioKeys?.length !== currentGroup.audioKeys?.length
        ) {
          basePayload.audios = audiosPayload;
        }

        await put(basePayload, `/api/group-question/${editingGroupId}`, true);

        // Reload từ server để lấy data mới nhất
        const reloaded = await get(
          `/api/group-question/${editingGroupId}`,
          true
        );
        const updatedLocal = mapGroupQuestionResponseToLocal(reloaded);

        setGroups((prev) => {
          const next = prev.map((g) =>
            g.id === editingGroupId ? updatedLocal : g
          );
          return sortGroups(next);
        });
      } else {
        // ==================== CREATE NEW GROUP ====================
        const tempGroups = [...groups, draftGroup];
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

        // Reload để lấy data đầy đủ
        const reloadedGroup = await get(
          `/api/group-question/${saved.id}`,
          true
        );
        const createdLocal = mapGroupQuestionResponseToLocal(reloadedGroup);

        setGroups((prev) => {
          const next = [...prev, createdLocal];
          return sortGroups(next);
        });
      }

      setCreatingNewGroup(false);
      setEditingGroupId(null);
      setDraftGroup(null);
      setExpandedGroupId(null);
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

      // Update các groups còn lại trên server
      for (const group of recalculated) {
        if (group.id && group.questionRange) {
          const payload = {
            part: String(partNumber),
            title: group.title,
            questionRange: group.questionRange,
            content: group.content,
            examId: Number(examId),
            images: (group.imageKeys || []).map((key) => ({ url: key })),
            audios: (group.audioKeys || []).map((key) => ({ url: key })),
          };

          await put(payload, `/api/group-question/${group.id}`, true);
        }
      }

      setGroups(recalculated);

      // Sync global cache
      if (window.__toeicExamData?.questions) {
        const remainingIds = new Set(
          recalculated
            .flatMap((g) => (g.questions || []).map((q) => q.id))
            .filter(Boolean)
        );

        let newQuestions = (window.__toeicExamData.questions || []).filter(
          (q) => String(q.part) !== String(partNumber) || remainingIds.has(q.id)
        );

        window.__toeicExamData = {
          ...window.__toeicExamData,
          questions: newQuestions,
        };
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

    // Update trên server
    try {
      for (const group of recalculated) {
        if (group.id && group.questionRange) {
          const payload = {
            part: String(partNumber),
            title: group.title,
            questionRange: group.questionRange,
            content: group.content,
            examId: Number(examId),
            images: (group.imageKeys || []).map((key) => ({ url: key })),
            audios: (group.audioKeys || []).map((key) => ({ url: key })),
          };

          await put(payload, `/api/group-question/${group.id}`, true);
        }
      }
    } catch (err) {
      console.error("Reorder groups error", err);
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
      imageUrls: [...(question.imageUrls || [])],
      imageKeys: [...(question.imageKeys || [])], // ✅ Keys từ server
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
      else if (
        prev.correctOptionIndex != null &&
        prev.correctOptionIndex > index
      ) {
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
    e.target.value = "";
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
      const newPreviews = (prev.imagePreviews || []).filter(
        (_, i) => i !== idx
      );
      return { ...prev, imageFiles: newFiles, imagePreviews: newPreviews };
    });
  };

  const handleSaveQuestion = async () => {
    if (!draftQuestion?.detail?.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    const trimmedOptions = (draftQuestion.options || []).map((o) =>
      (o || "").trim()
    );
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
      // Upload media mới
      let uploadedImageKeys = [];

      if (draftQuestion.imageFiles && draftQuestion.imageFiles.length > 0) {
        const fd = new FormData();
        draftQuestion.imageFiles.forEach((f) => fd.append("images", f));

        const uploadRes = await postFormData("/api/media/upload", fd, true);
        const imgList = Array.isArray(uploadRes?.images)
          ? uploadRes.images
          : [];
        uploadedImageKeys = imgList.map((x) => x?.key).filter(Boolean);
      }

      // Gộp keys
      const existingKeys = Array.isArray(draftQuestion.imageKeys)
        ? draftQuestion.imageKeys
        : [];
      const allImageKeys = [...existingKeys, ...uploadedImageKeys].filter(
        Boolean
      );
      const imagesPayload = allImageKeys.map((key) => ({ url: key }));

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
        audio: null,
        images: imagesPayload,
      };

      if (editingQuestionId != null) {
        // ==================== UPDATE QUESTION ====================
        await put(
          basePayload,
          `/api/toeic-question/${editingQuestionId}`,
          true
        );

        // Reload group để lấy data mới
        const reloaded = await get(
          `/api/group-question/${currentGroupId}`,
          true
        );
        const mappedGroup = mapGroupQuestionResponseToLocal(reloaded);

        // Recalculate và update state
        const updatedGroups = groups.map((g) =>
          g.id === currentGroupId ? mappedGroup : g
        );
        const recalculated = recalculateAllGroups(updatedGroups);
        setGroups(recalculated);

        // Update group metadata trên server
        const updatedGroup = recalculated.find((g) => g.id === currentGroupId);
        if (updatedGroup && updatedGroup.questionRange) {
          const groupPayload = {
            part: String(partNumber),
            title: updatedGroup.title,
            questionRange: updatedGroup.questionRange,
            content: updatedGroup.content,
            examId: Number(examId),
            images: (updatedGroup.imageKeys || []).map((key) => ({ url: key })),
            audios: (updatedGroup.audioKeys || []).map((key) => ({ url: key })),
          };
          await put(
            groupPayload,
            `/api/group-question/${currentGroupId}`,
            true
          );
        }
      } else {
        // ==================== CREATE QUESTION ====================
        const saved = await post(basePayload, "/api/toeic-question", true);

        if (!saved) {
          throw new Error("Create question failed");
        }

        // Gán câu hỏi vào group
        await put(
          { groupId: currentGroupId },
          `/api/group-question/question/${saved.id}`
        );

        // Reload group để lấy data đầy đủ
        const reloaded = await get(
          `/api/group-question/${currentGroupId}`,
          true
        );
        const mappedGroup = mapGroupQuestionResponseToLocal(reloaded);

        // Recalculate và update state
        const updatedGroups = groups.map((g) =>
          g.id === currentGroupId ? mappedGroup : g
        );
        const recalculated = recalculateAllGroups(updatedGroups);
        setGroups(recalculated);

        // Update group metadata trên server
        const updatedGroup = recalculated.find((g) => g.id === currentGroupId);
        if (updatedGroup && updatedGroup.questionRange) {
          const groupPayload = {
            part: String(partNumber),
            title: updatedGroup.title,
            questionRange: updatedGroup.questionRange,
            content: updatedGroup.content,
            examId: Number(examId),
            images: (updatedGroup.imageKeys || []).map((key) => ({ url: key })),
            audios: (updatedGroup.audioKeys || []).map((key) => ({ url: key })),
          };
          await put(
            groupPayload,
            `/api/group-question/${currentGroupId}`,
            true
          );
        }

        // Update global cache
        if (window.__toeicExamData?.questions) {
          window.__toeicExamData = {
            ...window.__toeicExamData,
            questions: [...(window.__toeicExamData.questions || []), saved],
          };
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

      // Reload group
      const reloaded = await get(`/api/group-question/${groupId}`, true);
      const mappedGroup = mapGroupQuestionResponseToLocal(reloaded);

      // Recalculate
      const updatedGroups = groups.map((g) =>
        g.id === groupId ? mappedGroup : g
      );
      const recalculated = recalculateAllGroups(updatedGroups);
      setGroups(recalculated);

      // Update group metadata
      const updatedGroup = recalculated.find((g) => g.id === groupId);
      if (updatedGroup) {
        const groupPayload = {
          part: String(partNumber),
          title: updatedGroup.title,
          questionRange: updatedGroup.questionRange,
          content: updatedGroup.content,
          examId: Number(examId),
          images: (updatedGroup.imageKeys || []).map((key) => ({ url: key })),
          audios: (updatedGroup.audioKeys || []).map((key) => ({ url: key })),
        };
        await put(groupPayload, `/api/group-question/${groupId}`, true);
      }

      // Update global cache
      if (window.__toeicExamData?.questions) {
        window.__toeicExamData = {
          ...window.__toeicExamData,
          questions: window.__toeicExamData.questions.filter(
            (q) => q?.id !== questionId
          ),
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
    const isExpanded =
      expandedGroupId === group.id && editingGroupId !== group.id;
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
        <div
          className="group-card__header"
          onClick={() => !isEditing && handleClickGroupCard(group.id)}
        >
          <div className="group-card__drag-handle">⋮⋮</div>
          <div className="group-card__title">
            {`Nhóm ${index + 1} - `}
            <span className="group-card__part-name">Part {partNumber}</span>
            {group.questionRange && (
              <span className="group-card__range">
                {" "}
                ({group.questionRange})
              </span>
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
                  <audio
                    key={idx}
                    src={url}
                    controls
                    style={{ marginTop: 4, width: "100%" }}
                  />
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
                    <div
                      key={q.id || `q-${qIdx}`}
                      className="question-mini-card"
                    >
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
                            onClick={() => handleDeleteQuestion(group.id, q.id)}
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

    const serverImages = Array.isArray(draftGroup.imageUrls)
      ? draftGroup.imageUrls
      : [];
    const localImagePreviews = Array.isArray(draftGroup.imagePreviews)
      ? draftGroup.imagePreviews
      : [];

    const serverAudios = Array.isArray(draftGroup.audioUrls)
      ? draftGroup.audioUrls
      : [];
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
              onChange={(e) =>
                handleChangeGroupField("content", e.target.value)
              }
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddGroupImage}
                />
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
                        onClick={() => handleRemoveGroupImage("server", idx)}
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
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAddGroupAudio}
                />
              </label>

              {(serverAudios.length > 0 || localAudioPreviews.length > 0) && (
                <div className="group-edit-form__audio-list">
                  {serverAudios.map((url, idx) => (
                    <div
                      key={`server-audio-${idx}`}
                      className="group-edit-form__audio-item"
                    >
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
                    <div
                      key={`local-audio-${idx}`}
                      className="group-edit-form__audio-item"
                    >
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
            {uploading
              ? "Đang lưu..."
              : editingGroupId != null
              ? "Lưu thay đổi"
              : "Tạo nhóm"}
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
          <button
            className="part-detail-group__btn part-detail-group__btn--ghost"
            onClick={handleBack}
          >
            ⟵ Quay lại
          </button>
        </div>

        <div className="part-detail-group__hero-center">
          <p>{examTitle} - <span className="part-detail-group__part-name">
            Part {partNumber}
          </span></p>
       
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

      <CreateGroupToeicQuestion
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
        questionIndex={
          (groups.find((g) => g.id === currentGroupId)?.questions?.length ||
            0) + 1
        }
        loading={uploading}
        isGroupQuestion={true}
      />
    </div>
  );
}
