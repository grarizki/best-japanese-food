import { describe, expect, it } from 'vitest'
import { createEffectStore } from './store'

describe('createEffectStore', () => {
  it('returns the initial state', () => {
    const store = createEffectStore({ n: 1 })
    expect(store.getState()).toEqual({ n: 1 })
  })

  it('applies mutations through Effect', () => {
    const store = createEffectStore({ n: 1 })
    store.mutate((s) => ({ n: s.n + 1 }))
    store.mutate((s) => ({ n: s.n + 1 }))
    expect(store.getState()).toEqual({ n: 3 })
  })

  it('notifies subscribers of state changes and stops after unsubscribe', async () => {
    const store = createEffectStore({ n: 0 })
    const seen: number[] = []
    const unsubscribe = store.subscribe((s) => seen.push(s.n))
    store.mutate((s) => ({ n: s.n + 1 }))
    store.mutate((s) => ({ n: s.n + 2 }))
    await new Promise((r) => setTimeout(r, 10))
    unsubscribe()
    store.mutate(() => ({ n: 99 }))
    await new Promise((r) => setTimeout(r, 10))
    expect(seen).toContain(3)
    expect(seen).not.toContain(99)
  })
})
