# 如何添加一条记忆

每一条记忆 = 一个文件夹。不需要写代码，不需要重启服务。

## 1. 新建文件夹

在 `content/memories/` 下新建一个文件夹。

**命名规则：** `YYYYMMDD-简短英文名`

```
20030901-first-day
20031115-sports-day
20160620-ten-years
```

- 前 8 位是日期（年月日）
- 后面是简短描述（英文、无空格、用 `-` 连接）

## 2. 写 index.md

文件夹里一定要有一个 `index.md`，内容分两块：

**上半块（YAML 元数据）：**

```yaml
---
title: 开学第一天        # 标题（必填）
period: 2003年 秋        # 显示在时间线上的副标题/时间
category: milestone      # 分类（选填，默认 milestone）
---
```

**下半块（正文）：**

```md
新校服，新走廊，新面孔。我们三年旅程开始的那一天。
```

> 正文就是该记忆的描述文字，会显示在时间线卡片上。

### category 可选值

| 值 | 显示 | 什么时候用 |
|----|------|-----------|
| `milestone` | 里程碑 | 开学、毕业、重要节点 |
| `event` | 活动 | 运动会、晚会、比赛 |
| `trip` | 出游 | 春游、秋游、旅行 |
| `memory` | 回忆 | 日常片段、说不清类型的记忆 |
| `reunion` | 重聚 | 毕业后的聚会 |

## 3. 放照片

直接把图片文件（`.jpg` `.png` `.webp` `.svg` `.gif`）拖进文件夹。**任意命名。**

```
20030901-first-day/
  index.md
  cover.svg         ← 时间线卡片上的封面图（如果你有多个图片，排第一个的就是封面）
  hallway.svg       ← 另一张，会出现在相册里
  gates.svg         ← 又一张
```

## 4. 给照片配说明（选填）

如果想给某张照片加说明文字，建一个**同名 `.md` 文件**：

```
20030901-first-day/
  hallway.svg       ← 照片
  hallway.md        ← 该照片的说明
```

`hallway.md` 的内容就是说明文字，比如：

```
204教室——我们的班。此后三年，每天早上都在这里。
```

## 5. 放视频

### 方式一：本地视频文件

直接把 `.mp4` `.mov` `.webm` `.m4v` 拖进文件夹，和照片一样。

> 注：视频文件比较大，建议压缩后再放（控制在几十 MB 以内）。

### 方式二：YouTube / Bilibili 链接

在 `index.md` 的 YAML 里加 `videos` 字段：

```yaml
---
title: 元旦晚会
period: 2004年 冬
category: event
videos:
  - src: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    caption: 才艺表演片段
  - src: https://www.bilibili.com/video/BV1xx411c7mD
    caption: 另一个视频
---
```

两种方式可以混用。

## 完整示例

```
content/memories/20030901-first-day/
  index.md            ← 必须
  cover.svg           ← 照片
  hallway.svg         ← 照片
  hallway.md          ← 照片说明（选填）
  clip.mp4            ← 视频（选填）
  clip.md             ← 视频说明（选填）
```

`index.md`：

```md
---
title: 开学第一天
period: 2003年 秋
category: milestone
---

新校服，新走廊，新面孔。我们三年旅程开始的那一天。
```

放好文件，刷新页面——时间线和相册自动更新，不需要重启。
