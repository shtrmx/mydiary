import type { WebApp } from "telegram-web-app"

let cached: WebApp | null = null

export function getTelegramWebApp(): WebApp | null {
    if (cached) return cached

    const tg = (window as any)?.Telegram?.WebApp ?? null
    cached = tg

    return tg
}

export function isTelegramEnvironment(): boolean {
    const tg = getTelegramWebApp()
    return Boolean(tg?.initData)
}