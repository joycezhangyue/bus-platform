# 碳资产公司公车保障平台

一个具备完整后端服务的全栈公车行程管理系统，支持数据实时同步和跨设备访问。

## 技术架构

- **前端**：React 18 + Vite + Tailwind CSS + Lucide Icons
- **后端**：Express + SQLite + Server-Sent Events (SSE)
- **实时同步**：SSE 长连接推送，所有客户端数据实时一致

## 核心功能

| 功能 | 说明 |
|------|------|
| 行程管理 | 添加/修改/删除公车行程 |
| 跨天行程 | 支持出发→返回跨天覆盖，自动显示途中/出发/返回状态 |
| 确认状态 | 已确认（王勇淡黄/刘平淡绿） vs 待确认（浅红警示） |
| 实时同步 | SSE 推送，任何修改即时同步到所有打开页面 |
| 统计看板 | 王勇/刘平行程数、待确认/已确认统计 |
| 动态背景 | 粒子动画背景，鼠标交互 |
| 响应式布局 | 支持桌面和移动端 |

## 数据模型

```
Trip {
  id: string          // 唯一标识
  driver: "王勇" | "刘平"
  destination: string  // 目的地
  passenger: string   // 乘车人
  departureDay: "周一"~"周日"
  departureTime: "HH:MM"
  returnDay?: "周一"~"周日"    // 可选
  returnTime?: "HH:MM"        // 可选
  confirmed: boolean   // 是否确认
  note?: string       // 备注
}
```

## 运行方式

### 方式一：本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动前后端（并行）
npm run dev

# 前端: http://localhost:3000
# 后端: http://localhost:3001
```

### 方式二：生产部署（本地或服务器）

```bash
# 1. 构建前端
npm run build

# 2. 启动后端（自动提供前端静态文件）
PORT=3001 npm start

# 访问: http://localhost:3001
```

### 方式三：Docker 部署

```bash
# 1. 构建镜像
docker build -t bus-platform .

# 2. 运行容器
docker run -d -p 3001:3001 -v $(pwd)/server/data:/app/server/data bus-platform

# 或使用 docker-compose
docker-compose up -d
```

### 方式四：部署到免费 PaaS（推荐）

**Render**（推荐）：
1. 注册 [render.com](https://render.com)
2. 新建 Web Service
3. 连接 GitHub 仓库
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. 免费额度：每月 750 小时

**Railway**（推荐）：
1. 注册 [railway.app](https://railway.app)
2. 从 GitHub 导入项目
3. 自动检测 Node.js 项目并部署
4. 免费额度：每月 $5 等值

**Fly.io**：
1. 注册 [fly.io](https://fly.io)
2. 安装 flyctl: `brew install flyctl`
3. `fly launch` 自动部署
4. 免费额度：每月 160GB 出站流量

## 数据持久化

数据存储在 SQLite 数据库中，位于 `server/data/trips.db`。建议使用 Docker 卷挂载或云存储备份，防止数据丢失。

## 实时同步原理

```
客户端 A 修改行程
  → POST /api/trips
  → 服务端更新 SQLite
  → 广播 SSE 事件到所有连接的客户端
  → 客户端 B/C/D 自动收到更新，UI 刷新
```

所有客户端无需刷新页面，数据即时同步。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3001 | 后端服务端口 |
| NODE_ENV | development | 环境模式 |

## 项目结构

```
bus-platform/
├── server/
│   ├── index.js          # Express 后端入口
│   └── data/
│       └── trips.db      # SQLite 数据库
├── dist/                  # 构建后的前端文件
├── src/
│   ├── components/        # React 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── pages/            # 页面
│   └── types/            # TypeScript 类型
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```