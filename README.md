# 求实中学东校 · 2006届一班 · 二十周年纪念站

密码保护的同学纪念站，记录我们 2003–2006 的初中时光和毕业后的每一次重聚。
功能包括：时间线、相册、同学录、留言簿、背景音乐。

[Nuxt UI](https://ui.nuxt.com) + [Nuxt Content](https://content.nuxt.com) 构建。

## 快速开始

```bash
pnpm install
cp .env.example .env   # 编辑 .env 设置密码
pnpm dev               # http://localhost:2006
```

打开后自动跳转到登录页。输入 `NUXT_SITE_PASSWORD` 进入。

## 配置

所有密钥在 `.env`（git 忽略）：

| 变量 | 作用 | 默认值 |
|------|------|--------|
| `NUXT_SITE_PASSWORD` | 进入网站的密码 | `qiushi2026` |
| `NUXT_ADMIN_PASSWORD` | 管理员密码（管理留言簿 / 编辑同学录） | `admin-2006` |
| `NUXT_PUBLIC_SITE_URL` | 公共 URL（OG 图片用） | _(空)_ |

**上线前务必改密码**，站内密码只分享给同学。

## 页面结构

| 路由 | 功能 |
|------|------|
| `/` | 首页 · 时间线 |
| `/album` | 相册（按年份 / 类型 / 类别筛选） |
| `/people` | 同学录（带照片上传） |
| `/guestbook` | 留言簿（便签墙） |
| `/admin` | 管理（不在导航中，需管理员密码） |
| `/login` | 登录 |

## 添加记忆（无需写代码）

参见 [`content/memories/README.md`](./content/memories/README.md)。

核心操作：在 `content/memories/` 下新建一个 `YYYYMMDD-名称` 文件夹，放入 `index.md` 和照片即可。刷新页面自动显示。

## 管理员功能

访问 `/people`（同学录），点击页面底部的「管理员入口」，输入管理员密码解锁后：

- 编辑 / 删除任意同学卡片
- 访问 `/admin` 管理留言簿消息

## 背景音乐

把 `.mp3` 或 `.m4a` 文件放到 `public/music/`。支持多首——播放器自动生成歌单，播完切下一首。见 [`public/music/README.md`](./public/music/README.md)。

## 留言簿

留言存储在 `.store/messages.json`（自动创建，git 忽略）。站点已密码保护，留言即时显示。防刷机制：每个 IP 每 10 秒一条 + 蜜罐字段。

## 同学录

同学数据存储在 `.store/people.json`。上传的照片经 sharp 自动压缩为 WebP（800px、80% 质量）。

## 数据存储

- `.data/` — 仅 Nuxt Content 内部使用
- `.store/` — 留言簿、同学录 JSON 数据（与 Content 分离，避免互相破坏）
- 上传照片 → `public/uploads/people/`

## 隐私

- 整站密码保护
- `robots.txt` 禁止爬虫，页面带 `noindex`
- 照片中的人当时均未成年——谨慎发布，允许同学要求删除

## 生产部署

需要运行中的服务器（密码中间件 + 留言簿 API 需要），不能纯静态托管。

```bash
pnpm build
node .output/server/index.mjs
```

在部署平台设置 `.env` 中的环境变量。确保 `.store/` 可写。无状态 serverless 部署（Vercel 等）需将 JSON 存储换为持久数据库。

## 脚本

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 (localhost:2006) |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | 代码检查 |
