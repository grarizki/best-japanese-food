<script setup lang="ts">
// Pure presentational component ("the view"): knows only UiRecord (the shared
// BFF contract) and its own flip-animation state. All denormalization and
// joining happened upstream in toUiRecord(); this only formats for display.
import { ref } from 'vue'
import type { UiRecord } from '@bff/schema'

defineProps<{ b: UiRecord }>()

const flipped = ref(false)
</script>

<template>
  <article class="card" :class="{ flipped }" @click="flipped = !flipped">
    <div class="card-inner">
      <div class="face front">
        <div class="card-top">
          <span class="city-chip">{{ b.prefectureJa }}</span>
          <span class="rating">{{ b.rating.toFixed(2) }}</span>
        </div>
        <div v-if="b.rank" class="rank">#{{ b.rank }}</div>
        <h2 class="name-ja">{{ b.nameJa }}</h2>
        <p class="name-ro">{{ b.nameRo }}</p>
        <p class="genre">{{ b.genreEn }}</p>
        <div class="stats">
          <div>
            <strong>{{ b.reviews.toLocaleString() }}</strong>
            <span>reviews</span>
          </div>
          <div>
            <strong>{{ b.saves.toLocaleString() }}</strong>
            <span>saves</span>
          </div>
        </div>
        <div class="budgets">
          <span>Dinner {{ b.budgetDinner ?? '—' }}</span>
          <span>Lunch {{ b.budgetLunch ?? '—' }}</span>
        </div>
        <p class="station">
          {{ b.stationJa }}
          <template v-if="b.distanceM"> · {{ b.distanceM }} m walk</template>
        </p>
        <div class="lines">
          <span v-for="l in b.linesJa.slice(0, 4)" :key="l" class="line-chip">{{ l }}</span>
        </div>
        <p class="hint">tap to flip</p>
      </div>

      <div class="face back">
        <h2 class="name-ja">{{ b.nameJa }}</h2>
        <p class="name-ro">{{ b.nameRo }}</p>
        <dl class="detail">
          <div>
            <dt>City</dt>
            <dd>{{ b.prefectureJa }}</dd>
          </div>
          <div>
            <dt>Genres</dt>
            <dd>{{ b.genresJa.join(' · ') || b.genreJa }}</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>
              {{ b.rating.toFixed(2) }} from {{ b.reviews.toLocaleString() }} reviews
            </dd>
          </div>
          <div>
            <dt>Saved by</dt>
            <dd>{{ b.saves.toLocaleString() }} users</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>dinner {{ b.budgetDinner ?? '—' }} · lunch {{ b.budgetLunch ?? '—' }}</dd>
          </div>
          <div v-if="b.stationJa">
            <dt>Station</dt>
            <dd>
              {{ b.stationJa }}<template v-if="b.distanceM"> ({{ b.distanceM }} m)</template>
            </dd>
          </div>
          <div v-if="b.operators.length">
            <dt>Lines</dt>
            <dd>
              {{ b.linesJa.join(' · ') }}
              <br />
              <span class="operators">{{ b.operators.join(' · ') }}</span>
            </dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd><a :href="b.url" target="_blank" rel="noopener">Tabelog ↗</a></dd>
          </div>
        </dl>
      </div>
    </div>
  </article>
</template>
