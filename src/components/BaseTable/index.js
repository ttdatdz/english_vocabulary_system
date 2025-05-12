import { Button, Space, Table } from "antd";
import "./BaseTable.scss";
export default function BaseTable(props) {
    const { columns, data, onChange } = props;
    return (
        <>
            <>
                <Table className="BaseTable" columns={columns} dataSource={data} onChange={onChange} />
            </>
        </>
    )
}