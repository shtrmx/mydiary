<script setup lang="ts">
import { ref, watchEffect, inject, type Ref, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import EntryEditor from "@/components/write/entryEditor.vue"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { db } from "@/lib/db/schema"
import { updateEntry, deleteEntry } from "@/lib/db/diary"
import type { DiaryEntry } from "@/lib/db/schema"
import type { EditorState } from "@/types/editor"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const route = useRoute()
const router = useRouter()

const entry = ref<DiaryEntry | null>(null)
const content = ref("")
const notFound = ref(false)
const saving = ref(false)

// Состояние для управления открытием диалога
const showDeleteDialog = ref(false)

const editorState = inject<Ref<EditorState>>("editorState", ref("closed"))
const canPublish = inject<Ref<boolean>>("canPublish", ref(false))
const publish = inject<Ref<() => void>>("publish", ref(() => { }))
const remove = inject<Ref<() => void>>("remove", ref(() => { }))

watchEffect(async () => {
    const id = Number(route.params.id)
    if (isNaN(id)) {
        notFound.value = true
        entry.value = null
        return
    }

    const found = await db.entries.get(id)
    if (found) {
        entry.value = found
        content.value = found.html ?? ""
        notFound.value = false
    } else {
        entry.value = null
        notFound.value = true
    }
})

function isEmpty(html: string) {
    return html.replace(/<[^>]*>/g, "").trim().length === 0
}

watchEffect(() => {
    canPublish.value = !isEmpty(content.value)
})

// Логика сохранения (переопределяем функцию из родителя через provide)
async function doSave() {
    if (!entry.value || isEmpty(content.value) || saving.value) return
    saving.value = true
    try {
        await updateEntry(entry.value.id, content.value)
        toast.success("Изменения сохранены")
    } catch {
        toast.error("Ошибка при сохранении")
    } finally {
        saving.value = false
    }
}
publish.value = doSave


async function doDelete() {
    if (!entry.value) return
    showDeleteDialog.value = false

    saving.value = true
    try {
        await deleteEntry(entry.value.id)
        toast.success("Запись удалена")
        router.push("/home")
    } catch {
        toast.error("Ошибка при удалении")
    } finally {
        saving.value = false
    }
}
remove.value = doDelete

onBeforeUnmount(() => {
    publish.value = () => { }
    remove.value = () => { }
})
</script>

<template>
    <div v-if="entry" class="flex flex-1 flex-col gap-4" :class="editorState === 'closed' ? 'pb-4' : 'pb-0'">

        <!-- Сам редактор -->
        <EntryEditor v-model="content" />
    </div>

    <Empty v-else-if="notFound">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                </svg>
            </EmptyMedia>
            <EmptyTitle>Запись не найдена</EmptyTitle>
            <EmptyDescription>Возможно, она уже была удалена.</EmptyDescription>
        </EmptyHeader>
    </Empty>

    <!-- Диалог удаления (всегда рендерится внутри блока entry или ниже) -->
    <AlertDialog v-model:open="showDeleteDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                <AlertDialogDescription>
                    Это действие нельзя отменить. Запись будет удалена без возможности восстановления.
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction @click="doDelete" :disabled="saving">
                    {{ saving ? 'Удаление...' : 'Удалить' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>