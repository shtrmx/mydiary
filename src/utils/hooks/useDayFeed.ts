import { ref, shallowRef } from "vue"
import { db } from "@/lib/db/schema"
import { getDistinctDayKeysDesc, getEntriesForDay } from "@/lib/db/diary"
import type { DiaryEntry } from "@/lib/db/schema"

export interface DayGroup {
    dayKey: string
    entries: DiaryEntry[]
}

const PAGE_SIZE = 14

export function useDayFeed() {
    const groups = shallowRef<DayGroup[]>([])
    const loading = ref(false)
    const exhausted = ref(false)
    let offset = 0

    async function loadMore() {
        if (loading.value || exhausted.value) return
        loading.value = true

        const dayKeys = await getDistinctDayKeysDesc(PAGE_SIZE, offset)

        if (dayKeys.length === 0) {
            exhausted.value = true
            loading.value = false
            return
        }

        const fresh = await db.transaction("r", db.entries, () =>
            Promise.all(
                dayKeys.map(async (dayKey) => ({
                    dayKey,
                    entries: await getEntriesForDay(dayKey),
                }))
            )
        )

        groups.value = [...groups.value, ...fresh]
        offset += dayKeys.length
        loading.value = false
    }

    async function reset() {
        offset = 0
        exhausted.value = false
        groups.value = []
        await loadMore()
    }

    function setPinned(id: number, pinned: boolean) {
        groups.value = groups.value.map((group) => ({
            dayKey: group.dayKey,
            entries: group.entries.map((entry) =>
                entry.id === id ? { ...entry, pinned: pinned ? 1 : 0 } : entry
            ),
        }))
    }

    return { groups, loading, exhausted, loadMore, reset, setPinned }
}