<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const isOpen = ref(false)
const isLoading = ref(false)
const tagName = ref('')
const changelogHtml = ref('')

const GITHUB_REPO = "shtrmx/mydiary"

async function fetchLatestRelease() {
    if (changelogHtml.value && tagName.value) return true

    isLoading.value = true
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
            headers: { 'Accept': 'application/vnd.github.html+json' }
        })
        if (!response.ok) return false

        const data = await response.json()
        tagName.value = data.tag_name
        changelogHtml.value = data.body_html
        return true
    } catch (error) {
        console.error("Error while loading changelog:", error)
        return false
    } finally {
        isLoading.value = false
    }
}

async function checkUpdatesAutomatically() {
    const success = await fetchLatestRelease()
    if (!success) return

    const lastSeenVersion = localStorage.getItem('last_seen_version')
    if (tagName.value !== lastSeenVersion) {
        isOpen.value = true
    }
}

async function forceOpen() {
    isOpen.value = true
    await fetchLatestRelease()
}

function handleClose() {
    localStorage.setItem('last_seen_version', tagName.value)
    isOpen.value = false
}

onMounted(() => {
    checkUpdatesAutomatically()
    window.addEventListener('trigger-open-changelog', forceOpen)
})

onUnmounted(() => {
    window.removeEventListener('trigger-open-changelog', forceOpen)
})
</script>

<template>
    <AlertDialog :open="isOpen">
        <AlertDialogContent
            class="max-w-[calc(100vw-2rem)] sm:max-w-xl rounded-2xl max-h-[80vh] flex flex-col p-6 z-60">

            <AlertDialogHeader class="text-left">
                <AlertDialogTitle class="text-xl">
                    {{ isLoading ? 'Loading changes...' : `What's new in ${tagName}` }}
                </AlertDialogTitle>
            </AlertDialogHeader>

            <div class="flex-1 overflow-y-auto my-4 pr-1 scrollbar-hide min-h-25 flex items-center justify-center"
                v-if="isLoading">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>

            <div v-else class="flex-1 overflow-y-auto my-2 pr-1 scrollbar-hide">
                <div v-html="changelogHtml" class="prose-entry changelog-content text-sm text-foreground/90 space-y-2">
                </div>
            </div>

            <AlertDialogFooter class="mt-2">
                <AlertDialogAction class="rounded-xl w-full" @click="handleClose" :disabled="isLoading">
                    Ok
                </AlertDialogAction>
            </AlertDialogFooter>

        </AlertDialogContent>
    </AlertDialog>
</template>

<style>
.changelog-content ul {
    list-style-type: disc !important;
    padding-left: 1.25rem !important;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.changelog-content li {
    margin-bottom: 0.25rem;
}

.changelog-content a {
    color: var(--primary);
    text-decoration: underline;
}

.changelog-content h1,
.changelog-content h2,
.changelog-content h3 {
    font-size: 1.1rem !important;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}
</style>