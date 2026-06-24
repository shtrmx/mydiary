<script setup lang="ts">
import { ref, watchEffect, inject, type Ref } from "vue"
import { useRouter } from "vue-router"
import { toast } from "vue-sonner"
import EntryEditor from "@/components/write/entryEditor.vue"
import { createEntry } from "@/lib/db/diary"
import type { EditorState } from "@/types/editor"

const router = useRouter()
const content = ref("")
const saving = ref(false)

const editorState = inject<Ref<EditorState>>("editorState", ref("closed"))
const canPublish = inject<Ref<boolean>>("canPublish", ref(false))
const publish = inject<Ref<() => void>>("publish", ref(() => { }))

function isEmpty(html: string): boolean {
    return html.replace(/<[^>]*>/g, "").trim().length === 0
}

watchEffect(() => {
    canPublish.value = !isEmpty(content.value)
})

async function doPublish() {
    if (isEmpty(content.value) || saving.value) return

    saving.value = true
    try {
        await createEntry(content.value)
        toast.success("Note saved")
        router.push("/home")
    } catch (e) {
        toast.error("Save error")
    } finally {
        saving.value = false
    }
}

publish.value = doPublish
</script>

<template>
    <div class="flex flex-1 flex-col gap-4" :class="editorState === 'closed' ? 'pb-4' : 'pb-0'">
        <EntryEditor v-model="content" />
    </div>
</template>