# 平台 SDK 适配层

Clever SDK 通过为各小程序/快游戏/H5/原生APP平台提供统一的 API 接口。每个平台对应一个适配器类，继承自基类 `CleverSdk`，实现平台特定的登录、广告、分享等功能。

## 架构概述

```
CleverSdk (基类)
├── platformMini/
│   ├── WeChatSdk      微信小游戏
│   ├── DouyinSdk      抖音小游戏
│   ├── TiktokSdk      TikTok小游戏
│   ├── KuaiShouSdk    快手小游戏
│   ├── HuaweiSdk      华为快游戏
│   ├── OppoSdk        OPPO 小游戏
│   └── BilibiliSdk    B 站小游戏
├── platformH5/
│   ├── AdSenseSdk     Google AdSense H5
│   ├── AhagameSdk     传音 Ahagame H5
│   ├── MiniGameSDK    微游 Minigame H5
│   └── MockSdk        开发测试 Mock
└── platformNative/
    └── M4399Sdk       4399 APK 原生
```

所有平台适配器共享相同的接口签名，开发者通过统一 API 调用，SDK 内部自动路由到对应平台的实现。

## 完整目录

### 小游戏平台
- **[微信小游戏](./platformMini/wechat.md)** — wx 全局对象，支持登录、激励视频、Banner 广告、分享、用户信息
- **[抖音小游戏](./platformMini/douyin.md)** — dy 全局对象，支持登录、激励视频、Banner 广告、分享、侧边栏、桌面快捷方式
- **[TikTok 小游戏](./platformMini/tiktok.md)** — TTMinis 全局对象，支持登录、授权、激励视频、Banner 广告、插屏广告、分享、桌面快捷方式、侧边栏检测、入口任务
- **[快手小游戏](./platformMini/kuaishou.md)** — ks 全局对象，支持登录、激励视频、Banner 广告、分享、桌面快捷方式、侧边栏跳转
- **[华为快游戏](./platformMini/huawei.md)** — qg 全局对象，支持登录、激励视频、Banner 广告
- **[OPPO 小游戏](./platformMini/oppo.md)** — qg 全局对象，支持登录、激励视频、Banner 广告、原生广告
- **[B 站小游戏](./platformMini/bilibili.md)** — 继承基类默认实现

### H5 平台
- **[Google AdSense](./platformH5/adsense.md)** — 动态加载 AdSense 脚本，支持激励视频、显示/隐藏 Banner
- **[传音 Ahagame](./platformH5/ahagame.md)** — h5sdk 全局对象，支持激励视频、插屏广告、Banner 广告、Athena 埋点上报
- **[微游 Minigame](./platformH5/minigame.md)** — minigame 全局对象，支持登录、激励视频、插屏广告、Banner 广告、分享、桌面快捷方式、事件上报
- **[Mock 测试](./platformH5/mock.md)** — 开发调试用，模拟登录和广告返回

### 原生平台
- **[4399 APK](./platformNative/m4399.md)** — jsb.reflection 桥接 Java 层，支持初始化和登录

---

## 统一 API 接口

以下是所有平台适配器共有的接口。部分平台可能不支持某些接口，调用时会返回默认值或抛出异常。

### 初始化

```ts
const sdk = new WeChatSdk(platform, project_id, game_id);
await sdk.initialize(config);
```

### 登录

```ts
const loginData = await sdk.login();
// loginData 包含 open_id / openid、session_key 等平台特定字段
```

### 会话检查

```ts
const expired = await sdk.checkSession();
// true 表示会话已过期
```

### 激励视频广告

```ts
const reward = await sdk.playRewardedVideo({
    adUnitId: "your_ad_unit_id"
});
// reward.isEnded === true 表示用户完整观看了广告
// reward.count 表示奖励数量
```

### Banner 广告

```ts
await sdk.createBannerAd({ adUnitId: "banner_id" });
await sdk.showBannerAd();
await sdk.hideBannerAd();
await sdk.destroyBannerAd();
```

### 分享

```ts
await sdk.shareAppMessage({
    title: "分享标题",
    imageUrl: "https://example.com/image.png"
});
```

### 添加到桌面

```ts
await sdk.addShortcut({ title: "游戏名", imageUrl: "icon.png" });
const status = await sdk.checkShortcut();
// status.exist === true 表示已添加到桌面
```

### 事件上报

```ts
await sdk.reportEvent("event_id", { key: "value" });
```

---

## 功能支持矩阵

### 小游戏平台

| 功能 | 微信 | 抖音 | 快手 | 华为 | OPPO | B站 |
|------|:----:|:----:|:----:|:----:|:----:|:---:|
| 登录 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 激励视频 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Banner 广告 | ✅ | ✅ | — | ✅ | ✅ | — |
| 原生广告 | — | — | — | — | ✅ | — |
| 分享 | ✅ | ✅ | ✅ | — | — | — |
| 用户信息 | ✅ | — | — | — | — | — |
| 添加到桌面 | — | ✅ | ✅ | — | — | — |
| 设为常用 | — | ✅ | ✅ | — | — | — |
| 侧边栏检测 | — | ✅ | — | — | — | — |
| 场景跳转 | — | — | ✅ | — | — | — |
| 事件上报 | — | ✅ | ✅ | — | — | — |
| 会话检查 | ✅ | — | — | — | — | — |
| 广告效果上报 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### H5 平台

| 功能 | AdSense | Ahagame | Minigame | Mock |
|------|:-------:|:-------:|:--------:|:----:|
| 登录 | — | — | ✅ | ✅ |
| 激励视频 | ✅ | ✅ | ✅ | ✅ |
| 插屏广告 | — | ✅ | ✅ | — |
| Banner 广告 | ✅ | ✅ | ✅ | — |
| 分享 | — | — | ✅ | — |
| 添加到桌面 | — | — | ✅ | — |
| 事件上报 | — | ✅ | ✅ | — |
| 会话检查 | — | — | ✅ | — |
| 语言环境 | — | — | ✅ | — |
| 加载进度 | — | — | ✅ | — |

### 原生平台

| 功能 | 4399 APK |
|------|:--------:|
| 登录 | ✅ |
| 激励视频 | — |
| Banner 广告 | — |
| 分享 | — |
| 事件上报 | — |

---

## 类型定义

所有类型定义位于 `@lingames/clever-sdk/src/models/` 目录：

| 类型 | 说明 |
|------|------|
| `LoginData` | 登录返回数据（联合类型） |
| `wxLoginData` | 微信登录数据 |
| `HuaweiLoginData` | 华为登录数据 |
| `OppoLoginData` | OPPO 登录数据 |
| `VideoReward` | 广告观看奖励结果 |
| `CreateBannerAd` | Banner 广告创建参数（联合类型） |
| `ShareAppMessage` | 分享参数（联合类型） |
| `minigameShareAppMessage` | 微游 Minigame 分享参数 |
| `AddShortcut` | 添加桌面快捷方式参数 |
| `NavigateToScene` | 场景跳转参数 |
| `AdvertiseStage` | 广告效果上报阶段枚举 |
| `ReportContext` | 上报上下文信息 |
| `SdkInitialize` | 初始化配置（联合类型） |
| `m4399Initialize` | 4399 初始化配置 |
| `ggInitialize` | Google AdSense / 传音 Ahagame 初始化配置 |
| `minigameInitialize` | 微游 Minigame 初始化配置 |
| `mockInitialize` | Mock 测试初始化配置 |
