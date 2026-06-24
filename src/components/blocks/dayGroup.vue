<script setup lang="ts">
import { computed } from "vue"
import type { DayGroup } from "@/utils/hooks/useDayFeed"
import EntryRow from "./entryRow.vue"

const props = defineProps<{ group: DayGroup }>()
const emit = defineEmits<{ open: [id: number]; pinToggled: [id: number, pinned: boolean] }>()

const label = computed(() => {
    const [year, month, day] = props.group.dayKey.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

    if (isSameDay(date, today)) return "Today"
    if (isSameDay(date, yesterday)) return "Tommorow"

    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" })
})
</script>

<template>
    <section class="flex flex-col gap-1">
        <h3 class="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {{ label }}
        </h3>

        <div class="flex flex-col">
            <EntryRow v-for="entry in group.entries" :key="entry.id" :entry="entry" @open="emit('open', $event)"
                @pin-toggled="(id, pinned) => emit('pinToggled', id, pinned)" />
        </div>
    </section>
</template>