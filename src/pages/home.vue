<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import EntryHeatmap from "@/components/blocks/entryHeatmap.vue"
import DayGroup from "@/components/blocks/dayGroup.vue"
import { useDayFeed } from "@/utils/hooks/useDayFeed"
import { useIntersectionTrigger } from "@/utils/hooks/useIntersectionTrigger"
import { useScrollDirection } from "@/utils/hooks/useScrollDirection"
import { useElementSize } from "@/utils/hooks/useElementSize"

const router = useRouter()
const { groups, loading, exhausted, loadMore, reset, setPinned } = useDayFeed()
const sentinel = ref<HTMLElement | null>(null)
const root = ref<HTMLElement | null>(null)
const heatmapWrapper = ref<HTMLElement | null>(null)

const heatmapHidden = useScrollDirection(root)
const { height: heatmapHeight } = useElementSize(heatmapWrapper)

useIntersectionTrigger(sentinel, loadMore)
onMounted(reset)

function openEntry(id: number) {
    router.push(`/add/entry/${id}`)
}
</script>

<template>
    <div ref="root" class="flex flex-1 flex-col gap-5">
        <div class="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
            :class="heatmapHidden ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'"
            :style="{ maxHeight: heatmapHidden ? '0px' : `${heatmapHeight || 200}px` }">
            <div ref="heatmapWrapper">
                <EntryHeatmap />
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <DayGroup v-for="group in groups" :key="group.dayKey" :group="group" @open="openEntry"
                @pin-toggled="setPinned" />
        </div>

        <p v-if="exhausted && groups.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            Записей пока нет — начните с первой
        </p>

        <div ref="sentinel" class="h-4" />
    </div>
</template>