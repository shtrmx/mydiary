<script setup lang="ts">
import { usePageTitle } from "@/utils/hooks/usePageTitle"
import { Motion, AnimatePresence } from "motion-v"

const title = usePageTitle()
</script>

<template>
    <div class="fixed right-0 left-0 z-60 flex justify-center px-4"
        :style="{ top: 'calc(var(--tg-content-safe-area-inset-top, 0px) + 7px)' }">
        <Motion as="header" layout="position" :transition="{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }"
            class="m-1 inline-flex h-8 items-center gap-3 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-5 pl-2 shadow-sm backdrop-blur-xl">
            <img src="/logo_circle.svg" alt="Snipla Logo" class="size-6 rounded-full" />

            <AnimatePresence mode="wait">
                <Motion :key="title" as="h1" :initial="{ opacity: 0, y: 4 }" :animate="{ opacity: 1, y: 0 }"
                    :exit="{ opacity: 0, y: -4 }" :transition="{ duration: 0.15, ease: 'easeOut' }"
                    class="text-sm font-medium tracking-tight whitespace-nowrap">
                    {{ title }}
                </Motion>
            </AnimatePresence>
        </Motion>
    </div>
</template>