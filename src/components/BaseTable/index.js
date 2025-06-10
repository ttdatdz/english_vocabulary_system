import { Table } from "antd";
import "./BaseTable.scss";
export default function BaseTable(props) {
  const { columns, data, onChange, pagination, rowKey } = props;
  return (
    <>
      <>
        <Table
          className="BaseTable"
          columns={columns}
          dataSource={data}
          onChange={onChange}
          pagination={pagination}
          rowKey={rowKey}
        />
      </>
    </>
  );
}
