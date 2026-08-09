<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { FOOTER_ATTRIBUTION, type AppCopy } from './copy'
import { createEffectStore } from './store'
import type { TopSection } from './types'
import FoodCard from './FoodCard.vue'

const props = defineProps<{ sections: TopSection[]; copy: AppCopy }>()

interface TopState {
  section: number
  visible: number
}

const store = createEffectStore<TopState>({ section: 0, visible: 10 })
const state = reactive(store.getState())
const unsubscribe = store.subscribe((s) => Object.assign(state, s))
onUnmounted(unsubscribe)

const active = computed(() => props.sections[state.section] ?? props.sections[0])
const shown = computed(() => active.value.records.slice(0, state.visible))
const total = computed(() => active.value.records.length)

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
      <select
        class="sort"
        :value="state.section"
        @change="
          store.mutate((s) => ({
            ...s,
            section: Number(($event.target as HTMLSelectElement).value),
            visible: 10,
          }))
        "
      >
        <option v-for="(s, i) in sections" :key="s.name" :value="i">
          {{ s.name }} · {{ s.records.length }}
        </option>
      </select>
    </nav>

    <main class="grid">
      <FoodCard v-for="b in shown" :key="b.id" :b="b" />
    </main>

    <div ref="sentinel" class="sentinel" />
    <footer class="count">
      {{ state.visible < total ? `showing ${shown.length} of ${total}` : `all ${total} ranked` }}
    </footer>
    <footer class="foot">
      <p>{{ copy.cta }}</p>
      <p>{{ FOOTER_ATTRIBUTION }}</p>
    </footer>
  </div>
</template>
