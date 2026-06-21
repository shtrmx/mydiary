import { db, type DiaryEntry } from "./schema"

interface BackupFile {
    version: 1
    exportedAt: number
    entries: DiaryEntry[]
}

export async function exportAllEntries(): Promise<Blob> {
    const entries = await db.entries.toArray()

    const payload: BackupFile = {
        version: 1,
        exportedAt: Date.now(),
        entries,
    }

    return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
}

export function downloadExport(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `snipla-diary-${date}.json`
    link.click()

    URL.revokeObjectURL(url)
}

function isValidEntry(value: unknown): value is DiaryEntry {
    if (typeof value !== "object" || value === null) return false
    const entry = value as Record<string, unknown>

    return (
        typeof entry.dayKey === "string" &&
        typeof entry.createdAt === "number" &&
        typeof entry.updatedAt === "number" &&
        typeof entry.html === "string" &&
        typeof entry.plainText === "string"
    )
}

export class ImportError extends Error { }

export async function importEntries(file: File): Promise<number> {
    const text = await file.text()

    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch {
        throw new ImportError("Файл повреждён или не является JSON")
    }

    const entries = (parsed as Partial<BackupFile>)?.entries

    if (!Array.isArray(entries) || !entries.every(isValidEntry)) {
        throw new ImportError("Структура файла не соответствует формату дневника")
    }

    await db.transaction("rw", db.entries, async () => {
        for (const entry of entries) {
            await db.entries.add({
                dayKey: entry.dayKey,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                html: entry.html,
                plainText: entry.plainText,
                pinned: entry.pinned === 1 ? 1 : 0,
            } as DiaryEntry)
        }
    })

    return entries.length
}

export async function deleteAllEntries(): Promise<void> {
    await db.entries.clear()
}