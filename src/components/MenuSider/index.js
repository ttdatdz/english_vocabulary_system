import { DashboardOutlined, UserOutlined } from "@ant-design/icons";
import { IoNewspaperOutline } from "react-icons/io5";
import { HiOutlineServerStack } from "react-icons/hi2";
import { BiCategory } from "react-icons/bi";
import { GoStack } from "react-icons/go";
import { Menu } from "antd";
import "./MenuSider.scss";
import { Link } from "react-router-dom";
export default function MenuSider(props) {
  const { collapsed } = props;
  const items = [
    {
      key: "sub1",
      label: <Link to={"DashBoard"}>DashBoard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: "sub2",
      label: <Link to={"UserManagement"}>User Management</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "sub3",
      label: <Link to={"ToeicTestManagement"}>Toeic Test Management</Link>,
      icon: <HiOutlineServerStack />,
    },
    {
      key: "sub4",
      label: <Link to={"BlogManagement"}>Blog Management</Link>,
      icon: <IoNewspaperOutline />,
    },
    {
      key: "sub5",
      label: <Link to={"BlogCategoryManagement"}>Category Management</Link>,
      icon: <BiCategory style={{ fontSize: "15px" }} />,
    },
    {
      key: "sub6",
      label: <Link to={"TestSetManagement"}>Test Set Management</Link>,
      icon: <GoStack style={{ fontSize: "15px" }} />,
    },
  ];
  return (
    <Menu
      // onClick={onClick}
      style={{ width: 230 }}
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      mode="inline"
      items={items}
      className={collapsed && "MenuSider--collapsed"}
    />
  );
}
