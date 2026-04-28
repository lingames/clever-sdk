import { CleverSdk } from "../CleverSdk.js";
import { qgCreateRewardedVideoAd, VideoReward } from "../models/PlayRewardedVideo";
import { qgCreateBannerAd } from "../models/CreateBannerAd.js";
import { OppoLoginData } from "../models/LoginData.js";
import { qgCreateNativeAd } from "../models/CreateNativeAd.js";

const qg = (globalThis as any).qg;

export class OppoSdk extends CleverSdk {
    protected videoAd: any = null;
    protected bannerAd: any = null;
    protected customAd: any = null;

    async initialize(config: Record<string, any>): Promise<boolean> {
        console.info("OPPO 全局对象:", qg);
        return Promise.resolve(true);
    }

    // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/feature/account?id=qgloginobject
    async login(): Promise<OppoLoginData> {
        return new Promise((resolve, reject) => {
            qg.login({
                success: function (fine: OppoLoginData) {
                    console.log("Oppo 登录成功");
                    resolve({
                        ...fine,
                        openid: fine.uid,
                    });
                },
                fail: function (fail: any) {
                    console.log("Oppo 登录失败", fail);
                    reject(fail);
                },
            });
        });
    }

    playRewardedVideo(adInfo: qgCreateRewardedVideoAd): Promise<VideoReward> {
        // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/ad/video-ad
        if (this.videoAd == null) {
            console.log("创建OPPO激励视频广告");
            this.videoAd = qg.createRewardedVideoAd({
                adUnitId: adInfo.adUnitId,
            });
            this.videoAd.onLoad(() => {
                this.videoAd.show();
            });
        }
        return new Promise((resolve, reject) => {
            this.videoAd.onError((err: any) => {
                console.error("广告异常", JSON.stringify(err));
                reject(err);
            });
            this.videoAd.onClick((obj: any) => {
                console.log(`广告点击: code: ${obj.code},msg: '${obj.msg}'`);
            });
            this.videoAd.onClose((res: any) => {
                console.log("广告结束", JSON.stringify(res));
                if ((res && res.isEnded) || res === undefined) {
                    res = res || {
                        isEnded: true,
                        count: 1,
                    };
                    res.count = res.count || 1;
                    console.info("广告观看结束，触发奖励代码", JSON.stringify(res));
                    resolve(res);
                } else {
                    console.error("广告没看完，不能获奖", JSON.stringify(res));
                    resolve(res);
                }
            });

            try {
                this.videoAd.load();
            } catch (e: any) {
                console.error("广告异常, 不能获奖:", JSON.stringify(e));
                reject(e);
            }
        });
    }

    // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/ad/banner-ad?id=qgcreatebanneradobject
    async createBannerAd(adInfo: qgCreateBannerAd) {
        this.bannerAd = qg.createBannerAd({
            adUnitId: adInfo.adUnitId,
            style: adInfo.style,
        });
        return this.bannerAd;
    }

    async showBannerAd(): Promise<VideoReward> {
        return super.showBannerAd();
    }

    async hideBannerAd() {
        if (this.bannerAd != null) {
            this.bannerAd.hide();
        }
        return true;
    }

    async destroyBannerAd() {
        if (this.bannerAd != null) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
        return true;
    }

    // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/ad/native-template-ad?id=qgcreatecustomadobject-object
    async createNativeAd(adInfo: qgCreateNativeAd): Promise<object> {
        this.customAd = qg.createCustomAd(adInfo);
        return this.customAd;
    }

    // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/ad/native-template-ad?id=customadshow
    async showNativeAd(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.customAd
                .show()
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    // https://ie-activity-cn.heytapimage.com/static/minigame/CN/docs/index.html#/develop/ad/native-template-ad?id=customadhide
    async hideNativeAd(): Promise<boolean> {
        return this.customAd.hide();
    }

    async shareAppMessage(param: any): Promise<boolean> {
        console.log("不支持");
        return false;
    }
}
