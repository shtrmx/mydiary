import { onMounted, onUnmounted, ref } from "vue"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    const isMobile = ref(false)

    let mql: MediaQueryList | null = null

    const update = () => {
        isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }

    onMounted(() => {
        mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

        update()

        const handler = () => {
            update()
        }

        mql.addEventListener("change", handler)

        // fallback на resize (старые браузеры / странные кейсы)
        window.addEventListener("resize", update)

        onUnmounted(() => {
            mql?.removeEventListener("change", handler)
            window.removeEventListener("resize", update)
        })
    })

    return isMobile
}