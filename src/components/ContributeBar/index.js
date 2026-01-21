import React from "react";
import { Checkbox, Button } from "antd";
import "./ContributeBar.scss";

export default function ContributeBar({
  totalCount = 0,
  checkedCount = 0,
  checkAll = false,
  indeterminate = false,
  onCheckAllChange,
  onContribute,
}) {
  if (totalCount === 0) return null;

  return (
    <div className="contribute-bar">
      <div className="contribute-content">
        <div className="contribute-bar__left">
          <Checkbox
            indeterminate={indeterminate}
            checked={checkAll}
            onChange={onCheckAllChange}
          >
            Chọn tất cả ({checkedCount})
          </Checkbox>
        </div>

        <div className="contribute-bar__right">
          <span
            className="contribute-bar__count"
            style={{ marginRight: "20px" }}
          >
            Đã chọn: {checkedCount} câu
          </span>

          <Button
            type="primary"
            disabled={checkedCount === 0}
            onClick={onContribute}
            className="contribute-bar__btnContribute"
          >
            Đóng góp vào ngân hàng đề
          </Button>
        </div>
      </div>
    </div>
  );
}
