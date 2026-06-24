<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { Button } from '@/components/ui/button'
import { Refresh, CloseCircle, DocumentText } from '@solar-icons/vue'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const { needRefresh, updateServiceWorker } = useRegisterSW()

function close() {
    needRefresh.value = false
}

function openChangelog() {
    window.dispatchEvent(new Event('trigger-open-changelog'))
}
</script>

<template>
    <AlertDialog :open="needRefresh">
        <AlertDialogContent class="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-6">

            <AlertDialogHeader class="text-left">
                <AlertDialogTitle class="text-lg">Update available!</AlertDialogTitle>
                <AlertDialogDescription class="text-sm text-muted-foreground">
                    A new version of the app has been installed. Update to take advantage of the fixes and new features.
                </AlertDialogDescription>
            </AlertDialogHeader>

            <div class="flex flex-col gap-2 mt-2">
                <Button type="button" variant="outline"
                    class="rounded-xl w-full gap-2 justify-center h-11 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
                    @click="openChangelog">
                    <DocumentText weight="Bold" class="size-5 text-primary" />
                    <span class="text-sm font-medium">What's new?</span>
                </Button>

                <div class="flex w-full gap-2 mt-2">
                    <Button type="button" variant="ghost" class="flex-1 rounded-xl gap-1 h-11" @click="close">
                        <CloseCircle class="size-4" />
                        Later
                    </Button>
                    <Button type="button"
                        class="flex-1 rounded-xl gap-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                        @click="updateServiceWorker()">
                        <Refresh class="size-4" />
                        Update
                    </Button>
                </div>
            </div>

        </AlertDialogContent>
    </AlertDialog>
</template>