import { getTelegramWebApp } from "./core"

export interface TelegramProfile {
    displayName: string
    username: string | null
    photoUrl: string | null
}

export function getTelegramProfile(): TelegramProfile | null {
    const tg = getTelegramWebApp()
    const user = tg?.initDataUnsafe?.user

    if (!user) return null

    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ")

    return {
        displayName: displayName || user.username || "Без имени",
        username: user.username ?? null,
        photoUrl: user.photo_url ?? null,
    }
}