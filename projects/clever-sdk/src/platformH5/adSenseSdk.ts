//* 谷歌平台 */
import {BrowserSdk} from "./browserSdk";
import {SdkInitialize} from "../sdk";

export class AdSenseSdk extends BrowserSdk {
    async initialize({adSenseId}: SdkInitialize): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`;
            script.crossOrigin = 'anonymous';
            // 将 script 元素插入到文档中
            document.body.appendChild(script);
            script.onload = function () {
                // @ts-ignore
                window.adsbygoogle = window.adsbygoogle || [];
                // @ts-ignore
                window.adBreak = function (o) {
                    // @ts-ignore
                    adsbygoogle.push(o);
                }
                // @ts-ignore
                window.adConfig = function (o) {
                    // @ts-ignore
                    adsbygoogle.push(o);
                }
                // @ts-ignore
                window.adConfig({
                    sound: 'on',
                    preloadAdBreaks: 'on',
                    onReady: () => {
                        console.log("AdSense onReady");
                    },
                })
                resolve(true);
                // 可以在这里初始化广告
            };

            script.onerror = function (err) {
                resolve(false)
            }
        })
    }

    public override createRewardedVideoAd(adInfo: any): Promise<any> {

        return new Promise((resolve, reject) => {
            // @ts-ignore
            window["adBreak"] && window["adBreak"]({
                // ad shows at start of next level
                type: 'reward',
                name: 'restart-game',
                beforeAd: () => {
                    console.log("激励视频开始播放");
                },
                // You may also want to mute the game's sound.
                afterAd: () => {
                    //关闭，观看完成都会走这里
                    console.log("激励视频播放结束");
                },
                // resume the game flow.
                // @ts-ignore
                beforeReward: (showAdFn) => {
                    showAdFn && showAdFn();
                },
                adDismissed: () => {
                    console.log("中途关闭广告");
                },
                adViewed: () => {
                    //google建议设置状态码，在afterAd中处理奖励逻辑
                    console.log("玩家完整看完广告");
                },
                adBreakDone: () => {
                    //Always called (if provided) even if an ad didn't show（始终调用，即使广告展示失败了）
                }
            });
        })
    }
}