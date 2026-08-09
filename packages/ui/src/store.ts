// Effect-owned client state: a SubscriptionRef (observable ref from effect
// core) is the single source of truth; the Vue component mirrors it via a
// subscription to its changes stream. Mutations flow through Effect.
import { Effect, Fiber, Stream, SubscriptionRef } from 'effect'

export interface EffectStore<T> {
  getState(): T
  mutate(fn: (state: T) => T): void
  subscribe(listener: (state: T) => void): () => void
}

export function createEffectStore<T>(initial: T): EffectStore<T> {
  const ref = Effect.runSync(SubscriptionRef.make(initial))
  return {
    getState: () => Effect.runSync(SubscriptionRef.get(ref)),
    mutate: (fn) => {
      Effect.runSync(SubscriptionRef.update(ref, fn))
    },
    subscribe: (listener) => {
      const fiber = Effect.runFork(
        Stream.runForEach(ref.changes, (state) => Effect.sync(() => listener(state))),
      )
      return () => {
        Effect.runFork(Fiber.interrupt(fiber))
      }
    },
  }
}
