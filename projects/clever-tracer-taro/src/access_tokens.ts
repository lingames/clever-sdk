import Taro from "@tarojs/taro";

export async function setToken(token: string): Promise<boolean> {
    await Taro.setStorage({
        key: 'LIN_GAMES_LOGGER_TOKEN',
        data: token
    })
    return true
}

export async function getToken(): Promise<string | null> {
    try {
        const token = await Taro.getStorage({key: 'LIN_GAMES_LOGGER_TOKEN'})
        return token.data
    } catch (e) {
        return null
    }
}