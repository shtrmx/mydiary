<script setup lang="ts">
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { storeToRefs } from "pinia"
import { useEditorSettingsStore } from "@/utils/stores/editor"
import { computed } from "vue"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const settings = useEditorSettingsStore()

const {
    fontSize,
    lineHeight,
    contentWidth,
    fontFamily,
    paragraphSpacing,
    letterSpacing,
    fontFamilyName,
    paragraphBlock
} = storeToRefs(settings)

const fontSizeModel = useSliderRef(fontSize)
const lineHeightModel = useSliderRef(lineHeight)
const contentWidthModel = useSliderRef(contentWidth)
const paragraphSpacingModel = useSliderRef(paragraphSpacing)
const letterSpacingModel = useSliderRef(letterSpacing)
const paragraphBlockModel = useSliderRef(paragraphBlock)

function useSliderRef(source: any) {
    return computed({
        get: () => [source.value],
        set: (val: number[]) => {
            source.value = val[0]
        }
    })
}

type FontPreset =
    | "inter"
    | "roboto"
    | "noto-serif"
    | "jetbrains-mono"

type FontOption = {
    id: FontPreset
    label: string
}

const fonts: FontOption[] = [
    { id: "inter", label: "Inter" },
    { id: "roboto", label: "Roboto" },
    { id: "noto-serif", label: "Noto Serif" },
    { id: "jetbrains-mono", label: "JetBrains Mono" },
]
</script>

<template>
    <Dialog>
        <DialogTrigger as-child class="m-0 p-0">
            <slot></slot>
        </DialogTrigger>

        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Editor settings</DialogTitle>
            </DialogHeader>

            <div class="space-y-6 py-4">

                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <button
                            class="flex w-full items-center justify-between p-2 rounded-md border hover:bg-accent/40">
                            <span class="text-sm">Font</span>
                            <span class="text-sm text-muted-foreground">
                                {{ fontFamilyName }}
                            </span>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent class="w-56">
                        <DropdownMenuItem v-for="f in fonts" :key="f.id"
                            class="flex items-center justify-between cursor-pointer" @click="fontFamily = f.id as any">
                            <span :style="{ fontFamily: f.label }">
                                {{ f.label }}
                            </span>

                            <span v-if="fontFamily === f.id" class="text-xs text-muted-foreground">
                                ✓
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>Font size</span>
                        <span>{{ fontSize }}px</span>
                    </div>

                    <Slider v-model="fontSizeModel" :min="12" :max="28" :step="1" />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>Line height</span>
                        <span>{{ lineHeight }}</span>
                    </div>

                    <Slider v-model="lineHeightModel" :min="1" :max="2.5" :step="0.1" />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>Content width</span>
                        <span>{{ contentWidth }}%</span>
                    </div>

                    <Slider v-model="contentWidthModel" :min="50" :max="100" :step="5" />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>First line indent</span>
                        <span>{{ paragraphSpacing }}px</span>
                    </div>

                    <Slider v-model="paragraphSpacingModel" :min="0" :max="48" :step="2" />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>Letter spacing</span>
                        <span>{{ letterSpacing }}px</span>
                    </div>

                    <Slider v-model="letterSpacingModel" :min="-2" :max="5" :step="0.1" />
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-muted-foreground">
                        <span>Paragraph spacing</span>
                        <span>{{ paragraphBlock }}px</span>
                    </div>

                    <Slider v-model="paragraphBlockModel" :min="0" :max="30" :step="1" />
                </div>


            </div>

            <DialogFooter>
                <Button variant="outline" as-child>
                    <DialogTrigger>Close</DialogTrigger>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>