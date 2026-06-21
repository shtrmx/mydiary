import { getTelegramWebApp } from "./core"

export function getTelegramStartParam(): string | null {
    const tg = getTelegramWebApp()
    const param = tg?.initDataUnsafe?.start_param

    if (!param) return null

    try {
        return atob(param)
    } catch {
        return param
    }
}