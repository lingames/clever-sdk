import { CleverSdk } from "../CleverSdk.js";
import { ttCreateRewardedVideoAd, VideoReward } from "../models/PlayRewardedVideo";
import { ttCreateBannerAd } from "../models/CreateBannerAd";
import { ttCreateInterstitialAd } from "../models/CreateInterstitialAd";
import { ttInitialize } from "../models/SdkInitialize";
import { ttAddShortcut } from "../models/AddShortcut";
import { LoginData } from "../models/LoginData";
import { ttShareAppMessage } from "../models/ShareAppMessage";
import {
    CheckSceneResult,
    CheckShortcutResult,
    EventEndPoint,
    EventReportPayload,
    LoginEndPoint,
    ReportResult,
    TiktokEventParams,
    TiktokGameEvent,
} from "../models";

// @ts-ignore
const TTMinis = (globalThis as any).TTMinis;

/** TTMinis.game.request 在 DevTool 中多为 callback 风格，兼容 Promise 与 success/fail */
function ttMinisRequest(options: Record<string, unknown>): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!TTMinis?.game || typeof TTMinis.game.request !== "function") {
            reject(new Error("TTMinis.game.request unavailable"));
            return;
        }
        try {
            const ret = TTMinis.game.request({
                ...options,
                success: (res: unknown) => resolve(res),
                fail: (err: unknown) => reject(err),
            });
            if (ret && typeof ret.then === "function") {
                ret.then(resolve).catch(reject);
            }
        } catch (e) {
            reject(e);
        }
    });
}

export class TiktokSdk extends CleverSdk {
    protected bannerAd: any = null;
    protected interstitialAd: any = null;

    /**
     * TiktokGameEvent → TikTok 原生事件名映射
     *
     * TikTok 平台要求通过 TTMinis.game.reportEvent 回传中间事件，
     * eventName 需使用平台约定的标准事件名。
     */
    private static readonly EVENT_NAME_MAP: Record<TiktokGameEvent, string | null> = {
        [TiktokGameEvent.LOADING_COMPLETE]: "loading_complete",
        [TiktokGameEvent.COMPLETE_SECTION]: "complete_section",
        [TiktokGameEvent.GAIN_CREDITS]: "gain_credits",
        [TiktokGameEvent.USER_LEAVE]: "user_leave",
        [TiktokGameEvent.CUSTOM]: null,
    };

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
                        ttMinisRequest({
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
                        ttMinisRequest({
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
        const videoAd = TTMinis.game.createRewardedVideoAd({
            adUnitId: config.ttUnitId || config.adUnitId,
        });
        return new Promise((resolve, reject) => {
            videoAd.onClose((res: any) => {
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
            videoAd.show().catch((error: any) => {
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
        this.interstitialAd = TTMinis.game.createInterstitialAd({
            adUnitId: adInfo.ttUnitId || adInfo.adUnitId,
        });

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

    // https://developers.tiktok.com/doc/home-screen-shortcut?enter_method=left_navigation
    async addShortcut(options: ttAddShortcut): Promise<boolean> {
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

    // https://developers.tiktok.com/doc/home-screen-shortcut?enter_method=left_navigation
    async checkShortcut(): Promise<CheckShortcutResult> {
        return new Promise((resolve, reject) => {
            TTMinis.game.getShortcutMissionReward({
                success(res: any) {
                    resolve({
                        isSupport: true,
                        exist: res.canReceiveReward,
                        needUpdate: false,
                    });
                },
                fail(fail: any) {
                    reject(fail);
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

    /**
     * 上报事件
     *
     * - 若 data 含 event_type，且为已知 TiktokGameEvent（非 CUSTOM），编译期强制校验必填参数
     * - 若 data 不含 event_type 或 event_type = CUSTOM，走宽松 Record<string, any>
     *
     * 同时通过两条通道上报：
     * 1. HTTP POST 到通用事件端点（用于游戏后台数据分析）
     * 2. 通过 TTMinis.game.reportEvent 分发到 TikTok 广告模型
     *
     * @param id - 游戏内部事件标识，由游戏自定义
     * @param data - 事件数据
     */
    async reportEvent<T extends TiktokGameEvent = TiktokGameEvent.CUSTOM>(
        id: string,
        data: T extends TiktokGameEvent.CUSTOM ? Record<string, any> : TiktokEventParams<T> & { event_type: T },
    ): Promise<ReportResult> {
        const { event_type, ...params } = data;
        const tiktokEvent = (event_type ?? TiktokGameEvent.CUSTOM) as TiktokGameEvent;
        const nativeEventName = TiktokSdk.EVENT_NAME_MAP[tiktokEvent];

        if (nativeEventName && this.canIUse("reportEvent")) {
            TTMinis.game.reportEvent({
                eventName: nativeEventName,
                params: params,
                success: () => {},
                fail: (err: any) => {
                    console.warn(`TikTok 中间事件回传失败: ${nativeEventName}`, err);
                },
            });
        }

        await ttMinisRequest({
            url: EventEndPoint,
            method: "POST",
            data: {
                player_anonymous: this.player_anonymous,
                player_id: this.player_id,
                channel_id: this.channel_id,
                version_id: this.version_id,
                event_id: id,
                custom: data,
            } satisfies EventReportPayload,
        });
        return { success: true };
    }
}
