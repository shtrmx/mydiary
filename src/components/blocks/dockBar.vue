<script setup lang="ts">
import { Home2, AddCircle, Settings, CheckCircle, CloseCircle, TrashBinMinimalistic } from "@solar-icons/vue"
import { RouterLink, useRoute } from "vue-router"
import { Motion } from "motion-v"
import { computed, inject, type Ref, ref } from "vue"
import { Button } from "@/components/ui/button"
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const route = useRoute()
const isWriting = computed(() => route.path.startsWith("/add"))
const isEntryRoute = computed(() => route.path.startsWith("/add/entry"))

const editorState = inject<Ref<EditorState>>("editorState", ref("closed"))
const canPublish = inject<Ref<boolean>>("canPublish", ref(false))
const publish = inject<Ref<() => void>>("publish", ref(() => { }))
const remove = inject<Ref<() => void>>("remove", ref(() => { }))

const showToolbar = computed(() => isWriting.value && editorState.value === "focused")

const items = [
    { to: "/home", icon: Home2, label: "Home" },
    { to: "/add", icon: AddCircle, label: "Write" },
    { to: "/settings", icon: Settings, label: "Settings" },
]
</script>

<template>
    <div class="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
        :class="[showToolbar ? 'bottom-2' : 'bottom-[calc(var(--tg-content-safe-area-inset-bottom,0px)+24px)]']">
        <nav class="flex items-center gap-2 rounded-full border border-border bg-card/70 p-1 shadow-lg backdrop-blur-xl transition-all duration-300"
            :class="[showToolbar ? 'h-13 max-w-[calc(100vw-7rem)]' : 'h-16']">
            <RouterLink v-for="item in items" :key="item.to" :to="item.to" v-slot="{ href, navigate, isExactActive }"
                custom>
                <a v-show="!showToolbar" :href="href" @click="navigate" class="relative z-10 flex h-full">
                    <div class="relative flex min-w-24 flex-col items-center justify-center gap-1 rounded-3xl px-4 py-1 transition-colors"
                        :class="[
                            (item.to === '/home' ? isExactActive : $route.path.startsWith(item.to))
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                        ]">
                        <Motion v-if="(item.to === '/home' ? isExactActive : $route.path.startsWith(item.to))"
                            class="absolute inset-0 -z-10 rounded-full bg-primary" :initial="{ opacity: 0, scale: 0.8 }"
                            :animate="{ opacity: 1, scale: 1 }"
                            :transition="{ type: 'spring', stiffness: 300, damping: 25 }" />

                        <component :is="item.icon"
                            :weight="(item.to === '/home' ? isExactActive : $route.path.startsWith(item.to)) ? 'Bold' : 'Linear'"
                            class="size-6" />
                        <span class="text-xs">{{ item.label }}</span>
                    </div>
                </a>
            </RouterLink>

            <div id="dock-toolbar-slot" v-show="showToolbar"
                class="flex h-full items-center gap-1.5 overflow-x-auto px-1 scrollbar-hide"></div>
        </nav>

        <Motion v-if="isWriting && editorState === 'open'" :initial="{ opacity: 0, scale: 0.7 }"
            :animate="{ opacity: 1, scale: 1 }" :transition="{ type: 'spring', stiffness: 300, damping: 22 }"
            class="flex gap-2">
            <Button type="button" size="icon" class="size-12 rounded-full shadow-lg backdrop-blur-lg"
                :disabled="!canPublish" aria-label="Сохранить" @click="publish()">
                <CheckCircle weight="Bold" class="size-7" />
            </Button>

            <AlertDialog v-if="isEntryRoute">
                <AlertDialogTrigger as-child>
                    <Button size="icon" variant="default"
                        class="size-12 rounded-full shadow-lg bg-card/70 backdrop-blur-lg hover:bg-card/90"
                        aria-label="Удалить запись">
                        <TrashBinMinimalistic weight="Bold" class="size-5 text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent class="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>You're sure to delete this note?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action is irreversible. The recording will be permanently deleted from the app's
                            memory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter class="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                        <AlertDialogCancel class="rounded-xl mt-0">Close</AlertDialogCancel>
                        <AlertDialogAction
                            class="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            @click="remove()">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Motion>

        <Motion v-else-if="showToolbar" :initial="{ opacity: 0, scale: 0.7 }" :animate="{ opacity: 1, scale: 1 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 22 }">
            <Button type="button" size="icon" variant="default"
                class="size-10 my-auto rounded-full shadow-lg bg-card/70 backdrop-blur-lg hover:bg-card/90"
                aria-label="Close editor" @click="editorState = 'open'">
                <CloseCircle weight="Bold" class="size-6 text-destructive" />
            </Button>
        </Motion>
    </div>
</template>