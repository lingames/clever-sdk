import { CleverSdk } from "../CleverSdk.js";
import { hwCreateRewardedVideoAd, VideoReward } from "../models/PlayRewardedVideo";
import { HuaweiLoginData } from "../models/LoginData.js";
import { CreateBannerAd } from "../models/CreateBannerAd";

const qg = (globalThis as any).qg;

export class HuaweiSdk extends CleverSdk {
    protected videoAd: any = null;
    protected bannerAd: any = null;

    // https://developer.huawei.com/consumer/cn/doc/quickApp-Guides/quickgame-runtime-account-kit-0000001113458340
    async login(): Promise<HuaweiLoginData> {
        return new Promise((resolve, reject) => {
            qg.gameLoginWithReal({
                forceLogin: 1,
                appid: this.game_id,
                success: function (data: any) {
                    console.log("华为登录成功" + JSON.stringify(data));
                    data.openid = data.playerId;
                    data.code = 0;
                    resolve(data);
                },
                fail: function (data: any, code: number) {
                    console.warn("华为登录失败:" + data + ", code:" + code);
                    if (code == 7004 || code == 2012) {
                        console.warn("玩家取消登录，返回游戏界面让玩家重新登录。");
                    }
                    if (code == 7021) {
                        console.warn("用户取消实名认证。");
                    }
                    reject(data);
                },
            });
        });
    }

    // https://developer.huawei.com/consumer/cn/doc/quickApp-References/quickgame-api-ad-0000001130711971#section9772146486
    async playRewardedVideo(adInfo: hwCreateRewardedVideoAd): Promise<VideoReward> {
        if (this.videoAd == null) {
            this.videoAd = qg.createRewardedVideoAd({
                adUnitId: adInfo.hwUnitId || adInfo.adUnitId,
                multiton: adInfo.multiton || false,
                success: (data: any) => {
                    console.log(`华为激励广告创建成功: ${JSON.stringify(data)}`);
                },
                fail: (data: any, code: any) => {
                    console.error(`华为激励广告创建失败 ${code}: ${JSON.stringify(data)}`);
                },
            });
            this.videoAd.onLoad(() => {
                console.log("华为激励广告已加载");
                this.videoAd.show();
            });
        }
        return new Promise((resolve, reject) => {
            this.videoAd.onClose((res: any) => {
                resolve({
                    isEnded: res.isEnded,
                    count: res.isEnded ? 1 : 0,
                });
            });
            this.videoAd.onError((e: any) => {
                reject(e);
            });
            try {
                this.videoAd.load();
            } catch (e: any) {
                reject(e);
            }
        });
    }

    // https://developer.huawei.com/consumer/cn/doc/quickApp-References/quickgame-api-ad-0000001130711971#section912518224415
    async createBannerAd(adInfo: CreateBannerAd): Promise<VideoReward> {
        if (this.bannerAd == null) {
            this.bannerAd = qg.createBannerAd({
                adUnitId: adInfo.adUnitId,
                style: adInfo.style,
                adIntervals: adInfo.adIntervals,
            });
            this.bannerAd.onLoad(() => {
                this.bannerAd.show();
            });
        }
        return this.showBannerAd();
    }

    async showBannerAd(): Promise<VideoReward> {
        return new Promise((resolve, reject) => {
            this.bannerAd.onClose((res: any) => {
                console.log("Banner 广告结束: " + JSON.stringify(res));
                resolve({
                    isEnded: res.isEnded,
                    count: res.isEnded ? 1 : 0,
                });
            });
            this.bannerAd.onError((e: any) => {
                reject(e);
            });
            try {
                this.bannerAd.load();
            } catch (e: any) {
                reject(e);
            }
        });
    }
}
