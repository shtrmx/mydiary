<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { CheckCircle } from "@solar-icons/vue"
import EntryEditor from "@/components/write/entryEditor.vue"
import { createEntry } from "@/lib/db/diary"

const router = useRouter()
const content = ref("")
const saving = ref(false)

function isEmpty(html: string): boolean {
    return html.replace(/<[^>]*>/g, "").trim().length === 0
}

async function save() {
    if (isEmpty(content.value) || saving.value) return

    saving.value = true
    await createEntry(content.value)
    router.push("/home")
}
</script>

<template>
    <div class="flex flex-1 flex-col gap-4 pb-4">
        <EntryEditor v-model="content" />

        <button type="button"
            class="ml-auto flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            :disabled="isEmpty(content) || saving" @click="save">
            <CheckCircle weight="Bold" class="size-4" />
            Сохранить
        </button>
    </div>
</template>