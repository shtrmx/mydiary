import { liveQuery } from "dexie"
import { onScopeDispose, ref, watch, type Ref, type WatchSource } from "vue"

export function useLiveQuery<T>(
    querier: () => Promise<T>,
    initial: T,
    deps: WatchSource[] = []
): Ref<T> {
    const result = ref(initial) as Ref<T>
    let subscription: { unsubscribe: () => void } | null = null

    const subscribe = () => {
        subscription?.unsubscribe()

        subscription = liveQuery(querier).subscribe({
            next: (value) => {
                result.value = value
            },
            error: (error) => {
                console.error("useLiveQuery error:", error)
            },
        })
    }

    subscribe()

    if (deps.length > 0) {
        watch(deps, subscribe)
    }

    onScopeDispose(() => {
        subscription?.unsubscribe()
    })

    return result
}