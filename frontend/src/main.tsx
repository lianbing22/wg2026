import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { router } from './routes/index.tsx'
import { GameProvider } from './contexts/GameContext'
import { optimizeUX } from './utils/ux-optimizer'
import './styles/design-tokens.css'
import './index.css'

// 处理GitHub Pages的重定向
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  
  if (redirect) {
    // 移除重定向参数并导航到目标路径
    const targetPath = redirect.startsWith('/') ? redirect : '/' + redirect;
    window.history.replaceState(null, '', targetPath);
  }
})();

// 初始化用户体验优化
optimizeUX();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <ConfigProvider locale={zhCN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </GameProvider>
  </StrictMode>,
)
