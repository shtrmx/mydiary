import { getTelegramWebApp, isTelegramEnvironment } from "./core"

let initialized = false

export function initTelegramApp() {
    const tg = getTelegramWebApp()
    if (!tg) return null

    if (!isTelegramEnvironment()) {
        console.info("Running outside of Telegram environment. Telegram Web App features will be disabled.")
        return null
    }

    if (initialized) return tg
    initialized = true

    tg.ready()
    tg.expand()

    const isDesktop =
        tg.platform === "tdesktop" ||
        tg.platform === "macos"

    if (!isDesktop) {
        try {
            tg.disableVerticalSwipes?.()
            tg.requestFullscreen?.()
        } catch {
        }
    }

    return tg
}