<script setup lang="ts">
import {
  Chart as ChartJS,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
import { Scatter } from "vue-chartjs";
import { useThemeVars } from "naive-ui";
import { ref, watchEffect } from "vue";
import { Point, Wavetables } from "../types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const wt: Wavetables = await fetch("/wavetables.json").then((r) => r.json());
const points = wt.map(([, [x, y]]) => ({ x, y }));

const emit = defineEmits<{
  (e: "hover", pt: Point): void;
  (e: "step", pts: Point): void;
  (e: "reset"): void;
  (e: "done"): void;
}>();

const theme = useThemeVars();
const elementRef = ref<(HTMLCanvasElement & { chart?: ChartJS }) | null>(null);

const onMouseover = (ev: MouseEvent) => {
  const chart = elementRef.value?.chart;
  if (!chart) return;

  const { x, y } = getRelativePosition(ev, chart);
  const pt = {
    x: chart.scales.x.getValueForPixel(x) ?? 0,
    y: chart.scales.y.getValueForPixel(y) ?? 0,
  };
  emit("hover", pt);
  if (clicking.value) {
    emit("step", pt);
  }
};

const clicking = ref(false);

watchEffect(() => {
  if (clicking.value) {
    emit("reset");
  } else emit("done");
});
</script>

<template>
  <Scatter
    ref="elementRef"
    chart-id="latent-space"
    @mousemove.prevent="onMouseover"
    @mousedown.prevent="clicking = true"
    @mouseup.prevent="clicking = false"
    :chart-data="{
      datasets: [
        {
          label: 'Wavetables',
          backgroundColor: theme.textColor1,
          borderColor: theme.textColor1,
          data: points,
        },
      ],
    }"
    :chart-options="{
      aspectRatio: 1,
      maintainAspectRatio: true,
      responsive: true,
      elements: { point: { pointStyle: 'crossRot' } },
      plugins: {
        tooltip: { enabled: false },
      },
    }"
  />
</template>
