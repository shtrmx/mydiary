<script setup lang="ts">
import { onMounted } from "vue"
import { useThemeStore } from "@/utils/stores/theme"

const themeStore = useThemeStore()

onMounted(() => {
    themeStore.init()
})
</script>

<template>
    <slot />
</template>