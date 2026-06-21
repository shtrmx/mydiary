<script setup lang="ts">
import { RouterView, useRoute } from "vue-router"
import { computed, provide, ref, watch } from "vue"

import Header from "@/components/blocks/header.vue"
import DockBar from "@/components/blocks/dockBar.vue"
import { useElementSize } from "@/utils/hooks/useElementSize"
import type { EditorState } from "@/types/editor"

const headerRef = ref<HTMLElement | null>(null)
const dockRef = ref<HTMLElement | null>(null)
const route = useRoute()
const isWriting = computed(() => route.path.startsWith("/add"))

const editorState = ref<EditorState>("closed")
const canPublish = ref(false)
const publish = ref<() => void>(() => { })
const remove = ref<() => void>(() => { })

provide("editorState", editorState)
provide("canPublish", canPublish)
provide("publish", publish)
provide("remove", remove)

const { height: headerHeight } = useElementSize(headerRef)
const { height: dockHeight } = useElementSize(dockRef)

const mainStyle = computed(() => ({
    paddingTop: `calc(${headerHeight.value}px + var(--tg-safe-area-inset-top, 0px) + 1rem)`,
    paddingBottom: isWriting.value
        ? "calc(env(safe-area-inset-bottom) + 60px)"
        : `calc(${dockHeight.value}px + var(--tg-safe-area-inset-bottom, 0px) + 3rem)`,
}))
provide("headerHeight", headerHeight)
watch(headerHeight, (h) => {
    if (h > 0) {
        document.documentElement.style.setProperty('--app-header-height', `${h}px`)
    }
}, { immediate: true })
</script>

<template>
    <div class="flex h-dvh flex-col overflow-hidden bg-background">
        <Header ref="headerRef" />

        <main class="flex-1 overflow-y-auto" :style="mainStyle">
            <div class="mx-auto flex min-h-full max-w-7xl flex-col px-4 md:px-6">
                <RouterView />
            </div>
        </main>

        <DockBar ref="dockRef" />
    </div>
</template>