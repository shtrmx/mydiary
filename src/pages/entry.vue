<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { TrashBinMinimalistic } from "@solar-icons/vue"
import EntryEditor from "@/components/write/entryEditor.vue"
import { db } from "@/lib/db/schema"
import { updateEntry, deleteEntry } from "@/lib/db/diary"
import type { DiaryEntry } from "@/lib/db/schema"

const route = useRoute()
const router = useRouter()

const entry = ref<DiaryEntry | null>(null)
const content = ref("")

watchEffect(async () => {
    const id = Number(route.params.id)
    entry.value = (await db.entries.get(id)) ?? null
    content.value = entry.value?.html ?? ""
})

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function onContentChange(html: string) {
    content.value = html
    if (!entry.value) return

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
        if (entry.value) updateEntry(entry.value.id, html)
    }, 500)
}

async function onDelete() {
    if (!entry.value) return
    await deleteEntry(entry.value.id)
    router.push("/home")
}
</script>

<template>
    <div v-if="entry" class="flex flex-1 flex-col gap-4 pb-4">
        <EntryEditor :model-value="content" @update:model-value="onContentChange" />

        <button type="button"
            class="ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            @click="onDelete">
            <TrashBinMinimalistic weight="Outline" class="size-4" />
            Удалить
        </button>
    </div>

    <p v-else class="py-8 text-center text-sm text-muted-foreground">
        Запись не найдена
    </p>
</template>