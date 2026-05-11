/**
 * 标准化游戏中间事件类型
 *
 * 与各平台（TikTok / 抖音 / 微信等）的中间事件回传规范对齐。
 * 游戏调用 reportEvent 时，通过 data.event_type 传入此枚举值，
 * 各平台子类据此分发到平台原生回传 API。
 */
export enum StandardGameEvent {
    /**
     * 游戏加载完成
     *
     * 对应 TikTok: loading_complete
     * 玩家完成小游戏资源加载（进度条100%）或进入首页时上报
     */
    LOADING_COMPLETE = "loading_complete",
    /**
     * 完成关卡
     *
     * 对应 TikTok: complete_section
     * 玩家完成指定关卡或玩法时上报
     */
    COMPLETE_SECTION = "complete_section",
    /**
     * 获取奖励
     *
     * 对应 TikTok: gain_credits
     * 玩家获取游戏内虚拟货币/积分时上报
     */
    GAIN_CREDITS = "gain_credits",
    /**
     * 玩家离开游戏
     *
     * 对应 TikTok: user_leave
     * 玩家主动或被动退出小游戏时上报
     */
    USER_LEAVE = "user_leave",
    /**
     * 自定义事件
     *
     * 不在预置列表中的事件，各平台不做特殊分发
     */
    CUSTOM = "custom",
}
