<script setup lang="ts">
import 'vue-sonner/style.css'
import { RouterView } from "vue-router"
import TelegramUIProvider from "@/utils/providers/telegram-ui.vue"
import ThemeProvider from "@/utils/providers/theme-provider.vue"
import { Toaster } from "@/components/ui/sonner"
import UpdatePopup from '@/components/blocks/updatePopup.vue'
import ChangelogDialog from '@/components/blocks/cahngelogDialog.vue'
</script>

<template>
  <ThemeProvider>
    <TelegramUIProvider>
      <RouterView />
      <Toaster />
    </TelegramUIProvider>
  </ThemeProvider>
  <UpdatePopup />
  <ChangelogDialog />
</template>