import { build_sdk_head } from "../helper";
import { CleverSdk } from "../CleverSdk";
import { VideoReward, wxCreateRewardedVideoAd } from "../models/PlayRewardedVideo";
import { CreateBannerAd } from "../models/CreateBannerAd";
import { wxInitialize } from "../models/SdkInitialize";
import { wxGetUserInfo, wxLoginData, wxUserInfoCallback } from "../models/LoginData";
import { wxShareAppMessage } from "../models/ShareAppMessage";
import { wxNavigateToScene } from "../models/NavigateToScene";
import { LoginEndPoint } from "../models";

// @ts-ignore
const wx = (globalThis as any).wx;

export class WeChatSdk extends CleverSdk {
    protected inner: any;
    protected videoAd: any = null;
    protected bannerAd: any = null;
    private _lastVideoAdUnitId: string = '';

    override async login(): Promise<wxLoginData> {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res: any) => {
                    if (res.code) {
                        const body = {
                            platform: this.platform,
                            project_id: this.project_id,
                            login_code: res.code,
                            Fields: {
                                grant_type: "authorization_code",
                            },
                        };
                        const head = build_sdk_head(this.sdk_key, JSON.stringify(body));
                        // https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
                        wx.request({
                            url: this.sdk_login_url,
                            method: "POST",
                            header: head,
                            data: body,
                            dataType: "json",
                            success: (fine: any) => {
                                console.warn("微信登成功: ", fine);
                                this.session_key = fine.data.session_key;
                                resolve(fine.data);
                            },
                            fail: (fail: any) => {
                                console.warn("微信登录失败: ", fail);
                                reject(fail);
                            },
                        });
                    } else {
                        console.warn("微信登录失败！", res.errMsg);
                        reject(res.errMsg);
                    }
                },
                fail(err: any) {
                    console.warn("微信登录凭证失败: ", err);
                    reject(err);
                },
            });
        });
    }

    async initialize(config: wxInitialize): Promise<boolean> {
        this.sdk_login_url = config.sdk_login_url ?? LoginEndPoint;
        if (config.enableShare !== false) {
            wx.showShareMenu({
                menus: ["shareAppMessage", "shareTimeline"],
            });
        }
        console.info("微信全局对象:", wx);
        return true;
    }

    // true表示session_key已经过期
    override async checkSession(): Promise<boolean> {
        return true;
    }

    /**
     * https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createRewardedVideoAd.html
     */
    public override playRewardedVideo(adInfo: wxCreateRewardedVideoAd): Promise<VideoReward> {
        const adUnitId = adInfo.wxUnitId || adInfo.adUnitId;
        // 检查广告位 ID 是否变化，如果变化则重新创建广告实例
        if (this.videoAd == null || this._lastVideoAdUnitId !== adUnitId) {
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: adUnitId,
                multiton: adInfo.multiton,
                disableFallbackSharePage: adInfo.disableFallbackSharePage,
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
                console.log(`微信播放异常 ${JSON.stringify(error)}`);
                reject(error);
            });
        });
    }

    /// https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createBannerAd.html
    async createBannerAd(adInfo: CreateBannerAd): Promise<VideoReward> {
        if (this.bannerAd == null) {
            this.bannerAd = wx.createBannerAd({ adUnitId: adInfo.adUnitId });
        }
        return this.showBannerAd();
    }

    /// https://developers.weixin.qq.com/minigame/dev/api/ad/BannerAd.show.html
    async showBannerAd(): Promise<VideoReward> {
        return super.showBannerAd();
    }

    /// https://developers.weixin.qq.com/minigame/dev/api/ad/BannerAd.hide.html
    async hideBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.hide();
        }
        return true;
    }

    // https://developers.weixin.qq.com/minigame/dev/api/ad/BannerAd.destroy.html
    async destroyBannerAd(): Promise<boolean> {
        if (this.bannerAd != null) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
        return true;
    }

    public async checkShortcut(): Promise<any> {
        console.error("不支持checkShortcut");
        return {
            isSupport: false,
            exist: true,
            needUpdate: false,
        };
    }

    public async checkScene(): Promise<any> {
        console.error("不支持checkScene");
        return {
            isSupport: false,
            isScene: false,
        };
    }

    public async navigateToScene(scene: wxNavigateToScene) {
        console.error("微信不支持 navigateToScene");
        return false;
    }

    // https://developers.weixin.qq.com/minigame/dev/api/share/wx.shareAppMessage.html
    public async shareAppMessage(share: wxShareAppMessage): Promise<boolean> {
        wx.shareAppMessage(share);
        return true;
    }

    public async getUserInfo(param: wxGetUserInfo): Promise<wxUserInfoCallback> {
        // https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserInfo.html
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                ...param,
                success: (fine: wxUserInfoCallback) => {
                    resolve(fine);
                },
                fail: (err: any) => {
                    reject(err);
                },
            });
        });
    }
}
