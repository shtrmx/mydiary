import { defineStore } from "pinia"

export type ThemeMode = "light" | "dark"

export const useThemeStore = defineStore("theme", {
    state: () => ({
        mode: "dark" as ThemeMode,
    }),

    actions: {
        init() {
            this.apply()
        },
        toggle() {
            this.set(this.mode === "dark" ? "light" : "dark")
        },

        set(mode: ThemeMode) {
            this.mode = mode
            this.apply()
        },

        apply() {
            const root = document.documentElement

            if (this.mode === "dark") {
                root.classList.add("dark")
            } else {
                root.classList.remove("dark")
            }
        }
    },

    persist: true,
})