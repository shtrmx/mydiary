<script setup lang="ts">
import { isTelegramEnvironment } from "@/lib/telegram/core";
import { usePageTitle } from "@/utils/hooks/usePageTitle"
import { Settings, ArrowLeft, Compass } from "@solar-icons/vue";
import { Motion, AnimatePresence } from "motion-v"
import { computed } from "vue";
import { useRouter } from "vue-router"


const title = usePageTitle()
const router = useRouter()

const canGoBack = computed(() => {
    return !!history.state?.back || window.history.length > 1
})

function goBack() {
    if (!!history.state?.back) {
        router.back()
    } else if (window.history.length > 1) {
        window.history.back()
    } else {
        router.push("/")
    }
}

</script>

<template>
    <div class="fixed right-0 left-0 z-60 flex px-4 justi"
        :class="[isTelegramEnvironment() ? 'justify-center' : 'justify-between']"
        :style="{ top: 'calc(var(--tg-content-safe-area-inset-top, 0px) + 7px)' }">

        <div class="flex items-center gap-1">
            <div v-show="!isTelegramEnvironment()" v-if="canGoBack"
                class="m-1 inline-flex h-7 items-center gap-1 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-2 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer"
                @click="goBack">
                <ArrowLeft weight="Outline" class="size-4 ml-2" />
                <p class="text-xs tracking-tight whitespace-nowrap">Back</p>
            </div>
            <div v-show="!isTelegramEnvironment()" v-else
                class="m-1 inline-flex h-7 items-center gap-1 overflow-hidden rounded-full border border-border/50 bg-card/45 pr-2 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer">
                <Compass weight="Outline" class="size-4 ml-2" />
                <p class="text-xs tracking-tight whitespace-nowrap">Home</p>
            </div>
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

        <div v-if="!isTelegramEnvironment()"
            class="m-1 inline-flex h-7 items-center gap-2 overflow-hidden rounded-full pr-2 border border-border/50 bg-card/45 shadow-sm backdrop-blur-xl justify-center hover:bg-card/90 transition-all duration-200 cursor-pointer"
            @click="$router.push('/settings')">
            <Settings weight="Outline" class="size-4 ml-2"></Settings>
            <p class="text-xs tracking-tight whitespace-nowrap">Settings</p>
        </div>
    </div>
</template>