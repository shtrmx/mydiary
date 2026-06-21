import { onMounted, onUnmounted, ref, type Ref } from "vue"

export function useElementSize(elRef: Ref<any>) {
    const height = ref(0)
    let observer: ResizeObserver | null = null

    const getElement = () => {
        if (!elRef.value) return null
        return elRef.value.$el || elRef.value
    }

    const update = () => {
        const el = getElement()
        if (el && typeof el.getBoundingClientRect === "function") {
            height.value = el.getBoundingClientRect().height
        }
    }

    onMounted(() => {
        const el = getElement()
        if (!el) return

        update()

        observer = new ResizeObserver(() => {
            update()
        })

        observer.observe(el)
    })

    onUnmounted(() => {
        observer?.disconnect()
    })

    return { height }
}