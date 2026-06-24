<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue"
import { useRouter } from "vue-router"
import { AltArrowUp, Documents } from "@solar-icons/vue"
import EntryHeatmap from "@/components/blocks/entryHeatmap.vue"
import DayGroup from "@/components/blocks/dayGroup.vue"
import { useDayFeed } from "@/utils/hooks/useDayFeed"
import { useIntersectionTrigger } from "@/utils/hooks/useIntersectionTrigger"
import { useScrollDirection } from "@/utils/hooks/useScrollDirection"
import { useElementSize } from "@/utils/hooks/useElementSize"
import { Motion } from "motion-v"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty"


const router = useRouter()
const { groups, exhausted, loadMore, reset, setPinned } = useDayFeed()
const sentinel = ref<HTMLElement | null>(null)
const root = ref<HTMLElement | null>(null)
const heatmapWrapper = ref<HTMLElement | null>(null)

const { hidden: heatmapHidden, isScrolled, scrollToTop } = useScrollDirection(root)
const { height: heatmapHeight } = useElementSize(heatmapWrapper)

useIntersectionTrigger(sentinel, loadMore)
onMounted(reset)

function openEntry(id: number) {
    router.push(`/add/entry/${id}`)
}

async function scrollToDay(dayKey: string) {
    let el = document.getElementById(`day-${dayKey}`)

    while (!el && !exhausted.value) {
        const lastLoaded = groups.value[groups.value.length - 1]
        if (lastLoaded && lastLoaded.dayKey < dayKey) break

        const prevLength = groups.value.length
        await loadMore()
        if (groups.value.length === prevLength) break

        await nextTick()
        el = document.getElementById(`day-${dayKey}`)
    }

    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })

        el.classList.add("ring-2", "ring-primary/50", "ring-offset-4", "ring-offset-background", "rounded-xl", "transition-all", "duration-500")
        setTimeout(() => {
            el?.classList.remove("ring-2", "ring-primary/50", "ring-offset-4", "ring-offset-background")
        }, 1200)
    }
}
</script>

<template>
    <div ref="root" class="flex flex-1 flex-col gap-5">

        <div class="sticky top-0 z-30 overflow-hidden transition-all duration-300 ease-out"
            :class="heatmapHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pt-1 pb-3'"
            :style="{ maxHeight: heatmapHidden ? '0px' : `${(heatmapHeight || 200) + 16}px` }">
            <div ref="heatmapWrapper">
                <EntryHeatmap @day-click="scrollToDay" />
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <DayGroup v-for="group in groups" :key="group.dayKey" :id="`day-${group.dayKey}`" :group="group"
                @open="openEntry" @pin-toggled="setPinned" />
        </div>

        <Empty v-if="exhausted && groups.length === 0">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Documents weight="Outline" color="primary" />
                </EmptyMedia>
                <EmptyTitle>
                    There are no notes yet
                </EmptyTitle>

                <EmptyDescription>
                    Create your first entry to start your diary
                </EmptyDescription>
            </EmptyHeader>
        </Empty>

        <div ref="sentinel" class="h-4" />

        <Motion v-if="isScrolled" as="button" @click="scrollToTop" :initial="{
            opacity: 0,
            scale: 0.8,
            y: 24,
        }" :animate="{
            opacity: 1,
            scale: 1,
            y: 0,
        }" :exit="{
            opacity: 0,
            scale: 0.8,
            y: 24,
        }" :transition="{
            duration: 0.25,
            ease: 'easeOut',
        }"
            class="fixed bottom-24 right-4 md:right-8 z-40 flex size-12 items-center justify-center rounded-full bg-primary/40 backdrop-blur-xs text-primary-foreground shadow-lg ring-1 ring-primary/60 hover:bg-primary/50">
            <AltArrowUp icon-style="Bold" class="size-6" />
        </Motion>
    </div>
</template>