import './App.css';
import AppRoutes from './routes';
import { Layout } from 'antd';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', textAlign: 'center' }}>物业管理模拟器 MVP</Header>
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
