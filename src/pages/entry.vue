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
import { Documents } from "@solar-icons/vue"

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

async function doSave() {
    if (!entry.value || isEmpty(content.value) || saving.value) return
    saving.value = true
    try {
        await updateEntry(entry.value.id, content.value)
        toast.success("Changes saved")
    } catch {
        toast.error("Save error")
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
        toast.success("Note deleted")
        router.push("/home")
    } catch {
        toast.error("Delete error")
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
        <EntryEditor v-model="content" />
    </div>

    <Empty v-else-if="notFound">
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <Documents weight="Outline" />
            </EmptyMedia>
            <EmptyTitle>Note wasn't founded</EmptyTitle>
            <EmptyDescription>It may have already been removed.</EmptyDescription>
        </EmptyHeader>
    </Empty>

    <AlertDialog v-model:open="showDeleteDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. The entry will be permanently deleted.
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction @click="doDelete" :disabled="saving">
                    {{ saving ? 'Deleting...' : 'Delete' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>