import { CleverSdk } from "../CleverSdk.js";
import { dyCreateRewardedVideoAd, VideoReward } from "../models/PlayRewardedVideo";
import { dyCreateBannerAd } from "../models/CreateBannerAd";
import { dyInitialize } from "../models/SdkInitialize";
import { dyAddShortcut } from "../models/AddShortcut";
import { LoginData } from "../models/LoginData";
import { ShareAppMessage, dyShareAppMessage } from "../models/ShareAppMessage";
import { LoginEndPoint, CheckSceneResult } from "../models";

const tt = (globalThis as any).tt;

export class DouyinSdk extends CleverSdk {
    protected videoAd: any = null;
    protected bannerAd: any = null;
    private _lastVideoAdUnitId: string = '';

    async initialize(config: dyInitialize): Promise<boolean> {
        this.sdk_login_url = config.sdk_login_url ?? LoginEndPoint;
        console.info("抖音全局对象:", tt);
        return true;
    }

    async login(): Promise<LoginData> {
        return new Promise((resolve, reject) => {
            tt.login({
                force: false,
                success: (res: any) => {
                    if (res.code) {
                        const body = {
                            project_id: this.project_id,
                            platform: this.platform,
                            login_code: res.code,
                        };
                        // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/network/initiate-a-request/tt-request
                        tt.request({
                            url: this.sdk_login_url,
                            method: "POST",
                            data: body,
                            dataType: "json",
                            success: (fine: any) => {
                                this.session_key = fine.data.session_key;
                                resolve(fine.data);
                            },
                            fail: (fail: any) => {
                                console.warn("抖音登录失败: ", fail);
                                reject(fail);
                            },
                        });
                    } else {
                        console.warn("抖音获取登录凭证失败:", res.errMsg);
                        reject(res.errMsg);
                    }
                },
                fail(err: any) {
                    console.warn("抖音登录凭证失败: ", err);
                    reject(err);
                },
            });
        });
    }

    playRewardedVideo(config: dyCreateRewardedVideoAd): Promise<VideoReward> {
        const adUnitId = config.ttUnitId || config.adUnitId;
        // 检查广告位 ID 是否变化，如果变化则重新创建广告实例
        if (this.videoAd == null || this._lastVideoAdUnitId !== adUnitId) {
            console.log("创建抖音激励视频广告");
            // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/ads/tt-create-rewarded-video-ad
            this.videoAd = tt.createRewardedVideoAd({
                adUnitId: adUnitId,
                multiton: config.multiton,
                multitonRewardMsg: config.multitonMessage,
                multitonRewardTimes: config.multitonTimes,
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
                console.log(`抖音播放异常 ${JSON.stringify(error)}`);
                reject(error);
            });
        });
    }

    public override async checkScene(): Promise<CheckSceneResult> {
        // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/open-capacity/sidebar-capacity/tt-check-scene
        return new Promise((resolve, reject) => {
            tt.checkScene({
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

    // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/ads/tt-create-banner-ad
    async createBannerAd(adInfo: dyCreateBannerAd): Promise<VideoReward> {
        this.bannerAd = tt.createBannerAd({
            adUnitId: adInfo.adUnitId,
            adIntervals: adInfo.adIntervals,
            style: adInfo.style,
        });
        return super.createBannerAd(this.bannerAd);
    }

    // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/ads/banner-ad/banner-ad-show
    async showBannerAd(): Promise<VideoReward> {
        return super.showBannerAd();
    }

    // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/ads/banner-ad/banner-ad-hide
    async hideBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.hide();
        }
        return true;
    }

    // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/ads/banner-ad/banner-ad-destroy
    async destroyBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.destroy();
        }
        return true;
    }

    async shareAppMessage(share: dyShareAppMessage): Promise<boolean> {
        // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/retweet/tt-share-app-message
        return new Promise((resolve, reject) => {
            tt.shareAppMessage({
                desc: share.description,
                ...share,
                success: (res: any) => {
                    console.log("抖音分享成功", res);
                    resolve(true);
                },
                fail: (res: any) => {
                    console.log("抖音分享失败", res);
                    resolve(false);
                },
            });
        });
    }

    async addCommonUse(): Promise<boolean> {
        return super.addCommonUse();
    }

    async addShortcut(options: dyAddShortcut): Promise<boolean> {
        // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/open-capacity/shortcut/add-shortcut
        return new Promise((resolve, reject) => {
            tt.addShortcut({
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
        // https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/api/open-capacity/shortcut/check-shortcut
        return new Promise((resolve, reject) => {
            tt.checkShortcut({
                success(fine: any) {
                    resolve({
                        isSupport: true,
                        exist: fine.status.exist,
                        needUpdate: fine.status.needUpdate,
                    });
                },
                fail(fail: any) {
                    reject(fail.errMsg);
                },
            });
        });
    }

    async reportEvent(id: string, custom: Record<string, any>): Promise<boolean> {
        return tt.request({
            url: "https://api.salesagent.cc/game-logger/event",
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
    }
}
