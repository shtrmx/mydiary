<script setup lang="ts">
import { computed, ref } from "vue"
import { Fire } from "@solar-icons/vue"
import { useEntryHeatmap } from "@/utils/hooks/useEntryHeatmap"

const CELL_PX = 12
const GAP_PX = 3

const { weeks, total, streak, periodLabel } = useEntryHeatmap()

function intensity(count: number): number {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    return 3
}

const gridWidth = computed(
    () =>
        weeks.value.length * CELL_PX +
        (weeks.value.length - 1) * GAP_PX,
)

const container = ref<HTMLElement | null>(null)

let isDragging = false
let startX = 0
let startScroll = 0

function startDrag(event: PointerEvent) {
    if (!container.value) return

    isDragging = true
    startX = event.clientX
    startScroll = container.value.scrollLeft

    container.value.setPointerCapture(event.pointerId)
}

function onDrag(event: PointerEvent) {
    if (!isDragging || !container.value) return

    const delta = event.clientX - startX
    container.value.scrollLeft = startScroll - delta
}

function stopDrag(event?: PointerEvent) {
    isDragging = false

    if (event && container.value) {
        container.value.releasePointerCapture(event.pointerId)
    }
}
</script>

<template>
    <div class="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-4">
        <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-2">
                <span class="font-heading text-2xl font-semibold tabular-nums">
                    {{ total }}
                </span>

                <span class="text-sm text-muted-foreground">
                    записей всего
                </span>
            </div>

            <span v-if="streak > 0" class="flex items-center gap-1 text-sm font-medium text-orange-500">
                <Fire weight="Bold" class="size-4" />
                {{ streak }}
                {{ streak === 1 ? "день" : "дней" }}
            </span>
        </div>

        <span class="text-center text-xs text-muted-foreground capitalize">
            {{ periodLabel }}
        </span>

        <div ref="container"
            class="overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none scrollbar-none"
            style="touch-action: pan-x" @pointerdown="startDrag" @pointermove="onDrag" @pointerup="stopDrag"
            @pointercancel="stopDrag" @pointerleave="stopDrag">
            <div class="flex w-max" :style="{
                width: `${gridWidth}px`,
                gap: `${GAP_PX}px`,
            }">
                <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="flex flex-col"
                    :style="{ gap: `${GAP_PX}px` }">
                    <div v-for="day in week" :key="day.dayKey" class="rounded-[3px] transition-colors" :class="day.isToday
                            ? 'ring-1 ring-pink-500/60 ring-offset-1 ring-offset-card'
                            : ''
                        " :style="{
                            width: `${CELL_PX}px`,
                            height: `${CELL_PX}px`,
                            backgroundColor:
                                day.inFuture
                                    ? 'transparent'
                                    : intensity(day.count) === 0
                                        ? 'var(--muted)'
                                        : day.hasPinned
                                            ? `color-mix(in oklch, var(--color-pink-500) ${intensity(day.count) * 30 + 10}%, transparent)`
                                            : `color-mix(in oklch, var(--primary) ${intensity(day.count) * 30 + 10}%, transparent)`,
                        }" :title="`${day.dayKey}: ${day.count} запис${day.count === 1 ? 'ь' : 'ей'}`" />
                </div>
            </div>
        </div>
    </div>
</template>