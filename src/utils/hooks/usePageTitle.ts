import { computed } from "vue"
import { useRoute } from "vue-router"

export function usePageTitle() {
    const route = useRoute()

    return computed(() => {
        const matched = [...route.matched].reverse()

        const match = matched.find(
            (r) => r.meta && typeof r.meta.title === "string"
        )

        return (match?.meta?.title as string) ?? "Snipla"
    })
}