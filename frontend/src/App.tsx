import './App.css';
import AppRoutes from './routes';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation

const { Header, Content, Footer } = Layout;

function App() {
  const location = useLocation(); // Get current location for active menu item

  // Determine selected keys based on current path
  const getSelectedKeys = () => {
    if (location.pathname.startsWith('/properties')) {
      return ['/properties'];
    }
    if (location.pathname === '/') {
      return ['/'];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ color: 'white', marginRight: '24px', fontSize: '1.2em' }}>物业管理模拟器 MVP</div>
        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeys()} style={{ flex: 1 }}>
          <Menu.Item key="/">
            <Link to="/">仪表盘</Link>
          </Menu.Item>
          <Menu.Item key="/properties">
            <Link to="/properties">物业列表</Link>
          </Menu.Item>
          {/* Add more navigation items here */}
        </Menu>
      </Header>
      <Content style={{ padding: '20px 50px' }}>
        <AppRoutes />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        物业管理模拟器 ©{new Date().getFullYear()} Created by Trae AI
      </Footer>
    </Layout>
  );
}

export default App;
