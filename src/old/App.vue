<script setup lang="ts">
import Scatter from "./components/Scatter.vue";
import Box from "./components/Box.vue";
import Title from "./components/Title.vue";
</script>

<template>
  <Box orientation="column" align="start">
    <Title>Latent Wavetables</Title>
    <p>
      This is an embedding of all the wavetables provided by
      <a href="https://waveeditonline.com/">WaveEdit Online</a>. Examplars of
      wavetables are shown as dots, and the entire space in-between (and around)
      has been mapped by an autoencoder.
    </p>
    <p>
      Hover over the latent space to visualize the generated wavetables, and
      click & drag to generate a custom wavetable file!
    </p>
  </Box>
  <Suspense>
    <template #fallback>Loading model...</template>
    <Scatter />
  </Suspense>
</template>
