<script setup lang="ts">
import { ref } from "vue"
import { toast } from "vue-sonner"
import { Download, Upload, TrashBinMinimalistic, Sun, Moon } from "@solar-icons/vue"
import { getTelegramProfile } from "@/lib/telegram/profile"
import { exportAllEntries, downloadExport, importEntries, deleteAllEntries, ImportError } from "@/lib/db/backup"
import { useThemeStore } from "@/utils/stores/theme"
import { useLiveQuery } from "@/utils/hooks/useLiveQuery"
import { getTotalEntryCount } from "@/lib/db/diary"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    const blob = await exportAllEntries()
    downloadExport(blob)
    exporting.value = false
    toast.success("Файл экспорта скачан")
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
        toast.error(error instanceof ImportError ? error.message : "Не удалось импортировать файл")
    } finally {
        importing.value = false
        if (importInput.value) importInput.value.value = ""
    }
}

async function onDeleteAll() {
    deleting.value = true
    await deleteAllEntries()
    deleting.value = false
    toast.success("Все данные удалены")
}
</script>

<template>
    <div class="flex flex-1 flex-col gap-6 pb-4">
        <Card>
            <CardContent class="flex items-center gap-3">
                <img v-if="profile?.photoUrl" :src="profile.photoUrl" alt=""
                    class="size-12 rounded-full object-cover" />
                <div v-else
                    class="flex size-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
                    {{ (profile?.displayName ?? "?").charAt(0).toUpperCase() }}
                </div>

                <div class="flex flex-1 flex-col">
                    <span class="font-medium">{{ profile?.displayName ?? "Гость" }}</span>
                    <span v-if="profile?.username" class="text-sm text-muted-foreground">@{{ profile.username }}</span>
                    <span v-else-if="!profile" class="text-sm text-muted-foreground">Открыто вне Telegram</span>
                </div>

                <Badge variant="secondary">{{ totalEntries }} записей</Badge>
            </CardContent>
        </Card>

        <section class="flex flex-col gap-2">
            <h2 class="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Внешний вид</h2>

            <Card>
                <CardContent class="flex items-center justify-between">
                    <span class="text-sm">Тема оформления</span>

                    <ToggleGroup type="single" :model-value="theme.mode" size="sm"
                        @update:model-value="(value) => value && theme.set(value as 'light' | 'dark')">
                        <ToggleGroupItem value="light" aria-label="Светлая тема">
                            <Sun weight="Bold" class="size-4" />
                            Светлая
                        </ToggleGroupItem>
                        <ToggleGroupItem value="dark" aria-label="Тёмная тема">
                            <Moon weight="Bold" class="size-4" />
                            Тёмная
                        </ToggleGroupItem>
                    </ToggleGroup>
                </CardContent>
            </Card>
        </section>

        <Separator />

        <section class="flex flex-col gap-2">
            <h2 class="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Данные</h2>

            <Card>
                <CardContent class="flex flex-col gap-2">
                    <Button type="button" variant="outline" class="justify-start" :disabled="exporting"
                        @click="onExport">
                        <Spinner v-if="exporting" class="size-4 animate-spin" />
                        <Download v-else weight="Outline" class="size-4" />
                        Экспортировать записи
                    </Button>

                    <Button type="button" variant="outline" class="justify-start" :disabled="importing"
                        @click="onImportClick">
                        <Spinner v-if="importing" class="size-4 animate-spin" />
                        <Upload v-else weight="Outline" class="size-4" />
                        Импортировать записи
                    </Button>

                    <input ref="importInput" type="file" accept="application/json" class="hidden"
                        @change="onFileSelected" />
                </CardContent>
            </Card>
        </section>

        <Separator />

        <section class="flex flex-col gap-2">
            <h2 class="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Опасная зона</h2>

            <Card class="border-destructive/30">
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger as-child>
                            <Button type="button" variant="ghost"
                                class="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <TrashBinMinimalistic weight="Outline" class="size-4" />
                                Удалить все данные
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Удалить все данные?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Это удалит все записи дневника без возможности восстановления. Перед удалением
                                    рекомендуем сделать экспорт.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel :disabled="deleting">Отмена</AlertDialogCancel>
                                <AlertDialogAction :disabled="deleting" @click="onDeleteAll">
                                    <Spinner v-if="deleting" class="size-4 animate-spin" />
                                    Да, удалить всё
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </section>
    </div>
</template>