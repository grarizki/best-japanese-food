<script setup lang="ts">
// Container component ("the page"): receives data + copy via props — never
// fetches or imports data, the pipeline/BFF already shaped it into UiRecord.
// Owns only view state (city, sort, pagination) through the Effect store and
// derives what to render with computed pipelines (filter → sort → slice).
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { UiRecord } from '@bff/schema'
import { CITIES, FOOTER_ATTRIBUTION, type AppCopy } from './copy'
import { createEffectStore } from './store'
import FoodCard from './FoodCard.vue'

const props = defineProps<{ data: UiRecord[]; copy: AppCopy }>()

type SortKey = 'rating' | 'reviews' | 'saves'
interface FoodState {
  city: string
  sort: SortKey
  visible: number
}

const store = createEffectStore<FoodState>({ city: 'all', sort: 'rating', visible: 10 })
const state = reactive(store.getState())
const unsubscribe = store.subscribe((s) => Object.assign(state, s))
onUnmounted(unsubscribe)

const list = computed(() => {
  const filtered =
    state.city === 'all' ? props.data : props.data.filter((b) => b.prefecture === state.city)
  const key = {
    rating: (b: UiRecord) => b.rating,
    reviews: (b: UiRecord) => b.reviews,
    saves: (b: UiRecord) => b.saves,
  }[state.sort]
  return [...filtered].sort((a, b) => key(b) - key(a))
})
const shown = computed(() => list.value.slice(0, state.visible))
const total = computed(() => list.value.length)

const sentinel = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!sentinel.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) store.mutate((s) => ({ ...s, visible: s.visible + 10 }))
    },
    { rootMargin: '200px' },
  )
  observer.observe(sentinel.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="page">
    <header class="hero">
      <p class="eyebrow">{{ copy.eyebrow }}</p>
      <h1><span v-html="copy.hero" /></h1>
      <p class="lede">{{ copy.subhead }}</p>
      <ul class="trust">
        <li v-for="v in copy.valueProps" :key="v">{{ v }}</li>
      </ul>
    </header>

    <nav class="filters">
      <div class="cities">
        <button
          v-for="c in CITIES"
          :key="c.key"
          class="pill"
          :class="{ active: state.city === c.key }"
          @click="store.mutate((s) => ({ ...s, city: c.key, visible: 10 }))"
        >
          {{ c.label }} <span class="ja">{{ c.ja }}</span>
        </button>
      </div>
      <label class="visually-hidden" for="sort">Sort</label>
      <select
        id="sort"
        class="sort"
        :value="state.sort"
        @change="
          store.mutate((s) => ({
            ...s,
            sort: ($event.target as HTMLSelectElement).value as SortKey,
            visible: 10,
          }))
        "
      >
        <option value="rating">Sort: Rating</option>
        <option value="reviews">Sort: Reviews</option>
        <option value="saves">Sort: Saves</option>
      </select>
    </nav>

    <main class="grid">
      <FoodCard v-for="b in shown" :key="b.id" :b="b" />
    </main>

    <div ref="sentinel" class="sentinel" />
    <footer class="count">
      {{ state.visible < total ? `showing ${shown.length} of ${total}` : `all ${total} shown` }}
    </footer>
    <footer class="foot">
      <p>{{ copy.cta }}</p>
      <p>{{ FOOTER_ATTRIBUTION }}</p>
    </footer>
  </div>
</template>
