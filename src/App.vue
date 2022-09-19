<script setup lang="ts">
import {Point} from './types';
import {computed, nextTick, ref} from 'vue';
import {
  NButton,
  NCard,
  NCollapseTransition,
  NConfigProvider,
  NGlobalStyle,
  NGrid, NGi,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NSkeleton,
  NSpace,
  NSpin,
  NP,
  NA,
  NPageHeader,
  darkTheme,
  createDiscreteApi,
} from 'naive-ui';
import LatentSpace from './components/LatentSpace.vue';
import ModelInference from './components/ModelInference.vue';
import LineChart from './components/LineChart.vue';
import {WaveFile} from 'wavefile';
import {download} from './utils';
import {immer} from './compositions/immer';
import {useMatchMedia} from './compositions/useMedia';

const pos = ref<Point>({x: 0, y: 0});
const wavetableSequence = immer<number[]>([]);
const wavefilename = ref('wavetable');
const model = ref<typeof ModelInference>();
const prefersDarkMode = useMatchMedia('(prefers-color-scheme: dark)');
const running = ref(0);
const theme = computed(() => (prefersDarkMode.value ? darkTheme : null));
const naiveApi = createDiscreteApi(['message']);

const onHover = (ev: Point) => {
  pos.value = ev;
};

const normalize = (arr: number[]) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min;
  return arr.map((x) => (2 * (x - min)) / range - 1);
};
const onWavetableStep = async (pt: Point) => {
  // const i = wavetableSequence.value.length;
  // wavetableSequence.update((draft) => {
  //   draft.push(...new Array(256).fill(0));
  // });
  // running.value++;
  // const wt: number[] = await model.value?.run(pt);
  // wavetableSequence.update((draft) => {
  //   draft.splice(i, 256, ...normalize(wt));
  // });
  // running.value--;
  running.value++;
  const wt = await model.value?.run(pt);
  wavetableSequence.update((draft) => {
    draft.push(...normalize(wt));
  });
  running.value--;
};
const clear = () => {
  wavetableSequence.value = [];
};
const makeWavefile = async () => {
  if (wavetableSequence.value.length === 0) return;
  if (running.value > 0) {
    await nextTick();
    return;
  }
  const wav = new WaveFile();
  wav.fromScratch(1, 44100, '32f', wavetableSequence.value);
  download(
      `${wavefilename.value}.wav`,
      new Blob([wav.toBuffer().buffer], {type: 'audio/x-wav'}),
  );
  naiveApi.message.success('Wavetable sequence generated.');
};
const validateFilename = () => {
  if (wavefilename.value.length === 0) wavefilename.value = 'wavetable';
};
</script>

<template>
  <n-config-provider
      :theme="theme"
      :theme-overrides="{
      common: {
        fontFamily: 'Azaret Mono, monospace',
        fontFamilyMono: 'Azaret Mono, monospace',
      },
    }"
  >
    <n-page-header
        title="Latent Wavetable"
        subtitle="AI-generated wavetable sequences"
        style="margin: 1rem 4rem"
    >
      <n-space vertical :wrap-item="true">
        <div>
          <n-p>This webpage runs an AI model in the background that automatically
            generated waveforms anywhere in this latent space.<br/>
            You can explore this latent space by hovering your mouse over it, and
            you can generate and save custom wavetable sequences by clicking and
            dragging over the latent space.<br/>
            The original wavetables come from
            <n-a href="https://waveeditonline.com/">WaveEdit Online</n-a>
            .
          </n-p>
        </div>
        <n-grid
            style="margin-top: 2rem; flex-grow: 1"
            x-gap="12"
            :cols="2"
            :item-responsive="true"
        >
          <n-gi>
            <n-card title="Latent space">
              <Suspense>
                <template #fallback>
                  <n-spin :show="true">
                    <n-skeleton/>
                  </n-spin>
                </template>
                <n-collapse-transition :appear="true">
                  <LatentSpace
                      @reset="clear"
                      @hover="onHover"
                      @step="onWavetableStep"
                      label="Wavetables"
                  />
                </n-collapse-transition>
              </Suspense>
            </n-card>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <n-card>
                <Suspense>
                  <template #fallback>
                    <n-spin :show="true">
                      <n-skeleton width="400px" height="200px"/>
                    </n-spin>
                  </template>
                  <n-collapse-transition :appear="true">
                    <ModelInference ref="model" :pos="pos"/>
                  </n-collapse-transition>
                </Suspense>
              </n-card>
              <n-card>
                <LineChart
                    id="sequence"
                    label="Generated sequence"
                    :points="wavetableSequence"
                    :aspect-ratio="2"
                />
                <template #action>
                  <n-space justify="end" size="small">
                    <n-input-group>
                      <n-input placeholder="Filename" v-model:value="wavefilename" @blur="validateFilename"/>
                      <n-input-group-label>.wav</n-input-group-label>
                    </n-input-group>
                    <n-button strong secondary @click="clear" :disabled="wavetableSequence.length === 0">Clear
                    </n-button>
                    <n-button type="primary" @click="makeWavefile" :disabled="wavetableSequence.length === 0">
                      Download
                    </n-button>
                  </n-space>
                </template>
              </n-card>
            </n-space>
          </n-gi>
        </n-grid>
      </n-space>
    </n-page-header>
    <n-global-style/>
  </n-config-provider>
</template>

<style>
html {
  width: 100vw;
  height: 100vh;
  max-width: 80rem;
  margin: 0 auto;
}

body {
  min-height: 100vh;
}

div#app {
  min-height: 100vh;
}
</style>