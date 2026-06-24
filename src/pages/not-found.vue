<script setup lang="ts">
import { ShieldWarning } from "@solar-icons/vue"
import { RouterLink } from "vue-router"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
</script>

<template>
    <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <ShieldWarning weight="Outline" color="primary" />
            </EmptyMedia>

            <EmptyTitle>Not Found</EmptyTitle>

            <EmptyDescription>
                The page you`re looking for doesn`t exist. Try searching for what you need below.
            </EmptyDescription>
        </EmptyHeader>

        <EmptyContent class="flex-col justify-center gap-2">
            <RouterLink to="/home">
                <Button>
                    Go home
                </Button>
            </RouterLink>
        </EmptyContent>
    </Empty>
</template>