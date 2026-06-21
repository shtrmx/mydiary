<script setup lang="ts">
import { ref } from "vue"
import { Download, Upload, TrashBinMinimalistic } from "@solar-icons/vue"
import { getTelegramProfile } from "@/lib/telegram/profile"
import { exportAllEntries, downloadExport, importEntries, deleteAllEntries, ImportError } from "@/lib/db/backup"

const profile = getTelegramProfile()

const importInput = ref<HTMLInputElement | null>(null)
const importStatus = ref<string | null>(null)
const importError = ref<string | null>(null)
const confirmingDelete = ref(false)
const deleting = ref(false)
const deleted = ref(false)

async function onExport() {
    const blob = await exportAllEntries()
    downloadExport(blob)
}

function onImportClick() {
    importInput.value?.click()
}

async function onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    importStatus.value = null
    importError.value = null

    try {
        const count = await importEntries(file)
        importStatus.value = `Импортировано записей: ${count}`
    } catch (error) {
        importError.value = error instanceof ImportError ? error.message : "Не удалось импортировать файл"
    } finally {
        if (importInput.value) importInput.value.value = ""
    }
}

async function onDeleteConfirm() {
    if (!confirmingDelete.value) {
        confirmingDelete.value = true
        return
    }

    deleting.value = true
    await deleteAllEntries()
    deleting.value = false
    confirmingDelete.value = false
    deleted.value = true
}

function onDeleteCancel() {
    confirmingDelete.value = false
}
</script>

<template>
    <div class="flex flex-1 flex-col gap-6 pb-4">
        <section class="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/40 p-4">
            <img v-if="profile?.photoUrl" :src="profile.photoUrl" alt="" class="size-12 rounded-full object-cover" />
            <div v-else
                class="flex size-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
                {{ (profile?.displayName ?? "?").charAt(0).toUpperCase() }}
            </div>

            <div class="flex flex-col">
                <span class="font-medium">{{ profile?.displayName ?? "Гость" }}</span>
                <span v-if="profile?.username" class="text-sm text-muted-foreground">@{{ profile.username }}</span>
                <span v-else-if="!profile" class="text-sm text-muted-foreground">Открыто вне Telegram</span>
            </div>
        </section>

        <section class="flex flex-col gap-2">
            <h2 class="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Данные</h2>

            <button type="button"
                class="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/40"
                @click="onExport">
                <Download weight="Outline" class="size-4 text-muted-foreground" />
                Экспортировать записи
            </button>

            <button type="button"
                class="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/40"
                @click="onImportClick">
                <Upload weight="Outline" class="size-4 text-muted-foreground" />
                Импортировать записи
            </button>

            <input ref="importInput" type="file" accept="application/json" class="hidden" @change="onFileSelected" />

            <p v-if="importStatus" class="px-1 text-sm text-primary">{{ importStatus }}</p>
            <p v-if="importError" class="px-1 text-sm text-destructive">{{ importError }}</p>
        </section>

        <section class="flex flex-col gap-2">
            <h2 class="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Опасная зона</h2>

            <div v-if="!confirmingDelete">
                <button type="button"
                    class="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    @click="onDeleteConfirm">
                    <TrashBinMinimalistic weight="Outline" class="size-4" />
                    Удалить все данные
                </button>

                <p v-if="deleted" class="mt-2 px-1 text-sm text-muted-foreground">Все данные удалены</p>
            </div>

            <div v-else class="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <p class="text-sm">Это удалит все записи без возможности восстановления.</p>

                <div class="flex gap-2">
                    <button type="button"
                        class="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        :disabled="deleting" @click="onDeleteConfirm">
                        Да, удалить всё
                    </button>

                    <button type="button"
                        class="flex-1 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent/40"
                        :disabled="deleting" @click="onDeleteCancel">
                        Отмена
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>