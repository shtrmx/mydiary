<script setup lang="ts">
import { isTelegramEnvironment } from "@/lib/telegram/core";
import { usePageTitle } from "@/utils/hooks/usePageTitle"
import { Settings, ArrowLeft, Compass, Magnifier } from "@solar-icons/vue";
import { Motion, AnimatePresence } from "motion-v"
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router"
import { useMagicKeys, whenever } from '@vueuse/core'
import { db } from "@/lib/db/schema"
import Fuse from "fuse.js"
import type { DiaryEntry } from "@/lib/db/schema"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

const title = usePageTitle()
const router = useRouter()

const canGoBack = computed(() => {
    return !!history.state?.back
})

function goBack() {
    if (history.state?.back) {
        router.back()
    } else {
        router.push("/")
    }
}

// --- Search Logic ---
const isSearchOpen = ref(false)
const searchQuery = ref("")
const allEntries = ref<DiaryEntry[]>([])
const fuse = ref<Fuse<DiaryEntry> | null>(null)

const { meta_k, ctrl_k } = useMagicKeys()

whenever(meta_k!, () => {
    isSearchOpen.value = true
})
whenever(ctrl_k!, () => {
    isSearchOpen.value = true
})

async function initSearch() {
    if (allEntries.value.length === 0) {
        allEntries.value = await db.entries.toArray()
        fuse.value = new Fuse(allEntries.value, {
            keys: ["plainText"],
            threshold: 0.4,
            includeMatches: true,
            ignoreLocation: true,
        })
    }
}

watch(isSearchOpen, async (open) => {
    if (open) {
        await initSearch()
    } else {
        searchQuery.value = ""
    }
})

const searchResults = computed(() => {
    if (!searchQuery.value.trim() || !fuse.value) {
        return [...allEntries.value].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20)
    }
    return fuse.value.search(searchQuery.value).map(r => r.item).slice(0, 20)
})

function goToEntry(id: number) {
    isSearchOpen.value = false
    router.push(`/add/entry/${id}`)
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}
</script>

<template>
    <div class="fixed right-0 left-0 z-60 flex justify-between px-4"
        :style="{ top: 'calc(var(--tg-content-safe-area-inset-top, 0px) + 7px)' }">

        <div class="flex items-center gap-1">
            <div v-show="!isTelegramEnvironment()" v-if="canGoBack"
                class="m-1 inline-flex h-8 items-center gap-2 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-5 px-2 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer"
                @click="goBack">
                <ArrowLeft weight="Outline" class="size-4 ml-2" />
                <p class="text-sm font-medium tracking-tight whitespace-nowrap">Back</p>
            </div>
            <div v-show="!isTelegramEnvironment()" v-else
                class="m-1 inline-flex h-8 items-center gap-2 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-5 px-2 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer">
                <Compass weight="Outline" class="size-4 ml-2" />
                <p class="text-sm font-medium tracking-tight whitespace-nowrap">Home</p>
            </div>

            <Motion v-show="!isTelegramEnvironment()" as="button" layout :initial="{ opacity: 0, scale: 0.8, x: -10 }"
                :animate="{ opacity: 1, scale: 1, x: 0 }" :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }"
                class="m-1 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-card/45 shadow-sm backdrop-blur-xl hover:bg-card/90 transition-colors duration-200 cursor-pointer"
                @click="isSearchOpen = true">
                <Magnifier weight="Outline" class="size-4 text-foreground" />
            </Motion>
        </div>

        <Motion as="header" layout="position" :transition="{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }"
            class="m-1 inline-flex h-8 items-center gap-3 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-5 px-2 shadow-sm backdrop-blur-xl justify-center">
            <img src="/logo_circle.svg" alt="Snipla Logo" class="size-6 rounded-full" />

            <AnimatePresence mode="wait">
                <Motion :key="title" as="h1" :initial="{ opacity: 0, y: 4 }" :animate="{ opacity: 1, y: 0 }"
                    :exit="{ opacity: 0, y: -4 }" :transition="{ duration: 0.15, ease: 'easeOut' }"
                    class="text-sm font-medium tracking-tight whitespace-nowrap">
                    {{ title }}
                </Motion>
            </AnimatePresence>
        </Motion>

        <div v-show="!isTelegramEnvironment()"
            class="m-1 inline-flex h-8 items-center gap-2 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-5 pl-2 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer"
            @click="$router.push('/settings')">
            <Settings weight="Outline" class="size-4 ml-2"></Settings>
            <p class="text-sm font-medium tracking-tight whitespace-nowrap">Settings</p>
        </div>

        <CommandDialog v-model:open="isSearchOpen">
            <Command :filter="() => 1">
                <CommandInput v-model="searchQuery" placeholder="Search notes..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup class="gap-0">
                        <CommandItem v-for="entry in searchResults" :key="entry.id" :value="String(entry.id)"
                            @select="goToEntry(entry.id)" class="flex flex-col items-start gap-1">
                            <span class="text-xs text-muted-foreground">
                                {{ formatDate(entry.createdAt) }}
                            </span>
                            <span class="text-sm line-clamp-2 text-foreground">
                                {{ entry.plainText || "Empty note" }}
                            </span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    </div>
</template>