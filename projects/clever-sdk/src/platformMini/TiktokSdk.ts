import { CleverSdk } from "../CleverSdk.js";
import { ttCreateRewardedVideoAd, VideoReward } from "../models/PlayRewardedVideo";
import { ttCreateBannerAd } from "../models/CreateBannerAd";
import { ttCreateInterstitialAd } from "../models/CreateInterstitialAd";
import { ttInitialize } from "../models/SdkInitialize";
import { ttAddShortcut } from "../models/AddShortcut";
import { LoginData } from "../models/LoginData";
import { ttShareAppMessage } from "../models/ShareAppMessage";
import { EventEndPoint, LoginEndPoint, CheckSceneResult } from "../models";
import { CreateNativeAd } from "../models/CreateNativeAd";

// @ts-ignore
const TTMinis = (globalThis as any).TTMinis;

export class TiktokSdk extends CleverSdk {
    protected videoAd: any = null;
    protected bannerAd: any = null;
    protected interstitialAd: any = null;
    private _lastVideoAdUnitId: string = '';

    async initialize(config: ttInitialize): Promise<boolean> {
        this.sdk_login_url = config.sdk_login_url ?? LoginEndPoint;
        console.info("TikTok 全局对象:", TTMinis);
        return true;
    }

    // https://developers.tiktok.com/doc/mini-games-sdk-login?enter_method=left_navigation
    async login(): Promise<LoginData> {
        return new Promise((resolve, reject) => {
            TTMinis.game.login({
                success: (res: any) => {
                    if (res.code) {
                        const body = {
                            project_id: this.project_id,
                            platform: this.platform,
                            login_code: res.code,
                        };
                        // https://developers.tiktok.com/doc/mini-games-sdk-login?enter_method=left_navigation
                        TTMinis.game
                            .request({
                                url: this.sdk_login_url,
                                method: "POST",
                                data: body,
                            })
                            .then((fine: any) => {
                                this.session_key = fine.data.session_key;
                                resolve(fine.data);
                            })
                            .catch((fail: any) => {
                                console.warn("TikTok 登录失败: ", fail);
                                reject(fail);
                            });
                    } else {
                        console.warn("TikTok 获取登录凭证失败:", res.errMsg);
                        reject(res.errMsg);
                    }
                },
                fail(err: any) {
                    console.warn("TikTok 登录失败: ", err);
                    reject(err);
                },
            });
        });
    }

    async authorize(scope?: string): Promise<LoginData> {
        if (!TTMinis.game || typeof TTMinis.game.authorize !== "function") {
            console.warn("TikTok 平台不支持 authorize API");
            throw new Error("authorize API not supported");
        }

        return new Promise((resolve, reject) => {
            const options: any = {};
            if (scope) {
                options.scope = scope;
            }

            TTMinis.game.authorize({
                ...options,
                success: (res: any) => {
                    if (res.code) {
                        const body = {
                            project_id: this.project_id,
                            platform: this.platform,
                            login_code: res.code,
                        };
                        TTMinis.game
                            .request({
                                url: this.sdk_login_url,
                                method: "POST",
                                data: body,
                            })
                            .then((fine: any) => {
                                this.session_key = fine.data.session_key;
                                resolve(fine.data);
                            })
                            .catch((fail: any) => {
                                console.warn("TikTok 授权失败: ", fail);
                                reject(fail);
                            });
                    } else {
                        console.warn("TikTok 获取授权凭证失败:", res.errMsg);
                        reject(res.errMsg);
                    }
                },
                fail(err: any) {
                    console.warn("TikTok 授权失败: ", err);
                    reject(err);
                },
            });
        });
    }

    // https://developers.tiktok.com/doc/mini-games-sdk-iaa?enter_method=left_navigation
    playRewardedVideo(config: ttCreateRewardedVideoAd): Promise<VideoReward> {
        const adUnitId = config.ttUnitId || config.adUnitId;
        // 检查广告位 ID 是否变化，如果变化则重新创建广告实例
        if (this.videoAd == null || this._lastVideoAdUnitId !== adUnitId) {
            console.log("创建 TikTok 激励视频广告");
            this.videoAd = TTMinis.game.createRewardedVideoAd({
                adUnitId: adUnitId,
            });
            this._lastVideoAdUnitId = adUnitId;
        }
        return new Promise((resolve, reject) => {
            this.videoAd.onClose((res: any) => {
                if (res && res.isEnded) {
                    resolve({
                        isEnded: true,
                        count: 1,
                    });
                } else {
                    resolve({
                        isEnded: false,
                        count: 0,
                    });
                }
            });
            this.videoAd.show().catch((error: any) => {
                console.log(`TikTok 播放异常 ${JSON.stringify(error)}`);
                reject(error);
            });
        });
    }

    public override async checkScene(): Promise<CheckSceneResult> {
        if (!TTMinis.game || typeof TTMinis.game.checkScene !== "function") {
            console.warn("TikTok 平台不支持 checkScene API");
            return {
                isSupport: false,
                isScene: false,
            };
        }

        return new Promise((resolve) => {
            TTMinis.game.checkScene({
                scene: "sidebar",
                success: (res: any) => {
                    resolve({
                        isSupport: true,
                        isScene: res.isExist,
                    });
                },
                fail: (err: any) => {
                    console.warn("侧边栏检测失败: ", err);
                    resolve({
                        isSupport: true,
                        isScene: false,
                    });
                },
            });
        });
    }

    // https://developers.tiktok.com/doc/mini-games-sdk-iaa?enter_method=left_navigation
    async createBannerAd(adInfo: ttCreateBannerAd): Promise<VideoReward> {
        this.bannerAd = TTMinis.game.createBannerAd({
            adUnitId: adInfo.adUnitId,
            adIntervals: adInfo.adIntervals,
            style: adInfo.style,
        });
        return super.createBannerAd(this.bannerAd);
    }

    async showBannerAd(): Promise<VideoReward> {
        return super.showBannerAd();
    }

    async hideBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.hide();
        }
        return true;
    }

    async destroyBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.destroy();
        }
        return true;
    }

    // https://developers.tiktok.com/doc/mini-games-sdk-iaa?enter_method=left_navigation
    async showInterstitialAd(adInfo: ttCreateInterstitialAd): Promise<VideoReward> {
        if (this.interstitialAd == null) {
            this.interstitialAd = TTMinis.game.createInterstitialAd({
                adUnitId: adInfo.ttUnitId || adInfo.adUnitId,
            });
        }

        return new Promise((resolve) => {
            this.interstitialAd
                .show()
                .then(() => {
                    resolve({
                        isEnded: true,
                        count: 1,
                    });
                })
                .catch((error: any) => {
                    console.log(`Tiktok插屏播放异常 ${JSON.stringify(error)}`);
                    resolve({
                        isEnded: false,
                        count: 0,
                    });
                });
        });
    }

    async shareAppMessage(share: ttShareAppMessage): Promise<boolean> {
        return new Promise((resolve, reject) => {
            TTMinis.game.shareAppMessage({
                desc: share.description,
                ...share,
                success: (res: any) => {
                    console.log("TikTok 分享成功", res);
                    resolve(true);
                },
                fail: (res: any) => {
                    console.log("TikTok 分享失败", res);
                    resolve(false);
                },
            });
        });
    }

    async addCommonUse(): Promise<boolean> {
        return super.addCommonUse();
    }

    async addShortcut(options: ttAddShortcut): Promise<boolean> {
        if (!TTMinis.game || typeof TTMinis.game.addShortcut !== "function") {
            console.warn("TikTok 平台不支持 addShortcut API");
            return false;
        }

        return new Promise((resolve, reject) => {
            TTMinis.game.addShortcut({
                ...options,
                success() {
                    resolve(true);
                },
                fail(err: any) {
                    reject(err.errMsg);
                },
            });
        });
    }

    async checkShortcut(): Promise<any> {
        return this.getShortcutMissionReward();
    }

    async getShortcutMissionReward(): Promise<any> {
        if (!TTMinis || typeof TTMinis.getShortcutMissionReward !== "function") {
            console.warn("TikTok 平台不支持 getShortcutMissionReward API");
            return { isSupport: false, canReceiveReward: false };
        }

        return new Promise((resolve) => {
            TTMinis.getShortcutMissionReward({
                success(res: any) {
                    resolve({
                        isSupport: true,
                        canReceiveReward: res.canReceiveReward,
                    });
                },
                fail(fail: any) {
                    console.warn("获取桌面快捷方式奖励失败: ", fail);
                    resolve({ isSupport: true, canReceiveReward: false });
                },
            });
        });
    }

    async startEntranceMission(): Promise<boolean> {
        if (!TTMinis.game || typeof TTMinis.game.startEntranceMission !== "function") {
            console.warn("TikTok 平台不支持 startEntranceMission API");
            return false;
        }

        return new Promise((resolve) => {
            TTMinis.game.startEntranceMission({
                success() {
                    resolve(true);
                },
                fail(err: any) {
                    console.warn("启动入口任务失败: ", err);
                    resolve(false);
                },
            });
        });
    }

    async getEntranceMissionReward(): Promise<any> {
        if (!TTMinis.game || typeof TTMinis.game.getEntranceMissionReward !== "function") {
            console.warn("TikTok 平台不支持 getEntranceMissionReward API");
            return { isSupport: false, canReceiveReward: false };
        }

        return new Promise((resolve) => {
            TTMinis.game.getEntranceMissionReward({
                success(res: any) {
                    resolve({
                        isSupport: true,
                        canReceiveReward: res.canReceiveReward,
                    });
                },
                fail(fail: any) {
                    console.warn("获取入口任务奖励失败: ", fail);
                    resolve({ isSupport: true, canReceiveReward: false });
                },
            });
        });
    }

    canIUse(schema: string): boolean {
        if (!TTMinis.game || typeof TTMinis.game.canIUse !== "function") {
            return false;
        }
        return TTMinis.game.canIUse(schema);
    }

    async reportEvent(id: string, custom: Record<string, any>): Promise<boolean> {
        await TTMinis.game.request({
            url: EventEndPoint,
            method: "POST",
            data: {
                player_anonymous: this.player_anonymous,
                player_id: this.player_id,
                channel_id: this.channel_id,
                version_id: this.version_id,
                event_id: id,
                custom: custom,
            },
        });
        return true;
    }
}
