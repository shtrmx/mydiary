<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue"
import { Fire } from "@solar-icons/vue"
import { useEntryHeatmap } from "@/utils/hooks/useEntryHeatmap"
import type { HeatmapDay } from "@/utils/hooks/useEntryHeatmap"

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

const emit = defineEmits<{
    "day-click": [dayKey: string]
}>()

const CELL_PX = 12
const GAP_PX = 3
const COLUMN_WIDTH = CELL_PX + GAP_PX

const { weeks, total, streak } = useEntryHeatmap()

function intensity(count: number): number {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    return 3
}

// Помощник для правильного склонения
function getDeclension(number: number): string {
    const n = Math.abs(number) % 100
    const n1 = n % 10
    if (n > 10 && n < 20) return "записей"
    if (n1 > 1 && n1 < 5) return "записи"
    if (n1 === 1) return "запись"
    return "записей"
}

// Форматирование даты для тултипа
function formatTooltipDate(date: Date): string {
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

const gridWidth = computed(
    () => weeks.value.length * CELL_PX + (weeks.value.length - 1) * GAP_PX,
)

const container = ref<HTMLElement | null>(null)
const periodLabel = ref("")
const isInitialized = ref(false)

function updateVisiblePeriod() {
    if (!container.value || weeks.value.length === 0) return

    const scrollLeft = container.value.scrollLeft
    const clientWidth = container.value.clientWidth

    const firstVisibleIdx = Math.max(0, Math.floor(scrollLeft / COLUMN_WIDTH))
    const lastVisibleIdx = Math.min(
        weeks.value.length - 1,
        Math.floor((scrollLeft + clientWidth) / COLUMN_WIDTH)
    )

    const startWeek = weeks.value[firstVisibleIdx]
    const endWeek = weeks.value[lastVisibleIdx]

    if (!startWeek || !endWeek) return

    const startDate = startWeek[0].date
    const endDate = endWeek[endWeek.length - 1].date

    const startStr = startDate.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }).replace('.', '')
    const endStr = endDate.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }).replace('.', '')

    periodLabel.value = startStr === endStr ? startStr : `${startStr} — ${endStr}`
}

watch(weeks, async (newWeeks) => {
    if (newWeeks.length > 0 && !isInitialized.value) {
        isInitialized.value = true
        await nextTick()
        if (container.value) {
            container.value.scrollLeft = container.value.scrollWidth
            updateVisiblePeriod()
        }
    } else {
        updateVisiblePeriod()
    }
}, { immediate: true })

let isPointerDown = false
let startX = 0
let startScroll = 0
let dragDistance = 0

function startDrag(event: PointerEvent) {
    if (!container.value || event.pointerType !== "mouse") return
    isPointerDown = true
    dragDistance = 0
    startX = event.clientX
    startScroll = container.value.scrollLeft
}

function onDrag(event: PointerEvent) {
    if (!isPointerDown || !container.value) return
    const delta = event.clientX - startX

    dragDistance += Math.abs(event.movementX)

    if (dragDistance > 3) {
        container.value.scrollLeft = startScroll - delta
    }
}

function stopDrag() {
    isPointerDown = false
}

function handleDayClick(day: HeatmapDay) {
    if (dragDistance > 5) return
    if (day.count > 0) {
        emit('day-click', day.dayKey)
    }
}
</script>

<template>
    <div class="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-lg p-4">
        <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-2">
                <span class="font-heading text-2xl font-semibold tabular-nums">
                    {{ total }}
                </span>
                <span class="text-sm text-muted-foreground">
                    записей всего
                </span>
            </div>

            <span class="flex items-center gap-1 text-sm font-medium text-orange-500">
                <Fire weight="Bold" class="size-4" />
                {{ streak }}
                {{ streak === 1 ? "день" : "дней" }}
            </span>
        </div>

        <div ref="container"
            class="flex overflow-x-auto pb-1 cursor-grab active:cursor-grabbing select-none scrollbar-none items-center justify-center"
            style="touch-action: pan-x" @scroll="updateVisiblePeriod" @pointerdown="startDrag" @pointermove="onDrag"
            @pointerup="stopDrag" @pointerleave="stopDrag">

            <div class="flex w-max px-1 py-1" :style="{ width: `${gridWidth}px`, gap: `${GAP_PX}px` }">
                <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="flex flex-col"
                    :style="{ gap: `${GAP_PX}px` }">

                    <HoverCard v-for="day in week" :key="day.dayKey" :open-delay="200" :close-delay="100">
                        <HoverCardTrigger as-child>
                            <div class="rounded-[3px] transition-all" :class="[
                                day.isToday ? 'ring-1 ring-primary/70 ring-offset-1 ring-offset-card' : '',
                                day.count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-primary/60 hover:ring-offset-1 hover:ring-offset-card z-10 hover:z-20' : ''
                            ]" :style="{
                                width: `${CELL_PX}px`,
                                height: `${CELL_PX}px`,
                                backgroundColor: day.inFuture
                                    ? 'transparent'
                                    : intensity(day.count) === 0
                                        ? 'var(--muted)'
                                        : day.hasPinned
                                            ? `color-mix(in oklch, var(--color-pink-500) ${intensity(day.count) * 30 + 10}%, transparent)`
                                            : `color-mix(in oklch, var(--primary) ${intensity(day.count) * 30 + 10}%, transparent)`,
                            }" @click="handleDayClick(day)" />
                        </HoverCardTrigger>

                        <HoverCardContent :side="'top'" :side-offset="8" class="w-auto p-2 text-sm z-50">
                            <div class="flex flex-col gap-1">
                                <span class="font-medium text-foreground">
                                    {{ formatTooltipDate(day.date) }}
                                </span>
                                <span class="text-muted-foreground">
                                    {{ day.count }} {{ getDeclension(day.count) }}
                                </span>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                </div>
            </div>
        </div>
    </div>
</template>