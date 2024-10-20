import {CleverSdk} from "../CleverSdk";


type KuaiShouInitialize = {}

export class KuaiShouSdk extends CleverSdk {
    async initialize(config: KuaiShouInitialize): Promise<boolean> {
        return true
    }
}