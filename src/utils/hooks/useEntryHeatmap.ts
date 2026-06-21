// src/utils/hooks/useEntryHeatmap.ts
import { computed, type ComputedRef } from "vue"
import { useLiveQuery } from "./useLiveQuery"
import { getDayStatsMap, getTotalEntryCount, getCurrentStreak, toDayKey, type DayStats } from "@/lib/db/diary"

export interface HeatmapDay {
    dayKey: string
    count: number
    hasPinned: boolean
    isToday: boolean
    inFuture: boolean
    date: Date // Добавили дату для вычисления заголовка
}

const DAYS_PER_WEEK = 7
const MIN_WEEKS = 13 // Минимум 13 недель (около 3 месяцев) для красивого вида

export function useEntryHeatmap() {
    const stats = useLiveQuery(getDayStatsMap, new Map<string, DayStats>())
    const total = useLiveQuery(getTotalEntryCount, 0)
    const streak = useLiveQuery(getCurrentStreak, 0)

    const weeks: ComputedRef<HeatmapDay[][]> = computed(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Нормализуем время

        // Ищем самую старую запись из статистики, чтобы знать, откуда начать
        const keys = Array.from(stats.value.keys()).sort()
        const oldestKey = keys.length > 0 ? keys[0] : toDayKey(today)
        const oldestDate = new Date(oldestKey)

        // Вычисляем, сколько дней нужно отрендерить
        const msPerDay = 1000 * 60 * 60 * 24
        const daysDiff = Math.floor((today.getTime() - oldestDate.getTime()) / msPerDay)

        // Берем минимум 13 недель или количество недель с первой записи (+1 для запаса)
        const targetWeeks = Math.max(MIN_WEEKS, Math.ceil(daysDiff / DAYS_PER_WEEK) + 1)
        const totalDaysToGenerate = targetWeeks * DAYS_PER_WEEK

        const days: HeatmapDay[] = []
        const todayKey = toDayKey(today)

        // Генерируем дни задом наперед (от старых к сегодня)
        for (let i = totalDaysToGenerate - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)

            const dayKey = toDayKey(date)
            const dayStats = stats.value.get(dayKey)

            days.push({
                dayKey,
                count: dayStats?.count ?? 0,
                hasPinned: dayStats?.hasPinned ?? false,
                isToday: dayKey === todayKey,
                inFuture: date.getTime() > today.getTime(),
                date: new Date(date)
            })
        }

        const grid: HeatmapDay[][] = []
        for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
            grid.push(days.slice(i, i + DAYS_PER_WEEK))
        }

        return grid
    })

    return { weeks, total, streak }
}