import {CleverSdk} from "../CleverSdk";

declare const qg: any;

export class HuaweiSdk extends CleverSdk {
    protected videoAd: any = null


    constructor(platform: string, sdk_url: string, sdk_key: string, game_id: number) {
        super(platform, sdk_url, sdk_key, game_id);
        // https://developer.huawei.com/consumer/cn/doc/quickApp-References/quickgame-api-ad-0000001130711971#section443419211957
        this.videoAd = qg.createRewardedVideoAd({
            adUnitId: game_id,
            success: (code: any) => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd: success");
            },
            fail: (data: any, code: any) => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd fail: " + data + "," + code);
            },
            complete: () => {
                console.log("ad demo : loadAndShowVideoAd createRewardedVideoAd complete");
            }
        });
    }

    // async login(): Promise<any> {
    //     qg.login({
    //         success: function (res: any) {
    //             console.log("Oppo 登录")
    //             const data = JSON.stringify(res.data);
    //             console.log(data);
    //         },
    //         fail: function (res: any) {
    //             console.log("Oppo 登录失败")
    //             console.log(JSON.stringify(res));
    //         },
    //     });
    //     return Promise.resolve(true)
    // }

    createRewardedVideoAd(adInfo: any): Promise<any> {
        this.videoAd.load();
        this.videoAd.show();
        return Promise.resolve(true)
    }
}