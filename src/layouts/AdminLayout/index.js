import { Layout } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import "./AdminLayout.scss";
import Sider from 'antd/es/layout/Sider';
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from "@ant-design/icons";
import { useState } from 'react';
import logo from "../../assets/images/logo.jpg";
import logo_fold from "../../assets/images/logo_fold.png"
import MenuSider from '../../components/MenuSider';
import { Outlet } from 'react-router-dom';
import AccountAvatar from '../../components/AccountAvatar';


function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const handleCollapse = () => {
        setCollapsed(!collapsed);
    }
    return (
        <>
            <Layout >
                <Header className='Header' >
                    <div className={'Header__logo ' + (collapsed && "Header__logo--collapsed")}>
                        <img src={collapsed ? logo_fold : logo} alt="Logo" className={"Header__imgLogo " + (collapsed && "Header__imgLogo--collapsed")} />
                    </div>
                    <div className='Header__Nav'>
                        <div className='Header__Nav-left'>
                            <div className='Header__collapse' onClick={handleCollapse}>
                                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </div>
                        </div>
                        <div className='Header__Nav-right'>
                            <div className='Header__account-avatar'>
                                <AccountAvatar />
                            </div>
                        </div>
                    </div>
                </Header>
                <Layout>
                    <Sider className='Sider' width={230} theme="light" collapsed={collapsed}>
                        <MenuSider collapsed={collapsed} />
                    </Sider>
                    <Content className='Content'>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout >
        </>
    );
}
export default AdminLayout;