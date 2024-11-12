import axios from 'axios'

/**
 * 异步调用 Axios
 *
 * @template T
 * @param {'PUT' | 'POST' | 'PATCH' | 'DELETE'} method - 允许的 HTTP 方法
 * @param {string} endpoint - 接口的 HTTP 端点
 * @param {any} data - 输入对象
 * @returns {Promise<T>} 返回值类型
 */
export async function myAxios (method, endpoint, data) {
    // const host = process.env.VUE_APP_API_HOST
    const host = "https://api.salesagent.cc/game-logger";

    // 读取全局状态
    const bearer = 'ej'

    //   let c = `${host}/${endpoint}`
    //   alert(c)

    try {
        const response = await axios({
            method: method,
            url: `${host}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': bearer
            },
            data: data
        })
        if (response.status !== 200) {
            console.error(response.statusText)
            return null
        }
        const result = response.data
        if (result.code < 0) {
            console.error(result.message)
            return null
        } else {
            return result.data
        }
    } catch (error) {
        console.error(error)
        return null
    }
}