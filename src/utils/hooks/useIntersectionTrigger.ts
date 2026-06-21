import { onMounted, onUnmounted, type Ref } from "vue"

export function useIntersectionTrigger(targetRef: Ref<HTMLElement | null>, onIntersect: () => void) {
    let observer: IntersectionObserver | null = null

    onMounted(() => {
        observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) onIntersect()
            },
            { rootMargin: "200px" }
        )

        if (targetRef.value) observer.observe(targetRef.value)
    })

    onUnmounted(() => {
        observer?.disconnect()
    })
}