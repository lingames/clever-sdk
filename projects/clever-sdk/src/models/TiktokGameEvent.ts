/**
 * TikTok 标准化游戏中间事件类型及参数定义
 *
 * 与 TikTok 中间事件回传规范对齐，通过条件类型实现编译期参数校验。
 *
 * 调用示例：
 * ```ts
 * sdk.reportEvent("level_5", {
 *     event_type: TiktokGameEvent.COMPLETE_SECTION,
 *     section_type: 0,
 *     main_section_no: 5,
 * });
 * ```
 */
export enum TiktokGameEvent {
    /**
     * 游戏加载完成
     *
     * 玩家完成小游戏资源加载（进度条100%）或进入首页时上报
     */
    LOADING_COMPLETE = "loading_complete",
    /**
     * 完成关卡
     *
     * 玩家完成指定关卡或玩法时上报
     */
    COMPLETE_SECTION = "complete_section",
    /**
     * 获取奖励
     *
     * 玩家获取游戏内虚拟货币/积分时上报
     */
    GAIN_CREDITS = "gain_credits",
    /**
     * 玩家离开游戏
     *
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

/**
 * 游戏加载完成事件参数
 *
 * 对应 TikTok: loading_complete
 */
export interface LoadingCompleteParams {
    /**
     * 加载完成的时间戳（毫秒）
     */
    complete_time: number;
}

/**
 * 完成关卡事件参数
 *
 * 对应 TikTok: complete_section
 */
export interface CompleteSectionParams {
    /**
     * 关卡类型
     *
     * 0 = 主线关卡，1 = 活动关卡，2 = 挑战关卡
     */
    section_type: 0 | 1 | 2;
    /**
     * 主线关卡序号
     *
     * 仅当 section_type 为 0（主线关卡）时必传。
     * 例如主线关卡第 5 关，值为 5。
     */
    main_section_no?: number;
    /**
     * 关卡价值（可选）
     *
     * 0 = 高价值，1 = 低价值。
     * 建议将数值压力关卡、高难度关卡标记为高价值。
     */
    section_value?: 0 | 1;
    /**
     * 关卡在游戏中对应的名称
     */
    section_name?: string;
    /**
     * 关卡 ID
     */
    section_id?: number;
    /**
     * 玩家已完成关卡总数
     */
    section_sum?: number;
}

/**
 * 获取奖励事件参数
 *
 * 对应 TikTok: gain_credits
 */
export interface GainCreditsParams {
    /**
     * 虚拟货币数额
     */
    value: number;
    /**
     * 积分/货币类型
     *
     * 0 = 付费获得的一级货币，1 = 兑换/广告获得的二级货币
     */
    token_type: 0 | 1;
    /**
     * 货币/积分 ID
     *
     * 例如：gold、diamond 等。只要求上报一种最主要的货币。
     */
    token_id: string;
}

/**
 * 玩家离开游戏事件参数
 *
 * 对应 TikTok: user_leave
 */
export interface UserLeaveParams {
    /**
     * 离开时间戳（毫秒）
     */
    leave_time: number;
    /**
     * 离开原因/场景
     *
     * - 1: 主动关闭（点击右上角 X）
     * - 2: 主动 kill App
     * - 3: TikTok crash
     * - 4: 小游戏 crash
     * - 5: 退后台（切换小游戏）
     * - 6: 退后台（系统清理内存）
     * - 7: 其他
     *
     * 如果统计不到，可以不传。
     */
    leave_reason?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * 事件类型 → 参数类型映射
 *
 * 根据传入的 TiktokGameEvent 枚举值自动推导对应的参数类型。
 */
export type TiktokEventParams<T extends TiktokGameEvent> =
    T extends TiktokGameEvent.LOADING_COMPLETE ? LoadingCompleteParams :
    T extends TiktokGameEvent.COMPLETE_SECTION ? CompleteSectionParams :
    T extends TiktokGameEvent.GAIN_CREDITS ? GainCreditsParams :
    T extends TiktokGameEvent.USER_LEAVE ? UserLeaveParams :
    Record<string, any>;