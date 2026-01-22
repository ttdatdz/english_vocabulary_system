// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import "./CreateCustomExam.scss";
// import CreateToeicQuestion from "../../components/CreateToeicQuestion";
// import CreateGroupToeicQuestion from "../../components/CreateGroupToeicQuestion";
// import GroupEditModal from "../../components/GroupEditModal";
// import QuestionBank from "../../components/QuestionBank";
// import ContributeBar from "../../components/ContributeBar";
// import { Checkbox } from "antd";
// import { get } from "../../utils/request";
// import {
//   confirmBasic,
//   showSuccess,
//   showWaringMessage,
// } from "../../utils/alertHelper";

// const ID_PREFIX_GROUP = "g-";
// const ID_PREFIX_QUESTION = "q-";

// export default function CreateCustomExam() {
//   const location = useLocation();
//   const routeState = location.state || {};
//   const { examId: routeExamId } = useParams();
//   const examId = Number(routeState.examId || routeExamId || 0);
//   const navigate = useNavigate();

//   const [groups, setGroups] = useState([]);
//   const [questions, setQuestions] = useState([]);

//   const [showQuestionModal, setShowQuestionModal] = useState(false);
//   const [editingQuestion, setEditingQuestion] = useState(null);

//   const [showGroupModal, setShowGroupModal] = useState(false);
//   const [editingGroup, setEditingGroup] = useState(null);

//   const [showBank, setShowBank] = useState(false);

//   // checkedIds are strings like 'g-123' or 'q-456'
//   const [checkedIds, setCheckedIds] = useState([]);

//   const [examTitle, setExamTitle] = useState(
//     routeState.title || `Tạo đề tùy chỉnh`,
//   );
//   const [duration, setDuration] = useState(routeState.duration || 60);

//   const createEmptyQuestion = (part) => ({
//     id: null,
//     indexNumber: null,
//     part: String(part),
//     detail: "",
//     result: "",
//     imageUrls: [],
//     imageKeys: [],
//     imageFiles: [],
//     imagePreviews: [],
//     options: ["", ""],
//     correctOptionIndex: null,
//     conversation: null,
//     clarify: "",
//     bankQuestionId: null,
//   });

//   const createEmptyGroup = (part, examIdVal) => ({
//     id: null,
//     part: String(part),
//     title: "",
//     content: "",
//     questionRange: "",
//     examId: Number(examIdVal) || null,
//     imageUrls: [],
//     audioUrls: [],
//     imageKeys: [],
//     audioKeys: [],
//     imageFiles: [],
//     imagePreviews: [],
//     audioFiles: [],
//     audioPreviews: [],
//     bankGroupId: null,
//     questions: [],
//   });

//   const items = useMemo(() => {
//     // merged flat list: include both groups and single questions, sorted by index
//     const mapped = [
//       ...groups.map((g) => ({ type: "group", id: g.id, data: g })),
//       ...questions.map((q) => ({ type: "single", id: q.id, data: q })),
//     ];

//     const extractStart = (group) => {
//       if (!group) return Infinity;
//       if (Array.isArray(group.questions) && group.questions.length > 0) {
//         const first = group.questions[0];
//         if (first && typeof first.indexNumber === "number")
//           return first.indexNumber;
//       }
//       if (
//         typeof group.questionRange === "string" &&
//         group.questionRange.includes("-")
//       ) {
//         const start = parseInt(group.questionRange.split("-")[0]);
//         if (!isNaN(start)) return start;
//       }
//       return Infinity;
//     };

//     const getSortKey = (it) => {
//       if (it.type === "group") return extractStart(it.data);
//       if (it.type === "single") return Number(it.data.indexNumber ?? Infinity);
//       return Infinity;
//     };

//     return mapped.sort((a, b) => {
//       const ka = getSortKey(a);
//       const kb = getSortKey(b);
//       if (ka === kb) return 0;
//       return ka - kb;
//     });
//   }, [groups, questions]);

//   const totalCount = items.length;
//   const checkedCount = checkedIds.length;
//   const checkAll = checkedCount === totalCount && totalCount > 0;
//   const indeterminate = checkedCount > 0 && checkedCount < totalCount;

//   useEffect(() => {
//     // try to load existing exam items when examId provided
//     let cancelled = false;
//     const load = async () => {
//       if (!examId) return;
//       try {
//         const res = await get(`/api/exam/detail/${examId}`, true);
//         if (cancelled) return;
//         const groupQuestions = Array.isArray(res?.groupQuestions)
//           ? res.groupQuestions
//           : [];
//         const plainQuestions = Array.isArray(res?.questions)
//           ? res.questions
//           : [];
//         setGroups((groupQuestions || []).map((g) => ({ ...g })));
//         setQuestions((plainQuestions || []).map((q) => ({ ...q })));
//       } catch (e) {
//         // ignore, page is primarily a UI scaffold
//       }
//     };
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [examId]);

//   const toggleItemCheck = (type, id, checked) => {
//     const key = (type === "group" ? ID_PREFIX_GROUP : ID_PREFIX_QUESTION) + id;
//     setCheckedIds((prev) => {
//       if (checked) return Array.from(new Set([...prev, key]));
//       return prev.filter((x) => x !== key);
//     });
//   };

//   const handleCheckAllChange = (e) => {
//     if (e.target.checked) {
//       const allKeys = items.map(
//         (it) =>
//           (it.type === "group" ? ID_PREFIX_GROUP : ID_PREFIX_QUESTION) + it.id,
//       );
//       setCheckedIds(allKeys);
//     } else setCheckedIds([]);
//   };

//   const handleContributeSelected = async () => {
//     if (checkedIds.length === 0) return;
//     const confirmed = await confirmBasic(
//       "Bạn muốn đóng góp các mục đã chọn vào ngân hàng đề?",
//     );
//     if (!confirmed) return;

//     // simulate contribute: mark local items as contributed
//     const groupKeys = checkedIds
//       .filter((k) => k.startsWith(ID_PREFIX_GROUP))
//       .map((k) => Number(k.replace(ID_PREFIX_GROUP, "")));
//     const questionKeys = checkedIds
//       .filter((k) => k.startsWith(ID_PREFIX_QUESTION))
//       .map((k) => Number(k.replace(ID_PREFIX_QUESTION, "")));

//     setGroups((prev) =>
//       prev.map((g) =>
//         groupKeys.includes(g.id) ? { ...g, isContribute: true } : g,
//       ),
//     );
//     setQuestions((prev) =>
//       prev.map((q) =>
//         questionKeys.includes(q.id) ? { ...q, isContribute: true } : q,
//       ),
//     );

//     setCheckedIds([]);
//     showSuccess("Đóng góp thành công vào ngân hàng đề!");
//   };

//   const handleCreateExam = async () => {
//     if (!examTitle || examTitle.trim() === "") {
//       showWaringMessage("Tiêu đề đề không được để trống");
//       return;
//     }
//     const confirmed = await confirmBasic(
//       `Bạn muốn tạo đề với tiêu đề:\n${examTitle}\nThời gian: ${duration} phút`,
//     );
//     if (!confirmed) return;

//     // frontend simulation for creation — replace with API call if available
//     showSuccess("Tạo đề thành công");
//     if (!examId) navigate(-1);
//   };

//   const openAddQuestion = () => {
//     setEditingQuestion(createEmptyQuestion("-"));
//     setShowQuestionModal(true);
//   };
//   const openAddGroup = () => {
//     setEditingGroup(createEmptyGroup("-", examId));
//     setShowGroupModal(true);
//   };

//   const handleQuestionSaved = (q) => {
//     // backend will normally return id — here we fake an id when missing
//     const id = q.id || Date.now();
//     const newQ = { ...q, id };
//     setQuestions((prev) => [...prev, newQ]);
//     setShowQuestionModal(false);
//   };

//   const handleGroupSaved = (g) => {
//     const id = g.id || Date.now();
//     const newG = { ...g, id, questions: g.questions || [] };
//     setGroups((prev) => {
//       // if editing existing group replace, else append
//       const exists = prev.find((x) => x.id === newG.id);
//       if (exists) return prev.map((x) => (x.id === newG.id ? newG : x));
//       return [...prev, newG];
//     });
//     setShowGroupModal(false);
//   };

//   const handleChangeGroupField = (field, value) => {
//     setEditingGroup((prev) => ({ ...(prev || {}), [field]: value }));
//   };

//   const handleGroupAddImage = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const preview = URL.createObjectURL(file);
//     setEditingGroup((prev) => ({
//       ...(prev || {}),
//       imagePreviews: [...(prev.imagePreviews || []), preview],
//       imageFiles: [...(prev.imageFiles || []), file],
//     }));
//     e.target.value = "";
//   };

//   const handleGroupRemoveImage = (source, idx) => {
//     setEditingGroup((prev) => {
//       if (!prev) return prev;
//       if (source === "server") {
//         const imgs = Array.isArray(prev.imageUrls) ? [...prev.imageUrls] : [];
//         imgs.splice(idx, 1);
//         return { ...prev, imageUrls: imgs };
//       }
//       const previews = Array.isArray(prev.imagePreviews)
//         ? [...prev.imagePreviews]
//         : [];
//       previews.splice(idx, 1);
//       const files = Array.isArray(prev.imageFiles) ? [...prev.imageFiles] : [];
//       files.splice(idx, 1);
//       return { ...prev, imagePreviews: previews, imageFiles: files };
//     });
//   };

//   const handleEditItem = (type, data) => {
//     if (type === "group") {
//       setEditingGroup(data);
//       setShowGroupModal(true);
//     } else {
//       setEditingQuestion(data);
//       setShowQuestionModal(true);
//     }
//   };

//   const handleDeleteItem = async (type, id) => {
//     const confirmed = await confirmBasic("Bạn muốn xoá mục này?");
//     if (!confirmed) return;
//     if (type === "group") setGroups((prev) => prev.filter((g) => g.id !== id));
//     else setQuestions((prev) => prev.filter((q) => q.id !== id));
//     setCheckedIds((prev) => prev.filter((k) => !k.endsWith(String(id))));
//   };

//   const handleOpenBank = () => setShowBank(true);
//   const handleBankClose = () => setShowBank(false);
//   const handleItemsAddedFromBank = async () => {
//     // After adding from bank, reload exam detail if available
//     if (!examId) {
//       setShowBank(false);
//       showSuccess("Đã thêm từ ngân hàng (front-end demo)");
//       return;
//     }
//     try {
//       const res = await get(`/api/exam/detail/${examId}`, true);
//       const groupQuestions = Array.isArray(res?.groupQuestions)
//         ? res.groupQuestions
//         : [];
//       const plainQuestions = Array.isArray(res?.questions) ? res.questions : [];
//       setGroups((groupQuestions || []).map((g) => ({ ...g })));
//       setQuestions((plainQuestions || []).map((q) => ({ ...q })));
//     } catch (e) {
//       // ignore
//     } finally {
//       setShowBank(false);
//     }
//   };

//   return (
//     <div className="create-custom-exam">
//       <div className="create-custom-exam__hero">
//         <div className="create-custom-exam__hero-container">
//           <div className="create-custom-exam__hero-left">
//             <button
//               className="create-custom-exam__btn create-custom-exam__btn--ghost"
//               onClick={() => navigate(-1)}
//             >
//               ⟵ Quay lại
//             </button>
//           </div>
//           <div className="create-custom-exam__hero-center">
//             <input
//               className="create-custom-exam__title-input"
//               value={examTitle}
//               onChange={(e) => setExamTitle(e.target.value)}
//               placeholder="Tiêu đề đề"
//             />
//             <p className="create-custom-exam__subtitle">
//               Thời gian:
//               <input
//                 className="create-custom-exam__duration-input"
//                 type="number"
//                 min={1}
//                 max={240}
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//               />
//               <span> phút</span>
//             </p>
//           </div>
//           <div className="create-custom-exam__hero-actions">
//             <button
//               className="create-custom-exam__btn create-custom-exam__btn--outlined"
//               onClick={openAddQuestion}
//             >
//               + Thêm câu hỏi
//             </button>
//             <button
//               className="create-custom-exam__btn create-custom-exam__btn--outlined"
//               onClick={openAddGroup}
//             >
//               + Thêm nhóm câu hỏi
//             </button>
//             <button
//               className="create-custom-exam__btn create-custom-exam__btn--solid"
//               onClick={handleCreateExam}
//             >
//               Tạo đề
//             </button>
//             <button
//               className="create-custom-exam__btn create-custom-exam__btn--solid"
//               onClick={handleOpenBank}
//             >
//               Ngân hàng câu hỏi
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="create-custom-exam__content">
//         <div className="create-custom-exam__list">
//           {items.length === 0 && (
//             <div className="create-custom-exam__empty">
//               Danh sách trống. Thêm câu hỏi hoặc dùng ngân hàng đề.
//             </div>
//           )}

//           {items.map((it, idx) => (
//             <div
//               key={`${it.type}-${it.id}-${idx}`}
//               className={`create-custom-exam__item create-custom-exam__item--${it.type}`}
//             >
//               <div className="create-custom-exam__item-left">
//                 <Checkbox
//                   checked={checkedIds.includes(
//                     (it.type === "group"
//                       ? ID_PREFIX_GROUP
//                       : ID_PREFIX_QUESTION) + it.id,
//                   )}
//                   onChange={(e) =>
//                     toggleItemCheck(it.type, it.id, e.target.checked)
//                   }
//                 />
//               </div>
//               <div className="create-custom-exam__item-body">
//                 {it.type === "group" ? (
//                   <div className="create-custom-exam__item-title">
//                     Nhóm: {it.data.title || "No title"}
//                   </div>
//                 ) : (
//                   <div className="create-custom-exam__item-title">
//                     Câu: {it.data.detail || "No content"}
//                   </div>
//                 )}
//                 <div className="create-custom-exam__item-meta">
//                   {it.type === "group"
//                     ? `Câu hỏi: ${it.data.questions?.length || 0}`
//                     : `Part: ${it.data.part || "-"}`}
//                   {it.data.isContribute === true && (
//                     <span className="create-custom-exam__badge--contributed">
//                       Đã đóng góp
//                     </span>
//                   )}
//                   <div className="create-custom-exam__item-actions">
//                     <button
//                       className="create-custom-exam__item-btn create-custom-exam__item-btn--ghost"
//                       onClick={() => handleEditItem(it.type, it.data)}
//                     >
//                       Sửa
//                     </button>
//                     <button
//                       className="create-custom-exam__item-btn create-custom-exam__item-btn--danger"
//                       onClick={() => handleDeleteItem(it.type, it.id)}
//                     >
//                       Xoá
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {items.length > 0 && (
//         <ContributeBar
//           totalCount={totalCount}
//           checkedCount={checkedCount}
//           checkAll={checkAll}
//           indeterminate={indeterminate}
//           onCheckAllChange={handleCheckAllChange}
//           onContribute={handleContributeSelected}
//         />
//       )}

//       <CreateToeicQuestion
//         open={showQuestionModal}
//         onClose={() => setShowQuestionModal(false)}
//         draftQuestion={editingQuestion}
//         onChangeDraftField={() => {}}
//         onChangeOption={() => {}}
//         onAddOption={() => {}}
//         onRemoveOption={() => {}}
//         onMarkCorrect={() => {}}
//         onAudioChange={() => {}}
//         onClearAudio={() => {}}
//         onAddImage={() => {}}
//         onRemoveImage={() => {}}
//         onSave={handleQuestionSaved}
//         partNumber={"-"}
//         isEditing={!!editingQuestion}
//         questionIndex={questions.length + 1}
//         loading={false}
//       />

//       <GroupEditModal
//         open={showGroupModal}
//         onClose={() => setShowGroupModal(false)}
//         draftGroup={editingGroup}
//         onChangeGroupField={handleChangeGroupField}
//         onAddImage={handleGroupAddImage}
//         onRemoveImage={handleGroupRemoveImage}
//         onSave={() => handleGroupSaved(editingGroup)}
//         isEditing={!!editingGroup}
//         loading={false}
//       />

//       <QuestionBank
//         open={showBank}
//         onClose={handleBankClose}
//         partNumber={"all"}
//         examId={examId}
//         onQuestionsAdded={handleItemsAddedFromBank}
//         usedBankQuestionIds={questions
//           .filter((q) => q.bankQuestionId != null)
//           .map((q) => q.bankQuestionId)}
//         usedBankGroupIds={groups
//           .filter((g) => g.bankGroupId != null)
//           .map((g) => g.bankGroupId)}
//       />
//     </div>
//   );
// }
