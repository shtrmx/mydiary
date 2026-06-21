<script setup lang="ts">
import { RouterView } from "vue-router"
import TelegramUIProvider from "@/utils/providers/telegram-ui.vue"
import ThemeProvider from "@/utils/providers/theme-provider.vue"
</script>

<template>
  <ThemeProvider>
    <TelegramUIProvider>
      <RouterView />
    </TelegramUIProvider>
  </ThemeProvider>
</template>
