import { computed, type ComputedRef, type Ref } from "vue"
import { useLiveQuery } from "./useLiveQuery"
import { getDayStatsMap, getTotalEntryCount, toDayKey, type DayStats } from "@/lib/db/diary"

export interface HeatmapDay {
    dayKey: string
    count: number
    hasPinned: boolean
    isToday: boolean
}

const DAYS_PER_WEEK = 7

export function useEntryHeatmap(weeksVisible: Ref<number>) {
    const stats = useLiveQuery(getDayStatsMap, new Map<string, DayStats>())
    const total = useLiveQuery(getTotalEntryCount, 0)

    const weeks: ComputedRef<HeatmapDay[][]> = computed(() => {
        const today = new Date()
        const todayKey = toDayKey(today)
        const totalDays = weeksVisible.value * DAYS_PER_WEEK

        const days: HeatmapDay[] = []

        for (let offset = totalDays - 1; offset >= 0; offset--) {
            const date = new Date(today)
            date.setDate(date.getDate() - offset)

            const dayKey = toDayKey(date)
            const dayStats = stats.value.get(dayKey)

            days.push({
                dayKey,
                count: dayStats?.count ?? 0,
                hasPinned: dayStats?.hasPinned ?? false,
                isToday: dayKey === todayKey,
            })
        }

        const grid: HeatmapDay[][] = []
        for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
            grid.push(days.slice(i, i + DAYS_PER_WEEK))
        }

        return grid
    })

    return { weeks, total }
}