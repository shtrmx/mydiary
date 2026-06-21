<script setup lang="ts">
import { computed, ref } from "vue"
import { useEntryHeatmap } from "@/utils/hooks/useEntryHeatmap"
import { useElementWidth } from "@/utils/hooks/useElementWidth"

const GAP_PX = 3
const MIN_CELL_PX = 11
const MAX_CELL_PX = 16

const gridRef = ref<HTMLElement | null>(null)
const containerWidth = useElementWidth(gridRef)

const weeksVisible = computed(() => {
    if (containerWidth.value === 0) return 18
    return Math.max(4, Math.floor((containerWidth.value + GAP_PX) / (MIN_CELL_PX + GAP_PX)))
})

const cellSize = computed(() => {
    if (containerWidth.value === 0 || weeksVisible.value === 0) return MIN_CELL_PX
    const raw = (containerWidth.value - (weeksVisible.value - 1) * GAP_PX) / weeksVisible.value
    return Math.min(MAX_CELL_PX, Math.max(MIN_CELL_PX, raw))
})

const { weeks, total } = useEntryHeatmap(weeksVisible)

function intensity(count: number): number {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    return 3
}

const todayCount = computed(() => {
    const lastWeek = weeks.value[weeks.value.length - 1]
    return lastWeek?.find((day) => day.isToday)?.count ?? 0
})
</script>

<template>
    <div class="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-4">
        <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-2">
                <span class="font-heading text-2xl font-semibold tabular-nums">{{ total }}</span>
                <span class="text-sm text-muted-foreground">записей всего</span>
            </div>

            <span class="text-xs text-muted-foreground">сегодня: {{ todayCount }}</span>
        </div>

        <div ref="gridRef" class="flex justify-between" :style="{ gap: `${GAP_PX}px` }">
            <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="flex flex-col"
                :style="{ gap: `${GAP_PX}px` }">
                <div v-for="day in week" :key="day.dayKey" class="rounded-[3px] transition-colors" :class="[
                    day.isToday ? 'ring-1 ring-pink-500/60 ring-offset-1 ring-offset-card' : '',
                ]" :style="{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor:
                            intensity(day.count) === 0
                                ? 'var(--muted)'
                                : day.hasPinned
                                    ? `color-mix(in oklch, var(--color-pink-500) ${intensity(day.count) * 30 + 10}%, transparent)`
                                    : `color-mix(in oklch, var(--primary) ${intensity(day.count) * 30 + 10}%, transparent)`,
                    }" :title="`${day.dayKey}: ${day.count} запис${day.count === 1 ? 'ь' : 'ей'}`" />
            </div>
        </div>
    </div>
</template>