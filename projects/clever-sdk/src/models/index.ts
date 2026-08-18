import { SdkInitialize } from "./SdkInitialize.js";

export type DynamicSdkConfig = MyConfig & SdkInitialize;
export { PlayRewardedVideo, VideoReward } from "./PlayRewardedVideo";
export { CreateInterstitialAd } from "./CreateInterstitialAd";
export { EventData } from "./events";
export { AdvertiseStage } from "./AdvertiseStage";
export { ReportContext, EventReportPayload } from "./ReportContext";
export { StandardGameEvent } from "./GameEvent";
export {
    TiktokGameEvent,
    LoadingCompleteParams,
    CompleteSectionParams,
    GainCreditsParams,
    UserLeaveParams,
} from "./TiktokGameEvent";
export type { TiktokEventParams } from "./TiktokGameEvent";
export { extractDouyinAdvertiseAttribution } from "./DouyinAdvertiseAttribution";
export type { DouyinAdvertiseAttribution } from "./DouyinAdvertiseAttribution";

export interface ReportResult {
    success: boolean;
}

/**
 * 检查场景入口状态的返回结果
 */
export interface CheckSceneResult {
    /**
     * 平台是否支持场景入口功能
     */
    isSupport: boolean;
    /**
     * 当前是否在侧边栏场景
     */
    isScene: boolean;
}

/**
 * 检查桌面快捷方式状态的返回结果
 *
 * @see https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/open-capacity/shortcut/check-shortcut
 */
export interface CheckShortcutResult {
    /**
     * 平台是否支持添加到桌面功能
     */
    isSupport: boolean;
    /**
     * 是否已添加到桌面
     */
    exist: boolean;
    /**
     * 是否已过期需要更新
     */
    needUpdate: boolean;
}

/**
 * SDK 配置参数
 */
export type MyConfig = {
    /**
     * 项目 ID
     */
    project_id: string;
    /**
     * 平台标识（自动检测时可不填）
     */
    platform?: string;
    /**
     * SDK 登录接口地址
     */
    sdk_login_url: string;
    /**
     * SDK 事件上报密钥
     */
    sdk_event_key?: string;
    /**
     * 通用游戏 ID
     */
    game_id?: string;
    /**
     * 微信小游戏 ID
     */
    wx_game_id?: string;
    /**
     * 快手小游戏 ID
     */
    ks_game_id?: string;
    /**
     * 抖音小游戏 ID
     */
    dy_game_id?: string;
    /**
     * TikTok 小游戏 ID
     */
    tt_game_id?: string;
    /**
     * Bilibili 小游戏 ID
     */
    bb_game_id?: string;
    /**
     * 华为快游戏 ID
     */
    hw_game_id?: string;
    /**
     * OPPO 小游戏 ID
     */
    oppo_game_id?: string;
    /**
     * Google Play 游戏 ID
     */
    google_game_id?: string;
    /**
     * 通用小游戏 ID
     */
    minigame_game_id?: string;
};

export const EventEndPoint = "https://api.salesagent.cc/game-logger/event";
export const LoginEndPoint =
    "https://api.salesagent.cc/game-analyzer/player/login";
