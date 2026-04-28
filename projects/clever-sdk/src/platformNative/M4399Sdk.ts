import { CleverSdk } from "../CleverSdk";
import { SdkInitialize, m4399Initialize } from "../models/SdkInitialize";
import { LoginData } from "../models/LoginData";
import { LoginEndPoint } from "../models/index";
declare const jsb: any;
declare const cc: any;

/**
 * 4399 APK SDK 集成
 * 文档: https://open.4399.cn/console/doc#/mobilegame/online/client
 */
export class M4399Sdk extends CleverSdk {
    private static JAVA_CLASS = "com/lingames/sdk/m4399/M4399Bridge";

    public override async initialize(config: SdkInitialize): Promise<boolean> {
        const m4399Config = config as m4399Initialize;
        this.sdk_login_url = m4399Config.sdk_login_url ?? LoginEndPoint;

        if (typeof jsb === "undefined") {
            console.error("M4399Sdk: jsb is undefined, not in native environment");
            return false;
        }

        try {
            jsb.reflection.callStaticMethod(M4399Sdk.JAVA_CLASS, "init", "(Ljava/lang/String;Ljava/lang/String;)V", this.game_id, this.sdk_key);
            return true;
        } catch (e) {
            console.error("M4399Sdk initialize error:", e);
            return false;
        }
    }

    public override async login(): Promise<LoginData> {
        if (typeof jsb === "undefined") {
            return Promise.reject("Not in native environment");
        }

        return new Promise((resolve, reject) => {
            // 设置回调
            (window as any).onM4399LoginSuccess = (data: string) => {
                try {
                    const loginData = JSON.parse(data);
                    resolve(loginData);
                } catch (e) {
                    reject("Parse login data failed: " + e);
                }
            };

            (window as any).onM4399LoginFail = (error: string) => {
                reject(error);
            };

            try {
                jsb.reflection.callStaticMethod(M4399Sdk.JAVA_CLASS, "login", "()V");
            } catch (e) {
                reject("Call native login failed: " + e);
            }
        });
    }
}
