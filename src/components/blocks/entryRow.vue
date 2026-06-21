<script setup lang="ts">
import { computed } from "vue"
import { Heart } from "@solar-icons/vue"
import type { DiaryEntry } from "@/lib/db/schema"
import { togglePinned } from "@/lib/db/diary"

const props = defineProps<{ entry: DiaryEntry }>()
const emit = defineEmits<{ open: [id: number]; pinToggled: [id: number, pinned: boolean] }>()

const preview = computed(() => {
    const words = props.entry.plainText.split(" ").filter(Boolean)
    const snippet = words.slice(0, 4).join(" ")
    return words.length > 4 ? `${snippet}…` : snippet || "Пустая запись"
})

const time = computed(() =>
    new Date(props.entry.createdAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    })
)

async function onPinClick(event: Event) {
    event.stopPropagation()
    const nextPinned = !props.entry.pinned
    emit("pinToggled", props.entry.id, nextPinned)
    await togglePinned(props.entry.id, nextPinned)
}
</script>

<template>
    <button type="button"
        class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/40"
        @click="emit('open', entry.id)">
        <span class="flex items-center gap-1.5 truncate text-sm">
            <Heart v-if="entry.pinned" weight="Bold" class="size-3 shrink-0 text-pink-500" />
            <span class="truncate text-foreground/90">{{ preview }}</span>
        </span>

        <span class="flex shrink-0 items-center gap-2">
            <span class="text-xs tabular-nums text-muted-foreground">{{ time }}</span>

            <span class="rounded-md p-1 transition-colors"
                :class="entry.pinned ? 'text-pink-500' : 'text-muted-foreground/40 hover:text-muted-foreground'"
                @click="onPinClick">
                <Heart :weight="entry.pinned ? 'Bold' : 'Outline'" class="size-3.5" />
            </span>
        </span>
    </button>
</template>