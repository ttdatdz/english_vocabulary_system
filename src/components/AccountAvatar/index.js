import { Link } from "react-router-dom";
import { Dropdown, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { MdExitToApp } from "react-icons/md";
import "./AccountAvatar.scss";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import DefaultImage from '../../../src/assets/images/user.png';

export default function AccountAvatar() {
  const { logout, user } = useAuth(); // Loại bỏ fetchUser khỏi dependency
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const items = [
    {
      label: (
        <Link to="PersonalInformation">
          <div className="Item-Dropdown">
            <UserOutlined className="Item-Dropdown__icon" />
            Thông tin cá nhân
          </div>
        </Link>
      ),
      key: "0",
    },
    {
      label: (
        <div className="Item-Dropdown" onClick={handleLogout}>
          <MdExitToApp className="Item-Dropdown__icon" />
          Đăng xuất
        </div>
      ),
      key: "1",
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <a className="AccountAvatar" onClick={(e) => e.preventDefault()}>
        <img
          className="AccountAvatar__img"
          src={
            user?.avatar ||
            DefaultImage
          }
          alt="Avatar"
        />
      </a>
    </Dropdown>
  );
}
