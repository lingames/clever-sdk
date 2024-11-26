import {MySdk} from "../sdk";
import {build_sdk_req, generateRandomString, http_request} from "../helper";

declare namespace sys {
    const localStorage: any;
}

export class BrowserSdk extends MySdk {
    override async login() {
        let old_guid = sys.localStorage.getItem('MARS_LOCAL_GUID');
        if (old_guid) {
            console.log('load guid from cache', old_guid);
        } else {
            old_guid = generateRandomString(16);
            sys.localStorage.setItem('MARS_LOCAL_GUID', old_guid);
            console.log('load guid from create', old_guid);
        }
        const [req_body, req_header] = build_sdk_req(this.game_id, this.sdk_key, old_guid);
        console.log('my-sdk login url:', old_guid, this.sdk_login_url, req_body);

        try {
            const req = {
                url: this.sdk_login_url,
                data: req_body,
                method: 'POST',
                header: req_header
            };

            const ret: any = await http_request('POST', this.sdk_login_url, req_header, req_body)();
            // const ret = await promisify_request()(req);
            console.log('my-sdk login resp:', ret);

            this.session_key = ret.session_key;

            return ret;
        } catch (e: any) {
            console.error('browser sdk login fail:', e);
            throw new Error(e);
        }
    }

    public override createRewardedVideoAd(adInfo: any): Promise<any> {
        throw new Error('浏览器不支持广告');
    }

    // public override async addCommonUse() {
    //     throw new Error("浏览器不支持 addCommonUse")
    // }


    // public async checkCommonUse(): Promise<boolean> {
    //     return false
    // }

    public override async addShortcut() {
        throw new Error('浏览器不支持 addShortcut');
    }

    // public async checkShortcut(): Promise<any> {
    //     return { isSupport: false, exist: true, needUpdate: false };
    // }
}

