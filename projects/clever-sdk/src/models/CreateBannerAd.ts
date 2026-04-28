export type CreateBannerAd = wxCreateBannerAd & ksCreateBannerAd & qgCreateBannerAd;

export interface wxCreateBannerAd {
    // 广告单元 id
    adUnitId: string;
    // 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于30
    //
    // 该参数不传入时 Banner 广告不会自动刷新
    adIntervals?: number;
    // 广告样式
    style?: BannerStyle;
}

export interface ksCreateBannerAd {
    // 广告单元 id
    adUnitId: string;
}

export interface qgCreateBannerAd {
    // 广告单元 id
    adUnitId: string;
    style?: BannerStyle;
}

export interface dyCreateBannerAd {
    // 广告单元 id
    adUnitId: string;
    // 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于 30（该参数不传入时 Banner 广告不会自动刷新）
    adIntervals?: number;
    style?: BannerStyle;
}

export interface ttCreateBannerAd {
    // 广告单元 id
    adUnitId: string;
    // 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于 30（该参数不传入时 Banner 广告不会自动刷新）
    adIntervals?: number;
    style?: BannerStyle;
}

export interface BannerStyle {
    left: number;
    top: number;
    width: number;
    height: number;
}
