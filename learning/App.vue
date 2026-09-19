<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { chapters, position, route } from "./chapters.mjs";
import { thesis, tracks } from './curriculum.mjs';
import { initialState, following, act } from './interaction.mjs';
import ComparisonLab from './ComparisonLab.vue';
import DesignNotebook from './DesignNotebook.vue';
import UnitAnimation from './UnitAnimation.vue';
const variant = ref(0);
const designMode = ref(location.hash === '#/design');
const steps = ref([]);
const locationState = ref(position(location.hash)),
  revealed = ref(false),
  choice = ref(-1),
  heading = ref(null);
const last = ref(null),
  storageUnavailable = ref(false);
const chapter = computed(() => chapters[locationState.value.chapter]);
const current = computed(() => {
  const scene = chapter.value.pages[locationState.value.page];
  return variant.value && scene.variants?.[variant.value] ? { ...scene, ...scene.variants[variant.value] } : scene;
});
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
const snapshot = () => ({ ...initialState(locationState.value.chapter, locationState.value.page), revealed: revealed.value, choice: choice.value, variant:variant.value });
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
  designMode.value = location.hash === '#/design';
  variant.value = 0;
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
  variant.value = state.variant || 0;
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
function changeVariant(value) {
  if (variant.value === value) return;
  steps.value.push(snapshot());
  restore({ ...snapshot(), variant:value, choice:-1, revealed:false });
}
function openUpcoming() {
  if (!upcoming.value) return;
  steps.value.push(snapshot());
  restore(upcoming.value);
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
      <template v-if="designMode"><DesignNotebook /></template>
      <template v-else-if="locationState.map">
        <section class="welcome">
          <p class="eyebrow">互動式學習地圖</p>
          <h1 ref="heading" tabindex="-1">
            讓 Agent 能完成、<br />能信任，也能持續改善。
          </h1>
          <p class="lead">
            {{ thesis }}
          </p>
          <div class="welcome-actions">
            <a class="primary" :href="route(0)">從完整系統開始 <span>→</span></a
            ><a v-if="last" class="text-link" :href="last">繼續上次的位置 →</a>
            <a class="text-link" href="#/design">我的系統設計 →</a>
          </div>
          <p class="quiet">
            用動作推進情境 · 可回到上一步比較結果 · 所有章節自由探索
          </p>
        </section>
        <section class="chapter-map" aria-label="章節地圖">
          <section v-for="track in tracks" :key="track.name" class="track-group" :aria-label="track.name">
          <h2>{{ track.name }}</h2>
          <p>{{ track.question }}</p>
          <a
            v-for="item in chapters.filter(c => track.ids.includes(c.id))"
            :key="item.id"
            :href="route(item.number)"
            class="chapter-card"
            :class="'chapter-' + item.number"
            ><span class="chapter-number">{{
              String(item.number).padStart(2, "0")
            }}</span>
            <div>
              <p class="chapter-name">原則 → 機制 → 比較 → 邊界 → 設計</p>
              <h2>{{ item.question }}</h2>
              <p>{{ item.description }}</p>
              <small>學習目標：{{ item.objectives[0] }}</small>
              <small>設計成果：{{ item.design.title }}</small>
            </div>
            <span class="chapter-arrow" aria-hidden="true">→</span></a
          >
          </section>
        </section>
        <p class="map-caption">
          先掌握核心結論，再透過操作理解理由，最後將觀念用於新情境。所有單元自由進入，不計分、不解鎖。
        </p>
      </template>
      <template v-else>
        <div class="chapter-meta">
          <span
            >單元 {{ chapter.number }} / {{ chapter.group }}</span
          ><span
            >情境 {{ locationState.page + 1 }} / {{ chapter.pages.length }}</span
          >
        </div>
        <section class="unit-principle" :key="chapter.id" aria-label="單元結論與學習目標">
          <p class="eyebrow">{{ chapter.title }} · 核心結論</p>
          <p class="unit-conclusion">{{ chapter.conclusion }}</p>
          <details :open="locationState.page === 0">
            <summary>這個單元你會學會</summary>
            <ul><li v-for="goal in chapter.objectives" :key="goal">{{ goal }}</li></ul>
            <p>深入目標：比較方案與適用邊界，完成「{{ chapter.design.title }}」，說明理由、代價與重新評估條件。</p>
          </details>
          <nav class="welcome-actions" aria-label="單元探索"><a class="text-link" :href="route(chapter.number, chapter.pages.findIndex(p => p.deep))">直接比較設計方案 →</a><a class="text-link" :href="route(chapter.number, chapter.pages.length - 1)">制定{{ chapter.design.title }} →</a></nav>
        </section>
        <p v-if="locationState.page !== 0"><a class="text-link" :href="route(chapter.number)">觀看本單元流程動畫 →</a></p>
        <UnitAnimation v-if="locationState.page === 0" :key="chapter.id" :unit="chapter.id" />
        <article class="lesson" :key="chapter.id + '-' + locationState.page">
          <header class="lesson-title">
            <p class="eyebrow">
              {{
                current.depth || (current.review ? '單元應用 · 先說出理由，再比較結果' : '透過操作理解原則')
              }}
            </p>
            <h1 ref="heading" tabindex="-1">{{ current.title }}</h1>
            <p class="section-objective"><strong>這一節要學會：</strong>{{ current.objective }}</p>
            <p class="lead">{{ current.intro }}</p>
          </header>
          <DesignNotebook v-if="current.design" :key="chapter.id" :unit="chapter.id" />
          <template v-else>
          <ComparisonLab v-if="current.deep" :key="chapter.id + '-' + current.id" :scene="current" :choice="choice" :variant="variant" @variant="changeVariant" />
          <section v-else
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
                <button v-if="!interacted" class="primary" :disabled="steps.length === 0" @click="undo">← 回到上一步</button>
                <button
                  v-for="(option, i) in current.choices"
                  :key="option.label"
                  :aria-pressed="choice === i"
                  @click="perform(i)"
                >
                  {{ option.label }} <span>→</span>
                </button>
              </div></template
            ><div v-else-if="!interacted" class="action-row">
            <button class="primary" :disabled="steps.length === 0" @click="undo">← 回到上一步</button>
            <button
              class="primary"
              @click="perform()"
            >
              {{ current.action }} <span>→</span></button
            ></div>
            <div v-if="interacted" class="explanation" role="status">
              <span class="explanation-label">這個結果說明了什麼？</span>
              <p>{{ feedback }}</p>
              <p v-if="current.term" class="term">{{ current.term }}</p>
              <p v-if="current.review" class="term">自我檢查：能用自己的話說明理由嗎？操作紀錄不代表已掌握觀念。</p>
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
              <template v-if="upcoming.chapter !== locationState.chapter">
                <p><strong>核心結論：</strong>{{ chapters[upcoming.chapter].conclusion }}</p>
                <p>這個單元你會學會：</p>
                <ul><li v-for="goal in chapters[upcoming.chapter].objectives" :key="goal">{{ goal }}</li></ul>
              </template>
              <p class="section-objective"><strong>操作目標：</strong>{{ upcomingScene.objective }}</p>
              <p>{{ upcomingScene.intro }}</p>
              <div class="action-row">
              <button class="primary" :disabled="steps.length === 0" @click="undo">← 回到上一步</button>
              <button v-if="upcomingScene.deep || upcomingScene.design" class="primary" @click="openUpcoming">{{ upcomingScene.design ? '制定' + chapters[upcoming.chapter].design.title : '探索：' + upcomingScene.title }} →</button>
              <div v-else-if="upcomingScene.choices" class="choices">
                <button class="primary" v-for="(option, i) in upcomingScene.choices" :key="option.label" @click="perform(i, true)">
                  {{ option.label }} <span>→</span>
                </button>
              </div>
              <button v-else class="primary" @click="perform(-1, true)">{{ upcomingScene.action }} <span>→</span></button>
              </div>
            </div>
            <div v-else-if="interacted" class="action-row">
              <button class="primary" :disabled="steps.length === 0" @click="undo">← 回到上一步</button>
              <a href="#/design" class="primary">整合我的案件助手設計 →</a>
            </div>
          </section>
          </template>
        </article>
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
