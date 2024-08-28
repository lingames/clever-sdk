export type DynamicSdkConfig = MyConfig & WeChatInitialize & AdSenseInitialize;

export type MyConfig = {
    env: string,
    sdk_url: string,
    sdk_key: string,
    game_id: number
}


export type WeChatInitialize = {
    wx: any
}

export interface AdSenseInitialize {
    adSenseId: string
}