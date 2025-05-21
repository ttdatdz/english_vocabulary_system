import { Button } from "antd";
import "./BtnDetail.scss";

export default function BtnDetail(props) {
    const { onClick } = props;
    return (
        <Button onClick={onClick} className='btnDetail'>Chi tiết</Button>
    );
}