<script setup lang="ts">
import { Point } from "./types";
import LatentSpace from "./components/LatentSpace.vue";
import { ref } from "vue";
import {
  NSpace,
  NLayout,
  NSpin,
  NLayoutHeader,
  NLayoutContent,
  NConfigProvider,
  NGlobalStyle,
  NSkeleton,
  darkTheme,
} from "naive-ui";
import ModelInference from "./components/ModelInference.vue";

const pos = ref<Point>({ x: 0, y: 0 });

const onHover = (ev: Point) => {
  pos.value = ev;
};
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-space horizontal space="large">
      <n-layout style="margin: 1rem">
        <n-layout-header>Latent space</n-layout-header>
        <n-layout-content style="padding: 1rem">
          <Suspense>
            <template #fallback>
              <n-spin :show="true">
                <n-skeleton height="400px" width="400px" />
              </n-spin>
            </template>
            <LatentSpace @hover="onHover" label="Wavetables" />
          </Suspense>
        </n-layout-content>
      </n-layout>
      <n-layout style="margin: 1rem">
        <n-layout-header>Wavetable</n-layout-header>
        <n-layout-content style="padding: 1em">
          <Suspense>
            <template #fallback>
              <n-spin :show="true">
                <n-skeleton width="400px" height="200px" />
              </n-spin>
            </template>
            <ModelInference :pos="pos" />
          </Suspense>
        </n-layout-content>
      </n-layout>
    </n-space>
    <n-global-style />
  </n-config-provider>
</template>
