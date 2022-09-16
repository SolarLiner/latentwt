<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import * as ort from "onnxruntime-web";
import { Line } from "vue-chartjs";
import { computed, ref, watchEffect, watchPostEffect } from "vue";
import { Point } from "../types";
import { useThemeVars } from "naive-ui";

const model = await ort.InferenceSession.create("/latentwt.onnx");

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{ pos: Point }>();
const emit = defineEmits<{ (e: "run", value: number[]): void }>();
const wavetable = ref<number[]>();
const theme = useThemeVars();

watchEffect(() => (wavetable.value ? emit("run", wavetable.value) : undefined));

const run = async (pt: Point): Promise<number[]> => {
  const {
    wavetable: { data },
  } = await model.run({ pos: new ort.Tensor("float32", [pt.x, pt.y]) });
  return Array.from(data as Float32Array);
};

watchPostEffect(async () => {
  wavetable.value = await run(props.pos);
});

const data = computed(() => Array.from(wavetable.value ?? []));
</script>

<template>
  <Line
    chart-id="inference-chart"
    :width="400"
    :height="200"
    :chart-options="{
      animation: false,
      aspectRatio: 2,
      maintainAspectRatio: true,
      responsive: true,
      elements: {
        point: { radius: 0 },
        line: { backgroundColor: theme.textColor1, fill: true },
      },
      plugins: {
        tooltip: { enabled: false },
      },
    }"
    :chart-data="{
      datasets: [
        {
          label: 'Wavetable',
          backgroundColor: theme.textColor1,
          borderColor: theme.textColor1,
          data,
        },
      ],
    }"
  />
</template>
