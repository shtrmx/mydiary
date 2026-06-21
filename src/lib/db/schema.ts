import { Dexie, type EntityTable } from "dexie"

export interface DiaryEntry {
    id: number
    dayKey: string
    createdAt: number
    updatedAt: number
    html: string
    plainText: string
    pinned: 0 | 1
}

export type DiaryDatabase = Dexie & {
    entries: EntityTable<DiaryEntry, "id">
}

export function createDiaryDatabase(): DiaryDatabase {
    const db = new Dexie("snipla-diary") as DiaryDatabase

    db.version(1).stores({
        entries: "++id, dayKey, createdAt, pinned",
    })

    return db
}

export const db = createDiaryDatabase()