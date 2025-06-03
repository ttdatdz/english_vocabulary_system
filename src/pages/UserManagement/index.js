import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoEye } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import BaseTable from "../../components/BaseTable";
import "./UserManagement.scss";
import { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import DetailUserForm from "../../components/DetailUserForm";
import { confirmDelete } from "../../utils/alertHelper";
import { GetAllUsers } from "../../services/User/userService";

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null); // lấy thông tin người dùng đưa vào modal
  const [open, setOpen] = useState(false); // mở modal
  const [confirmLoading, setConfirmLoading] = useState(false); // loading khi bấm ok trong modal
  const [allUsers, setAllUsers] = useState([]);
  const [listUsers, setListUsers] = useState([]);
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
      title: "Số thứ tự",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
    },
    {
      title: "Đia chỉ",
      dataIndex: "address",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="Action">
          <IoEye className="Action__Detail" onClick={() => showModal(record)} />
          <MdDelete
            className="Action__Delete"
            onClick={() => confirmDelete()}
          />
        </div>
      ),
    },
  ];
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await GetAllUsers();
        setAllUsers(res);
        setListUsers(res);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
      }
    };
    fetchUsers();
  }, []);
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (searchValue) {
      const filteredUsers = allUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchValue) ||
          user.phoneNumber.includes(searchValue)
      );
      setListUsers(filteredUsers);
    } else {
      setListUsers(allUsers); // Reset lại danh sách hiển thị, không cần gọi lại API
    }
  };
  return (
    <>
      <h2 className="PageTitle">User Management</h2>
      <Input
        className="SearchBar"
        suffix={<SearchOutlined />}
        placeholder="Nhập tên hoặc số điện thoại cần tìm"
        allowClear
        onChange={handleSearch}
      />
      <BaseTable columns={columns} data={listUsers} onChange={onChange} />

      <BaseModal
        open={open}
        onCancel={handleClose}
        title={
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            Chi tiết người dùng
          </div>
        }
      >
        {selectedUser ? (
          <DetailUserForm
            onOk={handleOk}
            confirmLoading={confirmLoading}
            selectedUser={selectedUser}
          />
        ) : null}
      </BaseModal>
    </>
  );
}
