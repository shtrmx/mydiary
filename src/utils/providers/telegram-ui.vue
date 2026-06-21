<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, shallowRef } from "vue"
import { useRoute, useRouter } from "vue-router"
import { initTelegramApp } from "@/lib/telegram/init"

const route = useRoute()
const router = useRouter()

const tg = shallowRef<any>(null)

const goBack = () => {
    router.back()
}

const updateBackButton = () => {
    if (!tg.value) return

    const depth = route.matched.length

    if (depth > 1) {
        tg.value.BackButton.show()
    } else {
        tg.value.BackButton.hide()
    }
}

onMounted(() => {
    tg.value = initTelegramApp()
    if (!tg.value) return

    tg.value.BackButton.onClick(goBack)

    tg.value.SettingsButton?.show?.()
    tg.value.SettingsButton?.onClick?.(() => router.push("/settings"))

    updateBackButton()
})

watch(
    () => route.fullPath,
    () => updateBackButton(),
    { immediate: true }
)

onBeforeUnmount(() => {
    if (!tg.value) return

    tg.value.BackButton.hide()
    tg.value.SettingsButton?.hide?.()

    tg.value.BackButton.offClick?.(goBack)
})
</script>

<template>
    <slot />
</template>