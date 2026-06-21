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

        toast.success("Файл экспорта скачан")
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
        toast.success(`Импортировано записей: ${count}`)
    } catch (error) {
        toast.error(
            error instanceof ImportError
                ? error.message
                : "Не удалось импортировать файл",
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
        toast.success("Все данные удалены")
    } finally {
        deleting.value = false
    }
}
</script>

<template>
    <div class="space-y-6 pb-8">

        <!-- Profile -->

        <Card class="p-4">
            <div class="flex items-center gap-4">

                <img v-if="profile?.photoUrl" :src="profile.photoUrl" alt="Avatar"
                    class="size-16 rounded-full object-cover">

                <div v-else
                    class="flex size-16 items-center justify-center rounded-full bg-accent text-xl font-semibold">
                    {{ (profile?.displayName ?? "?")[0].toUpperCase() }}
                </div>

                <div class="min-w-0 flex-1">
                    <h2 class="truncate font-heading text-lg font-semibold">
                        {{ profile?.displayName ?? "Гость" }}
                    </h2>

                    <p class="text-sm text-muted-foreground">
                        @{{ profile?.username ?? "username" }}
                    </p>
                </div>

                <Badge variant="secondary">
                    {{ totalEntries }}
                </Badge>

            </div>
        </Card>

        <!-- Data -->

        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-muted-foreground">
                Данные
            </h3>

            <Card class="py-0">
                <div class="divide-y">

                    <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                        @click="onExport">
                        <div class="flex items-center gap-3">
                            <Download class="size-5 text-primary" />
                            <span>Экспортировать данные</span>
                        </div>

                        <Spinner v-if="exporting" class="size-4 animate-spin" />

                        <AltArrowRight v-else class="size-5 text-muted-foreground" />
                    </button>

                    <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                        @click="onImportClick">
                        <div class="flex items-center gap-3">
                            <Upload class="size-5 text-primary" />
                            <span>Импортировать данные</span>
                        </div>

                        <Spinner v-if="importing" class="size-4 animate-spin" />

                        <AltArrowRight v-else class="size-5 text-muted-foreground" />
                    </button>

                </div>
            </Card>

            <input ref="importInput" type="file" accept="application/json" class="hidden" @change="onFileSelected">
        </div>

        <!-- Appearance -->

        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-muted-foreground">
                Внешний вид
            </h3>

            <Card class="py-0">

                <button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50"
                    @click="theme.toggle()">
                    <div class="flex items-center gap-3">

                        <Sun v-if="theme.mode === 'light'" class="size-5" />

                        <Moon v-else class="size-5" />

                        <span>Тема оформления</span>

                    </div>

                    <span class="text-sm text-muted-foreground">
                        {{
                            theme.mode === "light"
                                ? "Светлая"
                                : "Тёмная"
                        }}
                    </span>
                </button>

            </Card>
        </div>

        <!-- Danger -->

        <div class="space-y-2">

            <h3 class="px-2 text-sm font-medium text-destructive">
                Опасная зона
            </h3>

            <Card class="border-destructive/20 py-0">

                <AlertDialog>

                    <AlertDialogTrigger as-child>

                        <button
                            class="flex w-full items-center gap-3 p-4 text-destructive transition-colors hover:bg-destructive/5">
                            <TrashBinMinimalistic class="size-5" />
                            <span>Удалить все данные</span>
                        </button>

                    </AlertDialogTrigger>

                    <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Удалить все данные?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                Все записи будут удалены без возможности восстановления.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>

                            <AlertDialogCancel :disabled="deleting">
                                Отмена
                            </AlertDialogCancel>

                            <AlertDialogAction :disabled="deleting" @click="onDeleteAll">
                                <Spinner v-if="deleting" class="size-4 animate-spin" />

                                <span v-else>
                                    Удалить
                                </span>
                            </AlertDialogAction>

                        </AlertDialogFooter>

                    </AlertDialogContent>

                </AlertDialog>

            </Card>

        </div>

    </div>
</template>