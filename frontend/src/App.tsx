// React components are used via JSX
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { GameProvider } from './contexts/GameContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const location = useLocation();
  const isGamePage = location.pathname.startsWith('/game/');
  const isLoginPage = location.pathname === '/login';

  // 游戏页面使用全屏布局
  if (isGamePage) {
    return (
      <ErrorBoundary>
        <ConfigProvider locale={zhCN}>
          <GameProvider>
            <div className="game-layout">
              <Outlet />
            </div>
          </GameProvider>
        </ConfigProvider>
      </ErrorBoundary>
    );
  }

  // 登录页面使用简单布局
  if (isLoginPage) {
    return (
      <ErrorBoundary>
        <ConfigProvider locale={zhCN}>
          <div className="login-layout">
            <Outlet />
          </div>
        </ConfigProvider>
      </ErrorBoundary>
    );
  }

  // 其他页面使用标准布局
  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <GameProvider>
          <Layout className="app-layout">
            <Header className="app-header">
              <div className="logo">
                物业管理系统
              </div>
            </Header>
            <Content className="app-content">
              <Outlet />
            </Content>
          </Layout>
        </GameProvider>
      </ConfigProvider>
    </ErrorBoundary>
   );
}

export default App;
