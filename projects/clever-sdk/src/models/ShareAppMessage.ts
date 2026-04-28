export type ShareAppMessage = {} | wxShareAppMessage | dyShareAppMessage | ttShareAppMessage | ksShareAppMessage | minigameShareAppMessage;

export interface wxShareAppMessage {
    /** 转发标题，不传则默认使用当前小游戏的昵称。 */
    title?: string;

    /** 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4 */
    imageUrl?: string;

    /** 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchOptionsSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。 */
    query?: string;

    /** 审核通过的图片编号，详见 使用审核通过的转发图片 */
    imageUrlId?: string;

    /** 是否转发到当前群。该参数只对从群工具栏打开的场景下生效，默认转发到当前群，填入false时可转发到其他会话。 */
    toCurrentGroup?: boolean;

    /** 独立分包路径。详见 小游戏独立分包指南 */
    path?: string;
}

export interface dyShareAppMessage {
    /** 转发标题，不传则默认使用后台配置或当前小游戏的名称 */
    title?: string;

    /** 分享文案，不传则默认使用后台配置内容或游戏简介 */
    description?: string;

    /** 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4 */
    imageUrl?: string;

    /** 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchOptionsSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。 */
    query?: string;

    /** 审核通过的图片编号，详见 使用审核通过的转发图片 */
    imageUrlId?: string;

    /** 是否转发到当前群。该参数只对从群工具栏打开的场景下生效，默认转发到当前群，填入false时可转发到其他会话。 */
    toCurrentGroup?: boolean;

    /** 独立分包路径。详见 小游戏独立分包指南 */
    path?: string;
}

export interface ttShareAppMessage {
    /** 转发标题，不传则默认使用后台配置或当前小游戏的名称 */
    title?: string;

    /** 分享文案，不传则默认使用后台配置内容或游戏简介 */
    description?: string;

    /** 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4 */
    imageUrl?: string;

    /** 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchOptionsSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。 */
    query?: string;

    /** 审核通过的图片编号，详见 使用审核通过的转发图片 */
    imageUrlId?: string;

    /** 是否转发到当前群。该参数只对从群工具栏打开的场景下生效，默认转发到当前群，填入false时可转发到其他会话。 */
    toCurrentGroup?: boolean;

    /** 独立分包路径。详见 小游戏独立分包指南 */
    path?: string;
}

/** 微游Minigame分享参数 */
export interface minigameShareAppMessage {
    /** 要分享的图像，使用 base64 编码 */
    image: string;
    /** 要分享的文字 */
    text: string;
    /** 附加到分享上的数据 */
    data?: Object;
    /** gif 或者 video 媒体内容 */
    media?: { gif?: { url: string }; video?: { url: string } };
}

// https://ks-game-docs.kuaishou.com/minigame/api/open/repost/ks.shareAppMessage.html#%E5%8F%82%E6%95%B0
export interface ksShareAppMessage {
    /** 分享模版id，不传走默认分享文案*/
    templateId?: string;

    /** 查询字符串，从这条转发消息进入后，可通过 ks.getLaunchOptionsSync() 或 ks.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。 */
    query?: string;
}
