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
    const isScrolled = ref(false)
    let scrollEl: HTMLElement | null = null
    let lastScrollTop = 0
    let ticking = false

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const THRESHOLD_PX = isMobile ? 24 : 8

    function update() {
        if (!scrollEl) return

        const current = Math.max(0, scrollEl.scrollTop)
        const delta = current - lastScrollTop

        isScrolled.value = current > 400

        if (current <= 10) {
            hidden.value = false
        } else if (Math.abs(delta) > THRESHOLD_PX) {
            hidden.value = delta > 0
        }

        lastScrollTop = current
        ticking = false
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update)
            ticking = true
        }
    }

    function scrollToTop() {
        scrollEl?.scrollTo({ top: 0, behavior: "smooth" })
    }

    onMounted(() => {
        scrollEl = findScrollParent(anchorRef.value)
        if (scrollEl) {
            lastScrollTop = Math.max(0, scrollEl.scrollTop)
            scrollEl.addEventListener("scroll", onScroll, { passive: true })
        }
    })

    onUnmounted(() => {
        scrollEl?.removeEventListener("scroll", onScroll)
    })

    return { hidden, isScrolled, scrollToTop }
}