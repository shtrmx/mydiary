<script setup lang="ts">
import { onMounted } from "vue"
import { useThemeStore } from "@/utils/stores/theme"

const theme = useThemeStore()

onMounted(() => {
    theme.init()
})
</script>

<template>
    <slot />
</template>