import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.tsx'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
