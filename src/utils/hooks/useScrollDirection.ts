import { onMounted, onUnmounted, ref, type Ref } from "vue"

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
    let node = el?.parentElement ?? null

    while (node) {
        const overflowY = getComputedStyle(node).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return node
        node = node.parentElement
    }

    return null
}

export function useScrollDirection(anchorRef: Ref<HTMLElement | null>) {
    const hidden = ref(false)
    let scrollEl: HTMLElement | null = null
    let lastScrollTop = 0

    const THRESHOLD_PX = 8

    function onScroll() {
        if (!scrollEl) return

        const current = scrollEl.scrollTop
        const delta = current - lastScrollTop

        if (current <= 0) {
            hidden.value = false
        } else if (Math.abs(delta) > THRESHOLD_PX) {
            hidden.value = delta > 0
        }

        lastScrollTop = current
    }

    onMounted(() => {
        scrollEl = findScrollParent(anchorRef.value)
        scrollEl?.addEventListener("scroll", onScroll, { passive: true })
    })

    onUnmounted(() => {
        scrollEl?.removeEventListener("scroll", onScroll)
    })

    return hidden
}