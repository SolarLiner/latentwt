<script setup lang="ts">
import * as ort from "onnxruntime-web";
import { ref, watchEffect, watchPostEffect } from "vue";
import { Point } from "../types";
import LineChart from "./LineChart.vue";

const model = await ort.InferenceSession.create("/latentwt.onnx");

const props = defineProps<{ pos: Point }>();
const emit = defineEmits<{ (e: "run", value: number[]): void }>();
const wavetable = ref<number[]>(new Array(256).fill(0));

watchEffect(() => (wavetable.value ? emit("run", wavetable.value) : undefined));

const run = async (pt: Point): Promise<number[]> => {
  const {
    wavetable: { data },
  } = await model.run({ pos: new ort.Tensor("float32", [pt.x, pt.y]) });
  return Array.from(data as Float32Array);
};

defineExpose({ run });

watchPostEffect(async () => {
  wavetable.value = await run(props.pos);
});
</script>

<template>
  <LineChart
    id="inference-chart"
    label="Wavetable"
    :aspect-ratio="2"
    :points="wavetable"
  />
</template>
