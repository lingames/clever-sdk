export interface ReportContext {
    channel_id?: string;
    version_id?: string;
    player_anonymous?: string;
    player_id?: string;
}

/**
 * 事件上报 HTTP 请求体
 *
 * 发送到通用事件端点的数据结构
 */
export interface EventReportPayload {
    player_anonymous?: string;
    player_id?: string;
    channel_id?: string;
    version_id?: string;
    /**
     * 游戏内部事件标识
     */
    event_id: string;
    /**
     * 事件数据（含 event_type 等字段）
     */
    custom: Record<string, any>;
}
