<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { CheckCircle } from "@solar-icons/vue"
import EntryEditor from "@/components/write/entryEditor.vue"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
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
    toast.success("Запись сохранена")
    router.push("/home")
}
</script>

<template>
    <div class="flex flex-1 flex-col gap-4 pb-4">
        <EntryEditor v-model="content" />

        <Button type="button" class="ml-auto rounded-full" :disabled="isEmpty(content) || saving" @click="save">
            <Spinner v-if="saving" class="size-4 animate-spin" />
            <CheckCircle v-else weight="Bold" class="size-4" />
            Сохранить
        </Button>
    </div>
</template>