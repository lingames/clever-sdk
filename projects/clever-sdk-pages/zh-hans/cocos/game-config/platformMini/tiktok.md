# TikTok 小游戏适配器

TikTok 小游戏适配器通过 `TTMinis` 全局对象调用 TikTok 平台 API，提供登录、授权、广告（激励视频、Banner、插屏）、分享、侧边栏、桌面快捷方式、入口任务等功能。

## 类定义

```ts
import { TiktokSdk } from "@lingames/clever-sdk/src/platformMini/TiktokSdk.js";

const sdk = new TiktokSdk(platform, project_id, game_id);
```

- **全局对象**: `TTMinis`
- **继承**: `CleverSdk`

## 初始化

```ts
interface ttInitialize {
    sdk_login_url?: string;
}

await sdk.initialize({
    sdk_login_url: "https://api.salesagent.cc/game-analyzer/player/login"
});
```

## 登录

```ts
const data = await sdk.login();
```

**登录流程**:

1. 调用 `TTMinis.game.login()` 获取临时登录凭证 `code`
2. 将 `code` 连同 `platform`、`project_id` 发送到 SDK 登录服务器
3. 服务器返回 `session_key`，SDK 自动保存

> 参考: [TikTok 登录](https://developers.tiktok.com/doc/mini-games-sdk-login)

## 授权登录

支持指定 scope 的授权登录，适用于需要额外用户信息的场景。

```ts
const data = await sdk.authorize("user.info");
```

- `scope` 可选，指定授权范围（如 `user.info`）
- 若平台不支持 `authorize` API，会抛出异常

## 激励视频广告

```ts
interface ttCreateRewardedVideoAd {
    adUnitId?: string;  // 通用广告单元 ID
    ttUnitId?: string;  // TikTok 专用广告 ID
}

const reward = await sdk.playRewardedVideo({
    ttUnitId: "your_tt_ad_unit_id"
});
// reward.isEnded === true 时发放奖励
```

**广告实例复用**: SDK 内部会缓存广告实例，当 `adUnitId` 变化时自动重新创建。

> 参考: [TikTok 激励视频](https://developers.tiktok.com/doc/mini-games-sdk-iaa)

## Banner 广告

```ts
interface ttCreateBannerAd {
    adUnitId: string;      // 广告单元 ID
    adIntervals?: number;  // 自动刷新间隔（秒），>= 30
    style?: BannerStyle;   // 广告样式
}

await sdk.createBannerAd({
    adUnitId: "banner_id",
    adIntervals: 30,
    style: { left: 0, top: 100, width: 300, height: 50 }
});
await sdk.showBannerAd();
await sdk.hideBannerAd();
await sdk.destroyBannerAd();
```

> 参考: [TikTok Banner 广告](https://developers.tiktok.com/doc/mini-games-sdk-iaa)

## 插屏广告

```ts
interface ttCreateInterstitialAd {
    adUnitId?: string;  // 通用广告单元 ID
    ttUnitId?: string;  // TikTok 专用广告 ID
}

const reward = await sdk.showInterstitialAd({
    ttUnitId: "your_interstitial_ad_unit_id"
});
// reward.isEnded === true 表示展示成功
```

> 参考: [TikTok 插屏广告](https://developers.tiktok.com/doc/mini-games-sdk-iaa)

## 分享

```ts
interface ttShareAppMessage {
    title?: string;         // 转发标题
    description?: string;   // 分享文案
    imageUrl?: string;      // 转发图片链接
    query?: string;         // 查询字符串
    imageUrlId?: string;    // 审核通过的图片编号
    toCurrentGroup?: boolean;
    path?: string;
}

const success = await sdk.shareAppMessage({
    title: "分享标题",
    description: "分享描述",
    imageUrl: "https://example.com/share.png"
});
```

> 参考: [TikTok 分享](https://developers.tiktok.com/doc/mini-games-sdk-share-app-message)

## 侧边栏检测

```ts
interface CheckSceneResult {
    isSupport: boolean;  // 是否支持侧边栏
    isScene: boolean;    // 当前是否在侧边栏场景中
}

const result = await sdk.checkScene();
// result.isSupport === true && result.isScene === true 表示从侧边栏进入
```

- 若平台不支持 `checkScene` API，返回 `{ isSupport: false, isScene: false }`

> 参考: [TikTok 侧边栏](https://developers.tiktok.com/doc/mini-games-sdk-check-scene)

## 桌面快捷方式

### 添加到桌面

```ts
await sdk.addShortcut({
    // 平台特定参数
});
```

- 若平台不支持 `addShortcut` API，返回 `false`

### 检查快捷方式奖励

```ts
const status = await sdk.checkShortcut();
// 或
const status = await sdk.getShortcutMissionReward();

// status.isSupport — 是否支持该功能
// status.canReceiveReward — 是否可以领取奖励
```

- `checkShortcut()` 实际调用 `getShortcutMissionReward()`
- 若平台不支持，返回 `{ isSupport: false, canReceiveReward: false }`

## 入口任务

### 启动入口任务

```ts
const success = await sdk.startEntranceMission();
```

- 若平台不支持，返回 `false`

### 获取入口任务奖励

```ts
const status = await sdk.getEntranceMissionReward();
// status.isSupport — 是否支持该功能
// status.canReceiveReward — 是否可以领取奖励
```

- 若平台不支持，返回 `{ isSupport: false, canReceiveReward: false }`

## API 能力检测

```ts
const supported = sdk.canIUse("game.login");
```

- 检测当前 TikTok 宿主版本是否支持指定 API
- 返回 `boolean`

## 设为常用

```ts
await sdk.addCommonUse();
```

## 事件上报

TikTok 适配器重写了 `reportEvent`，直接通过 `TTMinis.game.request` 发送事件到上报服务器：

```ts
await sdk.reportEvent("event_id", { key: "value" });
```
