import { onMounted, onUnmounted, ref, type Ref } from "vue"

export function useElementWidth(elRef: Ref<HTMLElement | null>) {
    const width = ref(0)
    let observer: ResizeObserver | null = null

    const update = () => {
        if (elRef.value) width.value = elRef.value.getBoundingClientRect().width
    }

    onMounted(() => {
        if (!elRef.value) return

        update()
        observer = new ResizeObserver(update)
        observer.observe(elRef.value)
    })

    onUnmounted(() => {
        observer?.disconnect()
    })

    return width
}