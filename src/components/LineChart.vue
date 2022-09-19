<script setup lang="ts">
import { Point } from "../types";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
} from "chart.js";
import { Line } from "vue-chartjs";
import { computed, ref } from "vue";
import { getRelativePosition } from "chart.js/helpers";
import { useThemeVars } from "naive-ui";

const props = withDefaults(
  defineProps<{
    id: string;
    aspectRatio: number;
    points: number[];
    label: string;
    animation?: boolean;
  }>(),
  {
    animation: false,
  }
);
const theme = useThemeVars();

const xAxis = computed(() =>
  new Array(props.points.length).fill(0).map((_, i) => i)
);
const emit = defineEmits<{ (e: "hover", pt: Point): void }>();

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale);

const chart = ref<HTMLCanvasElement & { chart: ChartJS }>();
const onHover = (ev: MouseEvent) => {
  const r = chart.value?.chart;
  if (!r) return;
  const { x, y } = getRelativePosition(ev, r);
  const pt = {
    x: r.scales.x.getValueForPixel(x) ?? 0,
    y: r.scales.y.getValueForPixel(y) ?? 0,
  };
  emit("hover", pt);
};
</script>

<template>
  <Line
    ref="chart"
    :chart-id="props.id"
    @mouseover.prevent="onHover"
    :chart-options="{
      animation: props.animation ? undefined : false,
      aspectRatio: props.aspectRatio,
      responsive: true,
      maintainAspectRatio: true,
      elements: { point: { radius: 0 } },
      plugins: { decimation: { enabled: true }, tooltip: { enabled: false } },
    }"
    :chart-data="{
      labels: xAxis,
      datasets: [
        {
          label: props.label,
          data: props.points,
          backgroundColor: theme.textColor1,
          borderColor: theme.textColor1,
        },
      ],
    }"
  />
</template>
