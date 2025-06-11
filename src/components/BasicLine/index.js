import "./BasicLine.scss";
import { Line } from "@ant-design/plots";
import { DatePicker, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { GetAttemptcountPerDay } from "../../services/DashBoard/dashBoardService";
import { showErrorMessage } from "../../utils/alertHelper";

const { RangePicker } = DatePicker;

export default function BasicLine() {
  const today = dayjs();
  const defaultStart = today.subtract(29, "day");

  const [dateRange, setDateRange] = useState([defaultStart, today]); // data fetch
  const [tempRange, setTempRange] = useState([defaultStart, today]); // UI display
  const [rawInput, setRawInput] = useState([defaultStart, today]); // lưu input thô
  const [showData, setShowData] = useState([]);

  const validateDateRange = (start, end) => {
    if (!dayjs.isDayjs(start) || !dayjs.isDayjs(end)) {
      return false;
    }

    if (start.isAfter(end)) {
      showErrorMessage("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return false;
    }

    if (end.diff(start, "day") > 30) {
      showErrorMessage("Chỉ được chọn tối đa 30 ngày");
      return false;
    }

    if (end.isAfter(today, "day")) {
      showErrorMessage("Ngày kết thúc không được vượt quá hôm nay");
      return false;
    }

    return true;
  };

  const fetchData = async (start, end) => {
    try {
      const res = await GetAttemptcountPerDay(
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD")
      );
      const formattedData = res.map((item) => ({
        year: item.date,
        value: item.count,
      }));
      setShowData(formattedData);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu biểu đồ");
    }
  };

  useEffect(() => {
    const [start, end] = dateRange;
    fetchData(start, end);
  }, [dateRange]);

  const handleCalendarChange = (dates) => {
    if (
      Array.isArray(dates) &&
      dayjs.isDayjs(dates[0]) &&
      dayjs.isDayjs(dates[1])
    ) {
      setRawInput(dates);
    }
  };

  const handleDateChange = (dates) => {
    if (
      !Array.isArray(dates) ||
      !dayjs.isDayjs(dates[0]) ||
      !dayjs.isDayjs(dates[1])
    ) {
      return;
    }

    const [start, end] = dates;

    setTempRange(dates); // UI sẽ luôn phản ánh chọn hiện tại

    if (validateDateRange(start, end)) {
      setDateRange(dates); // chỉ update data nếu hợp lệ
    }
  };

  const config = {
    data: showData,
    xField: "year",
    yField: "value",
    height: 470,
    point: {
      shapeField: "square",
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };

  return (
    <div className="LineChart">
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <RangePicker
          value={tempRange}
          onCalendarChange={handleCalendarChange}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          allowClear={false}
          disabledDate={(current) => current && current > today}
        />
      </div>
      <Line {...config} />
    </div>
  );
}
