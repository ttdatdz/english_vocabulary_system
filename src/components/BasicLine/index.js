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
  const defaultStart = today.subtract(29, "day"); // 30 ngày gần nhất
  const [dateRange, setDateRange] = useState([defaultStart, today]); // dùng để fetch API
  const [tempRange, setTempRange] = useState([defaultStart, today]); // hiển thị trên RangePicker
  const [rawInput, setRawInput] = useState([]); // giữ thứ tự người dùng nhập
  const [showData, setShowData] = useState([]);

  const validateDateRange = (start, end, rawStart, rawEnd) => {
    if (rawStart && rawEnd && rawStart.isAfter(rawEnd)) {
      showErrorMessage("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return false;
    }

    const diffDays = end.diff(start, "day");
    if (diffDays > 30) {
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

  const onDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;
    const [start, end] = dates;
    setTempRange(dates); // luôn hiển thị theo RangePicker
    const [rawStart, rawEnd] = rawInput;

    if (validateDateRange(start, end, rawStart, rawEnd)) {
      setDateRange(dates); // chỉ update khi hợp lệ
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
          onCalendarChange={(dates) => {
            setRawInput(dates); // giữ thứ tự thật
          }}
          onChange={onDateChange}
          format="YYYY-MM-DD"
          allowClear={false}
          disabledDate={(current) => current && current > today}
        />
      </div>
      <Line {...config} />
    </div>
  );
}
