<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { TrashBinMinimalistic, DocumentText } from "@solar-icons/vue"
import EntryEditor from "@/components/write/entryEditor.vue"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from "@/lib/db/schema"
import { updateEntry, deleteEntry } from "@/lib/db/diary"
import type { DiaryEntry } from "@/lib/db/schema"

const route = useRoute()
const router = useRouter()

const entry = ref<DiaryEntry | null>(null)
const content = ref("")
const notFound = ref(false)

watchEffect(async () => {
    const id = Number(route.params.id)
    const found = await db.entries.get(id)

    entry.value = found ?? null
    content.value = found?.html ?? ""
    notFound.value = !found
})

let saveTimeout: ReturnType<typeof setTimeout> | null = null

function onContentChange(html: string) {
    content.value = html
    if (!entry.value) return

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(async () => {
        if (!entry.value) return
        await updateEntry(entry.value.id, html)
        toast.success("Изменения сохранены")
    }, 600)
}

async function onDelete() {
    if (!entry.value) return
    await deleteEntry(entry.value.id)
    toast.success("Запись удалена")
    router.push("/home")
}
</script>

<template>
    <div v-if="entry" class="flex flex-1 flex-col gap-4 pb-4">
        <EntryEditor :model-value="content" @update:model-value="onContentChange" />

        <AlertDialog>
            <AlertDialogTrigger as-child>
                <Button type="button" variant="ghost" class="ml-auto text-muted-foreground hover:text-destructive">
                    <TrashBinMinimalistic weight="Outline" class="size-4" />
                    Удалить
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие нельзя отменить. Запись будет удалена без возможности восстановления.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction @click="onDelete">Удалить</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>

    <Empty v-else-if="notFound">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <DocumentText weight="Outline" color="primary" />
            </EmptyMedia>

            <EmptyTitle>Запись не найдена</EmptyTitle>
            <EmptyDescription>Возможно, она уже была удалена.</EmptyDescription>
        </EmptyHeader>
    </Empty>
</template>