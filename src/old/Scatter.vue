<script setup lang="ts">
import { Scatter, Line } from "vue-chartjs";
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
import { Wavetables } from "../types";
import { computed, reactive, ref, watchPostEffect } from "vue";
import { WaveFile } from "wavefile";
import type { TChartData, TChartOptions } from "vue-chartjs/dist/types";
import Box from "./Box.vue";
import * as ort from "onnxruntime-web";
import { useMatchMedia } from "../compositions/useMedia";
import { download } from "../utils";

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

const prefersDark = useMatchMedia("(prefers-color-scheme: dark)");
const chartColor = computed(() => (prefersDark.value ? "white" : "black"));

const wt: Wavetables = await fetch("/wavetables.json").then((r) => r.json());
const points = wt.map((e) => ({ x: e[1][0], y: e[1][1], wave: e[0] }));
const datasets = computed(() => [
  {
    label: "Wavetables",
    backgroundColor: chartColor.value,
    borderColor: chartColor.value,
    fill: false,
    data: points,
  },
]);
const chartData = computed<TChartData<"scatter">>(() => ({
  datasets: datasets.value,
}));

const mousepos = reactive({ x: 0, y: 0 });
const chartOptions = computed<TChartOptions<"scatter">>(() => ({
  maintainAspectRatio: true,
  aspectRatio: 1,
  scales: {
    x: { min: -1, max: 2 },
    y: { min: -1, max: 2 },
  },
  plugins: {
    tooltip: {
      enabled: false,
    },
  },
}));

const chartRef = ref<(HTMLCanvasElement & { chart: ChartJS | null }) | null>(
  null
);
const mouseWave = ref<Float32Array | null>(null);
watchPostEffect(() => {
  // Accessing mousepos here so that it gets picked up by dependency tracking
  let x = mousepos.x;
  let y = mousepos.y;
  const chart = chartRef.value?.chart;
  if (!chart) return;

  x = chart.scales.x.getValueForPixel(x) ?? 0;
  y = chart.scales.y.getValueForPixel(y) ?? 0;
  console.log(x, y);
  model
    .run({ pos: new ort.Tensor("float32", [x, y]) })
    .then((out) => (mouseWave.value = out.wavetable.data as Float32Array));
});
const chartMouseMove = ($event: MouseEvent) => {
  if (isDragging.value) return;
  let chart = chartRef.value?.chart;
  if (!chart) return;
  var pos = getRelativePosition($event, chart);
  mousepos.x = pos.x;
  mousepos.y = pos.y;
};

const polyline = ref<[number, number][]>([]);
const isDragging = ref(false);
const onDragStart = () => {
  polyline.value = [];
  isDragging.value = true;
};

const onDragUpdate = (ev: MouseEvent) => {
  const chart = chartRef.value?.chart;
  if (!chart) return;
  const { x, y } = getRelativePosition(ev, chart);
  polyline.value.push([
    chart.scales.x.getValueForPixel(x) ?? 0,
    chart.scales.y.getValueForPixel(y) ?? 0,
  ]);
};

const onDragDone = async () => {
  const results = await Promise.all(
    polyline.value
      .map((pos) => new ort.Tensor("float32", pos))
      .map((pos) => model.run({ pos }))
  );
  const values = results
    .map(({ wavetable: { data } }) => Array.from(data as Float32Array))
    .map((data) => {
      let min = Math.min(...data);
      let max = Math.max(...data);
      return data.map((x) => (2 * (x - min)) / (max - min) - 1);
    })
    .reduce((acc, el) => acc.concat(el));

  const wav = new WaveFile();
  wav.fromScratch(1, 44100, "32f", values);
  download("wavetable.wav", "audio/x-wav", wav.toBase64());

  isDragging.value = false;
};
</script>

<template>
  <Box orientation="column" align="center" padding="m">
    <Box orientation="column" align="center">
      <h2>Latent space</h2>
      <scatter
        class="latent-chart"
        ref="chartRef"
        chart-id="wt-scatter"
        @mousedown.prevent="onDragStart"
        @mouseup.prevent="onDragDone"
        @mousemove.prevent="
          isDragging ? onDragUpdate($event) : chartMouseMove($event)
        "
        :width="400"
        :height="400"
        :chart-data="chartData"
        :chart-options="chartOptions"
      />
    </Box>
    <Box orientation="column" align="center">
      <h2>Wavetable</h2>
      <Line
        class="wavetable-chart"
        chart-id="wt-scatter-tooltip"
        :width="400"
        :height="200"
        :chart-data="{
          labels: new Array(mouseWave?.length ?? 0).fill(0).map((_, i) => i),
          datasets: [
            {
              label: 'Wavetable',
              data: mouseWave ? Array.from(mouseWave.values()) : [],
              backgroundColor: chartColor,
              borderColor: chartColor,
            },
          ],
        }"
        :chart-options="{
          animation: false,
          maintainAspectRatio: true,
          aspectRatio: 2,
          elements: { point: { radius: 0 } },
          scales: {
            // x: { grid: { display: false }, min: 0, max: 256 },
            // y: { grid: { display: false }, min: -1, max: 1 },
          },
        }"
      />
    </Box>
  </Box>
</template>

<style lang="sass" scoped>
.latent-chart,
.wavetable-chart
  box-sizing: content-box
  position: relative
  width: 30vw
  height: 30vh
</style>
