<script lang="ts" setup>
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from '@lucide/vue'

import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const toastOptions = {
  classes: {
    toast: 'rounded-md',
  },
}

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner :class="cn('toaster group', props.class)" :style="{
    '--normal-bg': 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
    '--border-radius': 'var(--radius)',
    '--gray2': 'hsl(var(--popover) / 0.9)',
    '--gray3': 'var(--border)',
    '--gray4': 'var(--border)',
    '--gray5': 'var(--border)',
    '--gray12': 'var(--popover-foreground)',
  }" v-bind="{
    ...props,
    toastOptions: undefined,
  }" :toast-options="toastOptions" position="top-center">
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

<style>
[data-sonner-toaster][data-position="top-center"] {
  top: calc(var(--app-header-height, 20px) + var(--tg-safe-area-inset-top, 0px) + env(safe-area-inset-top, 0px) + 16px) !important;

  left: 50% !important;
  transform: translateX(-50%) !important;
  width: max-content !important;
  max-width: calc(100% - 2rem) !important;
}

:root {
  --sonner-top-offset: calc(var(--tg-safe-area-inset-top, 0px) + var(--app-header-height, 20px));
}
</style>