<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { chapters, position, route } from "./chapters.mjs";
import { initialState, following, act } from './interaction.mjs';
const steps = ref([]);
const locationState = ref(position(location.hash)),
  revealed = ref(false),
  choice = ref(-1),
  heading = ref(null);
const last = ref(null),
  storageUnavailable = ref(false);
const chapter = computed(() => chapters[locationState.value.chapter]);
const current = computed(() => chapter.value.pages[locationState.value.page]);
const interacted = computed(() => revealed.value || choice.value >= 0);
const cards = computed(() =>
  choice.value >= 0
    ? current.value.choices[choice.value].cards
    : revealed.value
      ? current.value.after
      : current.value.before,
);
const feedback = computed(() =>
  choice.value >= 0
    ? current.value.choices[choice.value].feedback
    : current.value.explanation,
);
const snapshot = () => ({ ...initialState(locationState.value.chapter, locationState.value.page), revealed: revealed.value, choice: choice.value });
const upcoming = computed(() => following(snapshot()));
const upcomingScene = computed(() => upcoming.value && chapters[upcoming.value.chapter].pages[upcoming.value.page]);
function remember() {
  if (!locationState.value.map) {
    last.value = route(locationState.value.chapter, locationState.value.page);
    try {
      localStorage.setItem("agent-reading-position-v2", last.value);
    } catch {
      storageUnavailable.value = true;
    }
  }
}
async function sync() {
  steps.value = [];
  locationState.value = position(location.hash);
  revealed.value = false;
  choice.value = -1;
  remember();
  await nextTick();
  heading.value?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
async function restore(state) {
  const changedScene = state.chapter !== locationState.value.chapter || state.page !== locationState.value.page;
  locationState.value = { chapter: state.chapter, page: state.page, map: false };
  revealed.value = state.revealed;
  choice.value = state.choice;
  history.replaceState(null, '', route(state.chapter, state.page));
  remember();
  await nextTick();
  if (changedScene) {
    heading.value?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
function perform(selected = -1, advance = false) {
  const before = snapshot();
  const after = act(before, selected, advance);
  if (JSON.stringify(before) === JSON.stringify(after)) return;
  steps.value.push(before);
  restore(after);
}
function undo() {
  if (steps.value.length) restore(steps.value.pop());
}
onMounted(() => {
  try {
    const saved = localStorage.getItem("agent-reading-position-v2");
    if (saved && !position(saved).map) last.value = saved;
  } catch {
    storageUnavailable.value = true;
  }
  remember();
  window.addEventListener("hashchange", sync);
});
onUnmounted(() => {
  window.removeEventListener("hashchange", sync);
});
</script>
<template>
  <div class="book-shell">
    <header class="book-header">
      <a href="#/map" class="brand"
        ><span class="brand-mark">a<span>•</span></span
        ><span>AGENT SYSTEM DESIGN<small>一步一步，看懂系統</small></span></a
      ><a
        href="#/map"
        class="map-link"
        :aria-current="locationState.map ? 'page' : undefined"
        >章節地圖 <span aria-hidden="true">↗</span></a
      >
    </header>
    <main>
      <template v-if="locationState.map">
        <section class="welcome">
          <p class="eyebrow">互動式學習地圖</p>
          <h1 ref="heading" tabindex="-1">
            從一個任務開始，<br />看懂 Agent 怎麼工作。
          </h1>
          <p class="lead">
            不用先認識術語。跟著案件助手查一次資料，再逐步理解它如何選擇、行動與處理失敗。
          </p>
          <div class="welcome-actions">
            <a class="primary" :href="route(0)">從第一章開始 <span>→</span></a
            ><a v-if="last" class="text-link" :href="last">繼續上次的位置 →</a>
          </div>
          <p class="quiet">
            用動作推進情境 · 可回到上一步比較結果 · 所有章節自由探索
          </p>
        </section>
        <section class="chapter-map" aria-label="章節地圖">
          <div class="map-line" aria-hidden="true"></div>
          <a
            v-for="(item, index) in chapters"
            :key="item.id"
            :href="route(index)"
            class="chapter-card"
            :class="'chapter-' + index"
            ><span class="chapter-number">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <div>
              <p class="chapter-name">{{ item.title }}</p>
              <h2>{{ item.question }}</h2>
              <p>{{ item.description }}</p>
            </div>
            <span class="chapter-arrow" aria-hidden="true">→</span></a
          >
        </section>
        <p class="map-caption">
          學習順序：先理解執行與資訊，再補可靠性、觀測與驗證，最後討論效率與分工。
        </p>
      </template>
      <template v-else>
        <div class="chapter-meta">
          <span
            >第 {{ locationState.chapter + 1 }} 章 / {{ chapter.title }}</span
          ><span
            >情境 {{ locationState.page + 1 }} / {{ chapter.pages.length }}</span
          >
        </div>
        <article class="lesson" :key="chapter.id + '-' + locationState.page">
          <header class="lesson-title">
            <p class="eyebrow">
              {{
                locationState.page === 0
                  ? "從一個問題開始"
                  : "接著看看會發生什麼"
              }}
            </p>
            <h1 ref="heading" tabindex="-1">{{ current.title }}</h1>
            <p class="lead">{{ current.intro }}</p>
          </header>
          <section
            class="story-stage"
            :class="{ changed: interacted }"
            aria-label="情境圖解"
          >
            <div
              v-for="(label, i) in current.labels"
              :key="i"
              class="story-role"
            >
              <div class="role-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <template v-if="label === '你' || label === '使用者'">
                    <circle cx="32" cy="19" r="9" />
                    <path d="M15 52v-7a17 17 0 0 1 34 0v7M22 52V42M42 52V42" />
                  </template>
                  <template v-else-if="label.includes('助手') || label.includes('模型')">
                    <rect x="12" y="17" width="40" height="33" rx="10" />
                    <path d="M32 17V8M26 8h12M24 39h16" />
                    <circle cx="24" cy="29" r="2" />
                    <circle cx="40" cy="29" r="2" />
                  </template>
                  <template v-else>
                    <rect x="13" y="10" width="38" height="44" rx="4" />
                    <path d="M22 22h20M22 32h20M22 42h12" />
                  </template>
                </svg>
              </div>
              <h2>{{ label }}</h2>
              <Transition name="card" mode="out-in"
                ><p class="data-card" :key="cards[i]">
                  {{ cards[i] }}
                </p></Transition
              ><span v-if="i < 2 && current.flow" class="flow-arrow" aria-hidden="true">{{current.returning?'←':'→'}}</span>
            </div>
          </section>
          <section class="interaction" aria-label="操作與說明">
            <template v-if="current.choices"
              ><p class="interaction-hint">
                {{ current.action }}，看看不同做法的結果。可隨時換選項比較。
              </p>
              <div class="choices">
                <button
                  v-for="(option, i) in current.choices"
                  :key="option.label"
                  :aria-pressed="choice === i"
                  @click="perform(i)"
                >
                  {{ option.label }} <span>→</span>
                </button>
              </div></template
            ><button
              v-else-if="!interacted"
              class="primary"
              @click="perform()"
            >
              {{ current.action }} <span>→</span></button
            >
            <div v-if="interacted" class="explanation" role="status">
              <span class="explanation-label">剛才發生了什麼？</span>
              <p>{{ feedback }}</p>
              <p v-if="current.term" class="term">{{ current.term }}</p>
            </div>
            <p v-else class="quiet">
              {{
                current.choices
                  ? "沒有計分或解鎖限制，重點是理解後果。"
                  : "按上方按鈕，看圖中的資訊如何改變。"
              }}
            </p>
            <div v-if="interacted && upcomingScene" class="upcoming-action">
              <p class="eyebrow">{{ upcoming.chapter !== locationState.chapter ? chapters[upcoming.chapter].title : '接著要處理的事' }}</p>
              <p>{{ upcomingScene.intro }}</p>
              <div v-if="upcomingScene.choices" class="choices">
                <button v-for="(option, i) in upcomingScene.choices" :key="option.label" @click="perform(i, true)">
                  {{ option.label }} <span>→</span>
                </button>
              </div>
              <button v-else class="primary" @click="perform(-1, true)">{{ upcomingScene.action }} <span>→</span></button>
            </div>
            <a v-else-if="interacted" href="#/map" class="primary">完成探索，回到章節地圖 →</a>
          </section>
        </article>
        <nav class="lesson-nav" aria-label="互動控制">
          <button
            :disabled="steps.length === 0"
            @click="undo"
          >
            ← 回到上一步</button>
        </nav>
        <p class="reading-note">
          動作按鈕會直接改變情境；回到上一步可還原剛才的操作與選擇。也可隨時從章節地圖切換主題。
        </p>
      </template>
      <p v-if="storageUnavailable" class="quiet" role="status">
        此瀏覽器無法保存閱讀位置，仍可繼續閱讀。
      </p>
    </main>
    <footer>所有案件與操作均為教學情境，不連接真實資料或模型。</footer>
  </div>
</template>
