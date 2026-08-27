# TikTok Unity SDK 接入

Unity 版 TikTok SDK 通过 `CleverSdkTiktok` 对接 TikTok Mini Game runtime。Unity C# 层负责登录换码、广告与事件接口封装，WebGL 构建后由 `Runtime/Plugins/WebGL/clever-sdk-unity.jslib` 调用宿主 `TTMinis.game` API。

> TikTok 官方 Unity 技术文档可参考 **TikTok Mini Game All in One / TikTok 小游戏一站式接入指南 2.0**。Clever SDK 的 TikTok 能力与 Cocos 版保持一致：登录、授权、激励视频、插屏、分享、侧边栏、快捷方式、入口任务和中间事件回传。

## 1. 创建 SDK

```csharp
using CleverSDK;
using CleverSDK.Models;

var sdk = (CleverSdkTiktok)CleverSdkFactory.CreateSdk(new TiktokSdkConfig
{
    project_id = "your_project_id",
    sdk_login_url = "https://api.salesagent.cc/game-analyzer/player/login",
    event_endpoint = "https://api.salesagent.cc/game-logger/event"
});
```

## 2. 登录与授权

```csharp
var loginData = await sdk.LoginAsync();
sdk.ReportContext(new EventReportContext
{
    player_anonymous = loginData.open_id
});

// 需要用户资料权限时再调用；默认 scope 为 user.info.basic
var authorized = await sdk.AuthorizeAsync("user.info.basic");
```

登录流程：

1. Unity WebGL 调用 `TTMinis.game.login` 获取临时 `code`
2. SDK 将 `project_id`、`platform`、`login_code` 发送到 `sdk_login_url`
3. 服务端返回 `open_id`、`session_key` 等登录数据

## 3. 广告

### 激励视频

```csharp
var reward = await sdk.PlayRewardedVideoAsync("your_rewarded_ad_unit_id");
if (reward.isEnded)
{
    // 发放奖励
}
```

### 插屏广告

```csharp
var result = await sdk.ShowInterstitialAdAsync("your_interstitial_ad_unit_id");
```

> TikTok 官方说明中，每个激励视频实例展示后需要重新创建。Clever SDK 每次调用 `PlayRewardedVideoAsync` 都会创建新的广告实例，避免复用已释放实例。

## 4. 分享

分享参数使用 JSON，字段直接透传给 `TTMinis.game.shareAppMessage`：

```csharp
await sdk.ShareAppMessageAsync(@"{
  ""title"": ""Share title"",
  ""description"": ""Share description"",
  ""imageUrl"": ""https://example.com/share.png"",
  ""query"": ""from=share""
}");
```

## 5. 侧边栏与任务

```csharp
var scene = await sdk.CheckSceneAsync();
if (scene.isSupport && scene.isScene)
{
    // 当前从 sidebar 场景进入
}

var shortcut = await sdk.AddAndVerifyShortcutAsync("{}");
if (shortcut.completed)
{
    // 已确认桌面快捷方式存在或任务奖励可领取
}

// AddShortcutAsync 只表示宿主接受调用；不要据此立即发奖。
// iOS 系统流程结束后应以 exist / canReceiveReward 的二次查询结果为准。

await sdk.StartEntranceMissionAsync();
var entranceReward = await sdk.GetEntranceMissionRewardAsync();
```

## 6. 能力检测

```csharp
var supportReportEvent = sdk.CanIUse("reportEvent");
```

## 7. 进度与偏好存储

TikTok Mini Game 运行时不要直接依赖 Unity 原生 `PlayerPrefs` 或默认文件持久化路径保存进度。小型进度、开关、数值、字符串统一使用 `CleverSdkPlayerPrefs`：

```csharp
using CleverSDK;

CleverSdkPlayerPrefs.SetInt("level", 12);
CleverSdkPlayerPrefs.SetString("last_open_id", loginData.open_id);
CleverSdkPlayerPrefs.Save();

var level = CleverSdkPlayerPrefs.GetInt("level", 1);
```

在 TikTok Unity SDK assembly 已加载时，`CleverSdkPlayerPrefs` 会优先调用官方 `TT.PlayerPrefs`；Editor、普通浏览器或非 TikTok 环境会回退到 `UnityEngine.PlayerPrefs`。真机验收请使用“写入 -> 退出游戏 -> 再次启动读取”的流程。

较大的 JSON 或二进制存档不要放入 PlayerPrefs，后续应接入小游戏文件系统接口。

## 8. 中间事件回传

`ReportEventAsync` 会进行双通道上报：

1. HTTP POST 到 `event_endpoint`
2. 当 `customJson.event_type` 是 TikTok 标准事件且宿主支持 `reportEvent` 时，同步调用 `TTMinis.game.reportEvent`

```csharp
await sdk.ReportEventAsync("level_5", @"{
  ""event_type"": ""complete_section"",
  ""section_type"": 0,
  ""main_section_no"": 5,
  ""section_name"": ""Level 5""
}");

await sdk.ReportEventAsync("reward_earned", @"{
  ""event_type"": ""gain_credits"",
  ""value"": 500,
  ""token_type"": 0,
  ""token_id"": ""diamond""
}");
```

支持的标准事件常量：

| 事件类型 | 常量 | 值 | 说明 |
|------|------|----|------|
| 游戏加载完成 | `TiktokGameEvent.LoadingComplete` | `loading_complete` | 玩家完成资源加载或进入首页 |
| 完成关卡 | `TiktokGameEvent.CompleteSection` | `complete_section` | 玩家完成指定关卡或玩法 |
| 获取奖励 | `TiktokGameEvent.GainCredits` | `gain_credits` | 玩家获取游戏内虚拟货币、积分或奖励 |
| 玩家离开游戏 | `TiktokGameEvent.UserLeave` | `user_leave` | 玩家主动或被动退出 |

建议事件上报示例：

```csharp
await sdk.ReportEventAsync("loading_complete", @"{
  ""event_type"": ""loading_complete"",
  ""load_duration_ms"": 1200,
  ""first_enter"": true
}");

await sdk.ReportEventAsync("complete_level_1", @"{
  ""event_type"": ""complete_section"",
  ""section_type"": 0,
  ""main_section_no"": 5,
  ""section_name"": ""Level 5""
}");

await sdk.ReportEventAsync("reward_earned", @"{
  ""event_type"": ""gain_credits"",
  ""value"": 100,
  ""token_type"": 0,
  ""token_id"": ""gold""
}");

await sdk.ReportEventAsync("user_leave_session", @"{
  ""event_type"": ""user_leave"",
  ""is_auto"": false,
  ""leave_reason"": ""sample_exit""
}");
```

`event_type` 必须放在 `customJson` 根节点；`eventId`（第一参数）用于游戏侧自行统计体系。可在 `customJson` 中继续携带你们的业务字段（场景、难度、货币类型等）。

## 9. 构建注意

- 目标平台需要使用 Unity WebGL，并在 TikTok Mini Game 宿主或 DevTool 中运行。
- 非 TikTok 宿主、Unity Editor 或普通浏览器中，`TTMinis.game` 不存在，登录和广告接口会抛出平台不支持异常。
- HTML runtime 需要先按 TikTok 官方要求初始化 Mini Games SDK；Native runtime 通常由宿主预加载。

## 10. 本地 Mock 测试

Unity 包内提供了一个 WebGL 本地烟测样例：

```text
Samples~/TiktokSmokeTest/
├── TiktokUnitySmokeTest.cs
├── ttminis-mock.html
└── README.md
```

使用方式：

1. 将 `TiktokUnitySmokeTest.cs` 挂到场景中的一个 GameObject 上。
2. 构建 Unity WebGL。
3. 在导出的 `index.html` 中，把 `ttminis-mock.html` 的内容插到 Unity loader 脚本之前。
4. 在 WebGL 输出目录运行 `python3 -m http.server 8080`。
5. 打开 `http://localhost:8080` 查看 Unity 日志。

本地 Mock 只验证 `C# -> .jslib -> TTMinis.game -> Unity callback` 链路。真实登录、广告填充、分享、入口任务和中间事件回传仍需在 TikTok DevTool 或真机环境验收。
