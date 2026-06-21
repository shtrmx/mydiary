<script setup lang="ts">
import { Home2, AddCircle, Settings } from "@solar-icons/vue"
import { RouterLink } from "vue-router"
import { Motion } from "motion-v"

const items = [
    { to: "/home", icon: Home2, label: "Home" },
    { to: "/add", icon: AddCircle, label: "Write" },
    { to: "/settings", icon: Settings, label: "Settings" },
]
</script>

<template>
    <div class="fixed left-1/2 z-50 -translate-x-1/2" :style="{
        bottom: 'calc(var(--tg-content-safe-area-inset-bottom, 0px) + 24px)'
    }">
        <nav
            class="flex h-16 items-center gap-2 rounded-full border border-border bg-card/70 p-1 shadow-lg backdrop-blur-xl">
            <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="relative z-10 flex h-full"
                v-slot="{ isActive: linkActive }">
                <div class="relative flex min-w-24 flex-col items-center justify-center gap-1 rounded-3xl px-4 py-1"
                    :class="linkActive ? 'text-primary-foreground' : 'text-muted-foreground'">
                    <Motion v-if="linkActive" class="absolute inset-0 -z-10 rounded-full bg-primary"
                        :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }"
                        :transition="{ type: 'spring', stiffness: 300, damping: 25 }" />

                    <component :is="item.icon" :weight="linkActive ? 'Bold' : 'Linear'" class="size-6" />

                    <span class="text-xs">{{ item.label }}</span>
                </div>
            </RouterLink>
        </nav>
    </div>
</template>