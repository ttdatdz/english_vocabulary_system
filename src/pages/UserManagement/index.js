import { Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import './UserManagement.scss';
import { useState } from "react";
import BaseModal from "../../components/BaseModal";

export default function UserManagement() {
    const [selectedUser, setSelectedUser] = useState(null); // lấy thông tin người dùng đưa vào modal
    const [open, setOpen] = useState(false); // mở modal
    const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
    const showModal = (record) => {
        setSelectedUser(record);
        setOpen(true);
    };
    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
    };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Chinese Score',
            dataIndex: 'chinese',
            sorter: {
                compare: (a, b) => a.chinese - b.chinese,
                multiple: 3,
            },
        },
        {
            title: 'Math Score',
            dataIndex: 'math',
            sorter: {
                compare: (a, b) => a.math - b.math,
                multiple: 2,
            },
        },
        {
            title: 'English Score',
            dataIndex: 'english',
            sorter: {
                compare: (a, b) => a.english - b.english,
                multiple: 1,
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div className="Action">
                    <IoEye className="Action__Detail" onClick={() => showModal(record)} />
                    <MdDelete className="Action__Delete" />
                </div>
            ),
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            chinese: 98,
            math: 60,
            english: 70,
        },
        {
            key: '2',
            name: 'Jim Green',
            chinese: 98,
            math: 66,
            english: 89,
        },
        {
            key: '3',
            name: 'Joe Black',
            chinese: 98,
            math: 90,
            english: 70,
        },
        {
            key: '4',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89,
        },
        {
            key: '5',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89,
        },
        {
            key: '6',
            name: 'Jim Red',
            chinese: 88,
            math: 99,
            english: 89,
        },

    ];
    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    return (
        <>
            <h2 className="Title">UserManagement</h2>
            <Input className="Seach_Bar" suffix={<SearchOutlined />} placeholder="Nhập tên hoặc số điện thoại cần tìm" allowClear />
            <BaseTable columns={columns} data={data} onChange={onChange} />

            <BaseModal open={open} onCancel={handleClose} onOk={handleOk} confirmLoading={confirmLoading}
                title="Chi tiết người dùng">
                {selectedUser ? (
                    <div>
                        <p><strong>Tên:</strong> {selectedUser.name}</p>
                        <p><strong>Chinese:</strong> {selectedUser.chinese}</p>
                        <p><strong>Math:</strong> {selectedUser.math}</p>
                        <p><strong>English:</strong> {selectedUser.english}</p>
                    </div>
                ) : null}
            </BaseModal>

        </>
    )
}