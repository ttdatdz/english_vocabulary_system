import { useState } from "react";
import "./ListPartSection.scss";
import SelectField from "../SelectField";

export default function ListPartSection({ hasCheckbox, parts, activeTab }) {
  const [checkedParts, setCheckedParts] = useState({});
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  // Hàm xử lý khi click vào part-card
  const handlePartClick = (partNumber) => {
    if (hasCheckbox) {
      setCheckedParts((prev) => ({
        ...prev,
        [partNumber]: !prev[partNumber], // Đảo trạng thái
      }));
    }
  };

  // Mảng các lựa chọn thời gian
  const practiceTimes = Array.from({ length: 27 }, (_, i) => {
    const minutes = (i + 1) * 5;
    return {
      value: minutes,
      label: `${minutes} phút`,
    };
  });

  return (
    <div className="list-part-section">
      {parts.map((part) => (
        <div
          className="part-card"
          key={part.number}
          onClick={() => handlePartClick(part.number)} // Thêm sự kiện click
          style={{ cursor: hasCheckbox ? "pointer" : "default" }} // Thay đổi cursor khi có checkbox
        >
          <div className="part-card__header">
            {hasCheckbox && (
              <input
                type="checkbox"
                checked={checkedParts[part.number] || false}
                onChange={() => {}} // Cần có để tránh warning
                onClick={(e) => e.stopPropagation()} // Ngăn sự kiện nổi bọt
              />
            )}
            <span>
              {part.title} ({part.questions} câu hỏi)
            </span>
          </div>
        </div>
      ))}

      {/* Phần còn lại giữ nguyên */}
      {activeTab === 1 ? (
        <>
          <div className="list-part-section__note">
            Thời gian luyện tập (để trống để không giới hạn thời gian)
          </div>
          <div style={{ width: "100%" }}>
            <SelectField
              style={{ width: "100%", height: "40px" }}
              defaultValue="Chọn thời gian"
              onChange={handleChange}
              options={practiceTimes}
            />
          </div>
        </>
      ) : (
        <div className="list-part-section__note">
          Lưu ý: Khi làm full test sẽ không được chọn thời gian, bạn nên giành
          120 phút làm bài để có kết quả tốt nhất
        </div>
      )}
    </div>
  );
}
