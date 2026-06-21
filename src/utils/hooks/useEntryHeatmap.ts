import { computed, ref, type ComputedRef } from "vue"
import { useLiveQuery } from "./useLiveQuery"
import { getDayStatsMap, getTotalEntryCount, getCurrentStreak, toDayKey, type DayStats } from "@/lib/db/diary"

export interface HeatmapDay {
    dayKey: string
    count: number
    hasPinned: boolean
    isToday: boolean
    inFuture: boolean
}

const DAYS_PER_WEEK = 7
const WEEKS_PER_PERIOD = 13

export function useEntryHeatmap() {
    const stats = useLiveQuery(getDayStatsMap, new Map<string, DayStats>())
    const total = useLiveQuery(getTotalEntryCount, 0)
    const streak = useLiveQuery(getCurrentStreak, 0)

    const periodOffset = ref(0)
    const canGoNext = computed(() => periodOffset.value < 0)

    function goToPreviousPeriod() {
        periodOffset.value -= 1
    }

    function goToNextPeriod() {
        if (canGoNext.value) periodOffset.value += 1
    }

    const periodLabel = computed(() => {
        const today = new Date()
        const periodEnd = new Date(today)
        periodEnd.setDate(periodEnd.getDate() + periodOffset.value * WEEKS_PER_PERIOD * DAYS_PER_WEEK)

        const periodStart = new Date(periodEnd)
        periodStart.setDate(periodStart.getDate() - (WEEKS_PER_PERIOD * DAYS_PER_WEEK - 1))

        const startLabel = periodStart.toLocaleDateString("ru-RU", { month: "short", year: "numeric" })
        const endLabel = periodEnd.toLocaleDateString("ru-RU", { month: "short", year: "numeric" })

        return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`
    })

    const weeks: ComputedRef<HeatmapDay[][]> = computed(() => {
        const today = new Date()
        const todayKey = toDayKey(today)
        const totalDays = WEEKS_PER_PERIOD * DAYS_PER_WEEK

        const periodEndOffset = periodOffset.value * totalDays
        const days: HeatmapDay[] = []

        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() + periodEndOffset - i)

            const dayKey = toDayKey(date)
            const dayStats = stats.value.get(dayKey)

            days.push({
                dayKey,
                count: dayStats?.count ?? 0,
                hasPinned: dayStats?.hasPinned ?? false,
                isToday: dayKey === todayKey,
                inFuture: date.getTime() > today.getTime(),
            })
        }

        const grid: HeatmapDay[][] = []
        for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
            grid.push(days.slice(i, i + DAYS_PER_WEEK))
        }

        return grid
    })

    return { weeks, total, streak, periodLabel, periodOffset, canGoNext, goToPreviousPeriod, goToNextPeriod }
}