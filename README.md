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

有两种部署模式：**SSR 全功能**（需要服务器，支持留言 / 同学录）和**静态只读**（GitHub Pages，仅浏览）。

### 模式一：SSR 全功能（推荐用于聚会现场）

需要一台 Linux 服务器（推荐 2GB+ 内存，Node 22+）。

#### 方式 A：GitHub Actions 预构建（适合低内存服务器）

如果服务器内存不足以运行 `pnpm build`（Nitro Rollup 打包步骤需要 ~3GB），可以让 GitHub Actions 在 7GB runner 上构建，服务器只需下载运行：

1. 推送到 `main` 分支会自动触发 `Build SSR Server` 工作流
2. 构建产物发布为 GitHub Release（tag: `server-latest`）
3. 在服务器上运行部署脚本：

```bash
# 首次：克隆仓库（只需要 scripts/ 目录）
git clone https://github.com/fuyans/forever2006.git
cd forever2006

# 创建数据持久化目录（留言、同学录、上传的照片不会因重新部署丢失）
mkdir -p ~/forever2006/data/.store ~/forever2006/data/uploads/people

# 创建环境变量文件
cat > ~/forever2006/.env << 'EOF'
NUXT_SITE_PASSWORD=你的密码
NUXT_ADMIN_PASSWORD=管理员密码
PORT=2006
HOST=0.0.0.0
EOF

# 部署
./scripts/deploy-server.sh
```

脚本会：下载构建 → 安装生产依赖（sharp 原生模块）→ 软链接持久化数据 → 更新 `current` 符号链接。

启动：

```bash
# 方式一：直接运行
cd ~/forever2006/current
node .output/server/index.mjs

# 方式二：systemd（推荐生产环境，自动重启）
sudo cp scripts/forever2006.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now forever2006
```

更新部署：再次运行 `./scripts/deploy-server.sh`，数据自动迁移。

回滚：`ln -sfn ~/forever2006/releases/<旧时间戳> ~/forever2006/current`

#### 方式 B：服务器本地构建（内存充足时）

```bash
pnpm install
pnpm build
node .output/server/index.mjs
```

#### 防火墙 / 安全组

```bash
# CentOS firewalld
sudo firewall-cmd --permanent --add-port=2006/tcp
sudo firewall-cmd --reload

# 或用 nginx 反向代理到 3000 端口（推荐，可加 HTTPS）
```

#### 环境变量

| 变量 | 作用 | 默认值 |
|------|------|--------|
| `NUXT_SITE_PASSWORD` | 进入网站的密码 | `qiushi2026` |
| `NUXT_ADMIN_PASSWORD` | 管理员密码 | `admin-2006` |
| `PORT` | 服务端口 | `3000`（Nitro 默认） |
| `HOST` | 绑定地址 | `0.0.0.0` |

**上线前务必改密码。**

#### 数据持久化

| 路径 | 内容 | 必须可写 |
|------|------|----------|
| `.store/messages.json` | 留言簿数据 | ✅ |
| `.store/people.json` | 同学录数据 | ✅ |
| `public/uploads/people/` | 上传的照片（WebP） | ✅ |
| `content/memories/` | 记忆素材（照片 / 视频） | 只读 |

重新部署时确保 `.store/` 和 `public/uploads/` 不被覆盖。`deploy-server.sh` 已通过符号链接处理。

### 模式二：静态只读（GitHub Pages）

仅时间线 + 相册 + 音乐，**无密码、无留言、无同学录上传**。适合公开分享。

```bash
pnpm generate            # 生成 .output/public/
npx serve .output/public # 本地预览
```

GitHub Pages 自动部署：推送到 `main` 触发 `Deploy to GitHub Pages` 工作流，部署到 `https://fuyans.github.io/forever2006/`。

### 国内访问注意事项

所有外部资源已本地化，无任何 Google / CDN 依赖：

- **字体**：通过 `@fontsource` 本地自托管（非 Google Fonts CDN）
- **图标**：通过 `@iconify-json/*` 本地打包（非 Iconify API）
- **视频**：仅支持 Bilibili 嵌入和本地文件（**不支持 YouTube**——国内被墙）
- **远程字体提供商**：`@nuxt/fonts` 的 google / bunny / fontsource / googleicons 全部禁用

`nuxt.config.ts` 中的 `fonts.providers` 配置确保不会向 `fonts.googleapis.com` 等域名发请求（否则国内会卡 ~10 秒超时）。

## 脚本

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 (localhost:2006) |
| `pnpm build` | 全功能生产构建（SSR） |
| `pnpm generate` | 静态站点生成（只读） |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | 代码检查 |
