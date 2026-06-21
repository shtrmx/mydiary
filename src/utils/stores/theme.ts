import { defineStore } from "pinia"

export type ThemeMode = "light" | "dark"

interface ThemeState {
    mode: ThemeMode
}

export const useThemeStore = defineStore("theme", {
    state: (): ThemeState => ({
        mode: "dark",
    }),

    actions: {
        init() {
            const saved = localStorage.getItem("theme") as ThemeMode | null
            if (saved) {
                this.mode = saved
            } else {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
                this.mode = prefersDark ? "dark" : "light"
            }

            this.apply()
        },

        toggle() {
            this.mode = this.mode === "dark" ? "light" : "dark"
            this.apply()
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

            localStorage.setItem("theme", this.mode)
        },
    },
    persist: {
        key: "theme",
        storage: localStorage,
    },
})