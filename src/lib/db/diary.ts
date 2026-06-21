import { db, type DiaryEntry } from "./schema"

function toDayKey(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function stripHtml(html: string): string {
    const el = document.createElement("div")
    el.innerHTML = html
    return (el.textContent ?? "").trim().replace(/\s+/g, " ")
}

export async function createEntry(html: string): Promise<number> {
    const now = Date.now()

    return db.entries.add({
        dayKey: toDayKey(new Date(now)),
        createdAt: now,
        updatedAt: now,
        html,
        plainText: stripHtml(html),
        pinned: 0,
    } as DiaryEntry)
}

export async function updateEntry(id: number, html: string): Promise<void> {
    await db.entries.update(id, {
        html,
        plainText: stripHtml(html),
        updatedAt: Date.now(),
    })
}

export async function deleteEntry(id: number): Promise<void> {
    await db.entries.delete(id)
}

export async function togglePinned(id: number, pinned: boolean): Promise<void> {
    await db.entries.update(id, { pinned: pinned ? 1 : 0 })
}

export function getEntriesForDay(dayKey: string): Promise<DiaryEntry[]> {
    return db.entries.where("dayKey").equals(dayKey).sortBy("createdAt")
}

export function getDistinctDayKeysDesc(limit: number, offset: number): Promise<string[]> {
    return db.entries
        .orderBy("createdAt")
        .reverse()
        .toArray()
        .then((entries) => {
            const seen = new Set<string>()
            for (const entry of entries) seen.add(entry.dayKey)
            return [...seen].slice(offset, offset + limit)
        })
}

export interface DayStats {
    count: number
    hasPinned: boolean
}

export async function getDayStatsMap(): Promise<Map<string, DayStats>> {
    const stats = new Map<string, DayStats>()

    await db.entries.each((entry) => {
        const current = stats.get(entry.dayKey) ?? { count: 0, hasPinned: false }
        current.count += 1
        current.hasPinned = current.hasPinned || entry.pinned === 1
        stats.set(entry.dayKey, current)
    })

    return stats
}

export function getTotalEntryCount(): Promise<number> {
    return db.entries.count()
}

export async function getCurrentStreak(): Promise<number> {
    const stats = await getDayStatsMap()
    if (stats.size === 0) return 0

    const today = new Date()
    const todayKey = toDayKey(today)

    let cursor = new Date(today)
    if (!stats.has(todayKey)) {
        cursor.setDate(cursor.getDate() - 1)
        if (!stats.has(toDayKey(cursor))) return 0
    }

    let streak = 0
    while (stats.has(toDayKey(cursor))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }

    return streak
}

export { toDayKey }