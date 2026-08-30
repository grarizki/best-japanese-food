<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AppCopy } from '@bff/ui'
import type { HalalRecord } from './data'

const props = defineProps<{ data: { tokyo: HalalRecord[]; osaka: HalalRecord[] }; copy: AppCopy }>()

const filter = ref<'all' | 'tokyo' | 'osaka'>('all')
const certFilter = ref<'all' | 'halal_certified' | 'muslim_friendly' | 'halal_menu' | 'halal_ingredients'>('all')
const search = ref('')

const records = computed(() => {
  let list = [
    ...props.data.tokyo.map((r) => ({ ...r, _pref: 'tokyo' as const })),
    ...props.data.osaka.map((r) => ({ ...r, _pref: 'osaka' as const })),
  ]
  if (filter.value !== 'all') list = list.filter((r) => r._pref === filter.value)
  if (certFilter.value !== 'all') list = list.filter((r) => r.certification === certFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.nameJa.includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q),
    )
  }
  return list
})

const certLabel: Record<string, string> = {
  halal_certified: 'Halal Certified',
  muslim_friendly: 'Muslim Friendly',
  halal_menu: 'Halal Menu',
  halal_ingredients: 'Halal Ingredients',
}

const certColor: Record<string, string> = {
  halal_certified: '#16a34a',
  muslim_friendly: '#2563eb',
  halal_menu: '#9333ea',
  halal_ingredients: '#ea580c',
}

const featureLabel: Record<string, string> = {
  halal_meat: 'Halal Meat',
  pork_free: 'Pork-Free',
  halal_seasoning: 'Halal Seasoning',
  halal_meal: 'Halal Meal',
  no_alcohol: 'No Alcohol',
  muslim_owned: 'Muslim Owned',
  prayer_space: 'Prayer Space',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
}
</script>

<template>
  <div class="halal-app">
    <header class="hero">
      <p class="eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.hero }}</h1>
      <p class="subhead">{{ copy.subhead }}</p>
    </header>

    <div class="controls">
      <div class="filter-group">
        <button :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
        <button :class="{ active: filter === 'tokyo' }" @click="filter = 'tokyo'">
          Tokyo ({{ data.tokyo.length }})
        </button>
        <button :class="{ active: filter === 'osaka' }" @click="filter = 'osaka'">
          Osaka ({{ data.osaka.length }})
        </button>
      </div>
      <div class="filter-group">
        <button :class="{ active: certFilter === 'all' }" @click="certFilter = 'all'">All Certs</button>
        <button
          :class="{ active: certFilter === 'halal_certified' }"
          @click="certFilter = 'halal_certified'"
        >
          Halal Certified
        </button>
        <button
          :class="{ active: certFilter === 'muslim_friendly' }"
          @click="certFilter = 'muslim_friendly'"
        >
          Muslim Friendly
        </button>
      </div>
      <input v-model="search" type="search" placeholder="Search name, cuisine, area..." class="search" />
    </div>

    <p class="count">{{ records.length }} restaurants</p>

    <div class="grid">
      <a
        v-for="r in records"
        :key="r.id"
        :href="r.url"
        target="_blank"
        rel="noopener"
        class="card"
      >
        <div class="card-header">
          <span class="card-name">{{ r.name }}</span>
          <span class="card-pref">{{ r._pref }}</span>
        </div>
        <div class="card-ja">{{ r.nameJa }}</div>
        <div class="card-meta">
          <span class="card-cuisine">{{ r.cuisine }}</span>
          <span class="card-area">{{ r.area }}</span>
        </div>
        <div class="card-cert" :style="{ background: certColor[r.certification] || '#6b7280' }">
          {{ certLabel[r.certification] || r.certification }}
        </div>
        <div class="card-features">
          <span v-for="f in r.features" :key="f" class="feature-tag">
            {{ featureLabel[f] || f }}
          </span>
        </div>
        <p class="card-desc">{{ r.description }}</p>
        <div class="card-source">via {{ r.source }}</div>
      </a>
    </div>

    <footer class="app-footer">
      <p>
        Data from
        <a href="https://halalgourmet.jp" target="blank">Halal Gourmet Japan</a>,
        <a href="https://www.halalinjapan.com" target="blank">Halal In Japan</a>,
        <a href="https://www.tripadvisor.com" target="blank">TripAdvisor</a>, and others.
      </p>
      <p>Full directory: <a href="https://halalgourmet.jp/restaurants/prefectures/tokyo" target="blank">Tokyo</a> · <a href="https://halalgourmet.jp/restaurants/prefectures/osaka" target="blank">Osaka</a></p>
    </footer>
  </div>
</template>

<style scoped>
.halal-app {
  max-width: 960px;
  margin: 0 auto;
  padding: 60px 24px 80px;
}
.hero { margin-bottom: 40px; }
.eyebrow { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #16a34a; margin-bottom: 8px; }
.hero h1 { font-size: clamp(28px, 5vw, 42px); font-weight: 700; line-height: 1.1; }
.subhead { margin-top: 12px; font-size: 15px; color: #6b7280; line-height: 1.6; }

.controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.filter-group { display: flex; gap: 4px; flex-wrap: wrap; }
.filter-group button {
  padding: 6px 14px; border-radius: 20px; border: 1px solid #e5e7eb;
  background: #fff; cursor: pointer; font-size: 13px; color: #374151;
  transition: all 0.15s;
}
.filter-group button:hover { border-color: #16a34a; }
.filter-group button.active { background: #16a34a; color: #fff; border-color: #16a34a; }
.search {
  padding: 6px 14px; border-radius: 20px; border: 1px solid #e5e7eb;
  font-size: 13px; flex: 1; min-width: 200px; outline: none;
}
.search:focus { border-color: #16a34a; }

.count { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card {
  display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 20px; text-decoration: none; color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.card:hover { border-color: #16a34a; box-shadow: 0 2px 12px rgba(22,163,74,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
.card-name { font-size: 16px; font-weight: 600; line-height: 1.3; }
.card-pref { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.1em; white-space: nowrap; }
.card-ja { font-size: 13px; color: #6b7280; margin-top: 2px; }
.card-meta { display: flex; gap: 8px; margin-top: 8px; font-size: 13px; color: #6b7280; }
.card-cuisine { font-weight: 500; }
.card-cert {
  display: inline-block; margin-top: 10px; padding: 3px 10px; border-radius: 12px;
  font-size: 11px; font-weight: 600; color: #fff; letter-spacing: 0.02em;
}
.card-features { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.feature-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 8px;
  background: #f3f4f6; color: #4b5563;
}
.card-desc { font-size: 13px; color: #6b7280; margin-top: 8px; line-height: 1.5; }
.card-source { font-size: 11px; color: #d1d5db; margin-top: 8px; }

.app-footer {
  margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb;
  font-size: 13px; color: #9ca3af; line-height: 1.8;
}
.app-footer a { color: #6b7280; }
.app-footer a:hover { color: #16a34a; }
</style>
