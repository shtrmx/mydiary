import { computed, ref } from "vue"
import { defineStore } from "pinia"

export type FontPreset = "inter" | "roboto" | "noto-serif" | "jetbrains-mono"

export const FONTS: Record<FontPreset, string> = {
    inter: "Inter, sans-serif",
    roboto: "Roboto, sans-serif",
    "noto-serif": "'Noto Serif', serif",
    "jetbrains-mono": "'JetBrains Mono', monospace",
}

export const useEditorSettingsStore = defineStore(
    "editor-settings",
    () => {
        const fontFamily = ref<FontPreset>("inter")
        const fontSize = ref(16)
        const lineHeight = ref(1.2)
        const paragraphSpacing = ref(0)
        const letterSpacing = ref(0)
        const contentWidth = ref(90)
        const paragraphBlock = ref(5)

        const fontFamilyName = computed(() => FONTS[fontFamily.value])

        function clampWidth(value: number) {
            contentWidth.value = Math.min(100, Math.max(40, value))
        }

        return {
            fontFamily,
            fontSize,
            lineHeight,
            contentWidth,
            paragraphSpacing,
            letterSpacing,
            fontFamilyName,
            paragraphBlock,
            clampWidth,
        }
    },
    { persist: true }
)