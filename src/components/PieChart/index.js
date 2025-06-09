import { Pie } from "@ant-design/plots";
import "./PieChart.scss";
import { MdHeight } from "react-icons/md";
export default function PieChart(props) {
  const { data } = props;
  console.log("PieChart data", data?.value);
  const config = {
    data: data?.value || [],
    height: 470,
    angleField: "attemps",
    colorField: "test",
    label: {
      text: "test",
      style: {
        fontWeight: "bold",
      },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };

  return (
    <>
      <div className="PieChart">
        <Pie {...config} />
      </div>
    </>
  );
}
