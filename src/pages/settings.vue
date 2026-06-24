<script setup lang="ts">
import { ref } from "vue"
import { toast } from "vue-sonner"
import {
    Download,
    Upload,
    TrashBinMinimalistic,
    Sun,
    Moon,
    AltArrowRight,
    Settings, User
} from "@solar-icons/vue"

import { getTelegramProfile } from "@/lib/telegram/profile"
import {
    exportAllEntries,
    downloadExport,
    importEntries,
    deleteAllEntries,
    ImportError,
} from "@/lib/db/backup"

import { useThemeStore } from "@/utils/stores/theme"
import { useLiveQuery } from "@/utils/hooks/useLiveQuery"
import { getTotalEntryCount } from "@/lib/db/diary"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

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


import EditDialog from "@/components/blocks/editDialog.vue"

const appVersion = __APP_VERSION__

const profile = getTelegramProfile()
const theme = useThemeStore()

const totalEntries = useLiveQuery(getTotalEntryCount, 0)

const importInput = ref<HTMLInputElement | null>(null)

const importing = ref(false)
const exporting = ref(false)
const deleting = ref(false)

async function onExport() {
    exporting.value = true

    try {
        const blob = await exportAllEntries()
        downloadExport(blob)

        toast.success("File was saved!")
    } finally {
        exporting.value = false
    }
}

function onImportClick() {
    importInput.value?.click()
}

async function onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (!file) return

    importing.value = true

    try {
        const count = await importEntries(file)
        toast.success(`Notes was imported: ${count}`)
    } catch (error) {
        toast.error(
            error instanceof ImportError
                ? error.message
                : "Unable to import file(",
        )
    } finally {
        importing.value = false

        if (importInput.value) {
            importInput.value.value = ""
        }
    }
}

async function onDeleteAll() {
    deleting.value = true

    try {
        await deleteAllEntries()
        toast.success("All data was deleted")
    } finally {
        deleting.value = false
    }
}
</script>

<template>
    <div class="space-y-6 pb-8">

        <Card class="p-4">
            <div class="flex items-center gap-4">

                <template v-if="profile">
                    <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="Avatar"
                        class="size-16 rounded-full object-cover">

                    <div v-else
                        class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
                        {{ (profile.displayName ?? "T")[0].toUpperCase() }}
                    </div>

                    <div class="min-w-0 flex-1">
                        <h2 class="truncate font-heading text-lg font-semibold">
                            {{ profile.displayName }}
                        </h2>

                        <p v-if="profile.username" class="text-sm text-muted-foreground truncate">
                            @{{ profile.username }}
                        </p>
                    </div>
                </template>

                <template v-else>
                    <div class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User weight="Bold" class="size-8" />
                    </div>

                    <div class="min-w-0 flex-1">
                        <h2 class="truncate font-heading text-lg font-semibold">
                            Local profile
                        </h2>

                        <p class="text-sm text-muted-foreground truncate">
                            All data was saved on this device
                        </p>
                    </div>
                </template>

                <div class="flex flex-col items-end gap-1">
                    <Badge variant="secondary" class="font-mono font-medium px-2.5 py-0.5">
                        {{ totalEntries }}
                    </Badge>
                </div>

            </div>
        </Card>

        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-muted-foreground">
                Data
            </h3>

            <Card class="py-0">
                <div class="divide-y">

                    <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                        @click="onExport">
                        <div class="flex items-center gap-3">
                            <Download class="size-5" />
                            <span>Export notes</span>
                        </div>

                        <Spinner v-if="exporting" class="size-4 animate-spin" />

                        <AltArrowRight v-else class="size-5 text-muted-foreground" />
                    </button>

                    <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                        @click="onImportClick">
                        <div class="flex items-center gap-3">
                            <Upload class="size-5" />
                            <span>Import notes</span>
                        </div>

                        <Spinner v-if="importing" class="size-4 animate-spin" />

                        <AltArrowRight v-else class="size-5 text-muted-foreground" />
                    </button>

                </div>
            </Card>

            <input ref="importInput" type="file" accept="application/json" class="hidden" @change="onFileSelected">
        </div>
        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-muted-foreground">
                Appearence
            </h3>

            <Card class="py-0">
                <div class="divide-y">
                    <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                        @click="theme.toggle()">
                        <div class="flex items-center gap-3">

                            <Sun v-if="theme.mode === 'light'" class="size-5" />

                            <Moon v-else class="size-5" />

                            <span>Interface theme</span>

                        </div>

                        <span class="text-sm text-muted-foreground">
                            {{
                                theme.mode === "light"
                                    ? "Light"
                                    : "Dark"
                            }}
                        </span>
                    </button>

                    <EditDialog>
                        <button
                            class="flex w-full items-center justify-between transition-colors p-4 hover:bg-accent/50">
                            <div class="flex items-center gap-3">
                                <Settings class="size-5" weight="Outline" />
                                <span>Editor</span>
                            </div>
                            <AltArrowRight class="size-5 text-muted-foreground" />
                        </button>
                    </EditDialog>
                </div>
            </Card>
        </div>

        <!-- Danger -->

        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-destructive">
                Danger zone
            </h3>

            <Card class="border-destructive/20 py-0">

                <AlertDialog>

                    <AlertDialogTrigger as-child>

                        <button
                            class="flex w-full items-center gap-3 p-4 text-destructive transition-colors hover:bg-destructive/5">
                            <TrashBinMinimalistic class="size-5" />
                            <span>Delete all notes</span>
                        </button>

                    </AlertDialogTrigger>

                    <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                You're shure?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                All records will be deleted without the possibility of recovery.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>

                            <AlertDialogCancel :disabled="deleting">
                                Close
                            </AlertDialogCancel>

                            <AlertDialogAction :disabled="deleting" @click="onDeleteAll">
                                <Spinner v-if="deleting" class="size-4 animate-spin" />

                                <span v-else>
                                    Delete
                                </span>
                            </AlertDialogAction>

                        </AlertDialogFooter>

                    </AlertDialogContent>

                </AlertDialog>

            </Card>
        </div>

    </div>
    <p class="text-xs text-muted-foreground font-mono text-center w-full">
        Web app v{{ appVersion }}
    </p>

</template>

<style>
[data-active="true"] {
    background: var(--accent);
}
</style>