# 项目开发规则 - 物业管理模拟器

本文档定义了物业管理模拟器项目的开发规则和约定，旨在确保代码质量、团队协作效率和项目的可维护性。所有项目成员均需遵守以下规则。

## 1. 代码风格与规范

### 1.1. 通用规范

- **语言**: 主要开发语言为 TypeScript (前端和后端 Node.js)。HTML 和 CSS/SCSS 用于界面。
- **格式化**: 
    - 使用 Prettier 进行代码自动格式化。配置文件 (`.prettierrc`) 将包含具体规则。
    - 遵循一致的缩进（例如，2个空格或4个空格，在 `.prettierrc` 中定义）。
- **命名约定**:
    - **变量和函数**: camelCase (例如, `currentUser`, `calculateTotalAmount`)
    - **类和接口**: PascalCase (例如, `UserService`, `PropertyDetails`)
    - **常量**: UPPER_CASE_SNAKE_CASE (例如, `MAX_USERS`, `API_ENDPOINT`)
    - **文件名**: kebab-case (例如, `user-service.ts`, `property-details.component.tsx`) 或 PascalCase (对于 React/Vue 组件文件，例如 `UserDetails.tsx`)
- **注释**: 
    - 对复杂逻辑、重要函数和公共 API 进行清晰注释。
    - 使用 JSDoc 或 TSDoc 风格进行函数和类注释。
    - 避免不必要的注释，代码应尽可能自解释。
- **模块导入**: 
    - 使用 ES6 模块导入/导出 (`import`/`export`)。
    - 避免使用相对路径进行深层嵌套导入，考虑使用路径别名 (Path Aliases) (例如 `@/components/Button`)。

### 1.2. 前端特定规范 (React/Vue.js)

- **组件结构**: 
    - 遵循所选框架的最佳实践组织组件 (例如，React Hooks, Vue Composition API)。
    - 保持组件单一职责，避免过大的组件。
    - 合理划分展示组件 (Presentational Components) 和容器组件 (Container Components)。
- **状态管理**: 
    - 遵循所选状态管理库 (Redux/Vuex/Zustand) 的模式和最佳实践。
    - 避免直接修改状态，使用定义的 action/mutation。
- **CSS/SCSS**: 
    - 使用模块化 CSS (CSS Modules) 或 CSS-in-JS 方案，或遵循 BEM 命名约定，以避免样式冲突。
    - 优先使用 SCSS 等预处理器以增强样式表的可维护性。

### 1.3. 后端特定规范 (Node.js - Express/NestJS)

- **错误处理**: 
    - 实现统一的错误处理中间件。
    - 使用明确的 HTTP 状态码。
    - 返回结构化的错误响应。
- **异步操作**: 
    - 优先使用 `async/await` 处理异步操作。
    - 妥善处理 Promise rejections。
- **安全性**: 
    - 对所有外部输入进行验证和清理 (Validation and Sanitization)。
    - 防止常见的安全漏洞 (SQL注入, XSS, CSRF 等)。
    - 遵循 OWASP Top 10 安全风险指南。
- **API 设计**: 
    - 遵循 RESTful API 设计原则或 GraphQL 规范。
    - API 版本控制 (例如, `/api/v1/...`)。
    - 提供清晰的 API 文档 (例如, 使用 Swagger/OpenAPI)。

## 2. 版本控制与分支策略 (Git)

- **主分支**: 
    - `main` (或 `master`): 包含稳定、可发布的生产代码。只接受来自 `develop` 分支的合并 (通过 Pull Request)。
    - `develop`: 主要开发分支，包含最新的已开发功能。所有功能分支从 `develop` 创建，并合并回 `develop`。
- **功能分支**: 
    - 命名约定: `feature/<feature-name>` (例如, `feature/user-authentication`) 或 `feat/<feature-name>`。
    - 每个新功能或较大改动应在单独的功能分支上进行开发。
- **修复分支**: 
    - 命名约定: `fix/<issue-description>` (例如, `fix/login-button-bug`) 或 `bugfix/<issue-description>`。
    - 用于修复 `develop` 分支或发布版本中的 bug。
- **发布分支 (可选)**:
    - 命名约定: `release/<version-number>` (例如, `release/1.2.0`)。
    - 用于准备新版本发布，进行最后的测试和 bug 修复。
- **提交信息 (Commit Messages)**:
    - 遵循 Conventional Commits 规范 (例如, `feat: add user login functionality`, `fix: resolve issue with payment processing`)。
    - 提交信息应清晰、简洁，描述本次提交的内容。
    - 格式: `<type>(<scope>): <subject>`
        - `type`: feat, fix, docs, style, refactor, test, chore, etc.
        - `scope`: 可选，指明影响范围 (例如, `feat(auth): ...`)
- **Pull Requests (PRs)**:
    - 所有代码合并到 `develop` 或 `main` 分支必须通过 Pull Request。
    - PR 需要至少一名其他团队成员进行 Code Review。
    - PR 描述应清晰说明改动内容、原因和测试情况。
    - 确保 PR 通过所有 CI/CD 检查 (linting, tests) 后才能合并。

## 3. 测试

- **单元测试**: 
    - 对核心逻辑、工具函数和独立模块编写单元测试。
    - 使用 Jest, Mocha, Chai 或框架自带的测试工具。
    - 目标测试覆盖率 (例如, >80%)。
- **集成测试**: 
    - 测试模块间的交互和 API 端点。
- **端到端测试 (E2E)**: 
    - 使用 Cypress, Playwright 或 Selenium 测试关键用户流程。
- **测试先行 (TDD)**: 鼓励在编写功能代码前先编写测试用例。

## 4. 模块化开发

- **高内聚, 低耦合**: 模块内部功能紧密相关，模块之间依赖尽可能少。
- **明确的接口**: 模块对外暴露清晰、稳定的接口。
- **可复用性**: 设计可被其他部分或未来项目复用的模块。
- **遵循架构设计文档**: 模块的划分和实现应遵循 <mcfile name="architecture_design.md" path="/Volumes/数据盘/项目/wg2025-1/architecture_design.md"></mcfile> 中定义的模块设计。

## 5. 文档

- **架构文档**: <mcfile name="architecture_design.md" path="/Volumes/数据盘/项目/wg2025-1/architecture_design.md"></mcfile> 作为项目整体架构的指导。
- **API 文档**: 后端 API 应有详细的文档 (Swagger/OpenAPI)。
- **代码注释**: 如 1.1 节所述。
- **README.md**: 项目根目录及重要模块目录应包含 `README.md`，说明项目设置、构建、运行和部署方法。

## 6. 依赖管理

- **包管理器**: 使用 npm 或 yarn (根据项目初始化选择，保持一致)。
- **依赖版本**: 
    - 使用 `package-lock.json` 或 `yarn.lock` 锁定依赖版本。
    - 定期审查和更新依赖，注意安全漏洞。
- **最小化依赖**: 仅添加必要的依赖，避免不必要的包引入。

## 7. 环境配置

- **环境变量**: 使用 `.env` 文件管理不同环境 (开发、测试、生产) 的配置。
- **`.env.example`**: 提供一个 `.env.example` 文件作为环境变量配置模板。
- **敏感信息**: 不得将密码、API 密钥等敏感信息硬编码或提交到版本控制系统。

## 8. 审查与沟通

- **Code Review**: 所有代码变更必须经过 Code Review。
- **定期会议**: 定期举行项目同步会议，讨论进度、问题和计划。
- **任务管理**: 使用项目管理工具 (如 Jira, Trello, GitHub Issues) 跟踪任务和 bug。

---
*本文档将根据项目进展和团队反馈持续更新。*