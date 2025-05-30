# 物业管理模拟器前端

这是物业管理模拟器项目的前端部分，使用React、TypeScript和Vite构建。

## 开发环境设置

### 前提条件

- Node.js (推荐v18或更高版本)
- npm或yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:5173/wg2026/ 启动

## 构建项目

```bash
npm run build
```

构建后的文件将位于`dist`目录中。

## 部署到GitHub Pages

### 自动部署

项目已配置为可以轻松部署到GitHub Pages：

1. 确保`package.json`中的`homepage`字段已设置为你的GitHub Pages URL
   ```json
   "homepage": "https://lianbing22.github.io/wg2025-1"
   ```

2. 运行部署命令：
   ```bash
   npm run deploy
   ```

3. 这将自动构建项目并将`dist`目录推送到`gh-pages`分支

4. 在GitHub仓库设置中，确保GitHub Pages的源设置为`gh-pages`分支

### 路由注意事项

- 项目使用`/wg2026/`作为基础路径
- 所有路由都应该以`/wg2026/`开头
- 已添加`404.html`文件处理客户端路由刷新问题

## 项目结构

- `src/` - 源代码
  - `assets/` - 静态资源
  - `components/` - 可复用组件
  - `contexts/` - React上下文
  - `pages/` - 页面组件
  - `routes/` - 路由配置
  - `services/` - API服务
  - `styles/` - 全局样式
  - `types/` - TypeScript类型定义

## 技术栈

- React
- TypeScript
- Vite
- React Router
- Ant Design
