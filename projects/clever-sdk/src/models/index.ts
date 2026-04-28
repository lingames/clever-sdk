import { SdkInitialize } from "./SdkInitialize.js";

export type DynamicSdkConfig = MyConfig & SdkInitialize;
export { PlayRewardedVideo, VideoReward } from "./PlayRewardedVideo";
export { CreateInterstitialAd } from "./CreateInterstitialAd";
export { EventData } from "./events";
export { AdvertiseStage } from "./AdvertiseStage";
export type MyConfig = {
    project_id: string;
    platform?: string;
    sdk_login_url: string;
    sdk_event_key?: string;
    game_id?: string;
    wx_game_id?: string;
    ks_game_id?: string;
    dy_game_id?: string;
    tt_game_id?: string;
    bb_game_id?: string;
    hw_game_id?: string;
    oppo_game_id?: string;
    google_game_id?: string;
    minigame_game_id?: string;
};

export const EventEndPoint = "https://api.salesagent.cc/game-logger/event";
export const LoginEndPoint = "https://api.salesagent.cc/game-analyzer/player/login";

export interface CheckSceneResult {
    isSupport: boolean;
    isScene: boolean;
}
