import { nextTick, onUnmounted, ref } from "vue";

export function useMatchMedia(query: string) {
  const queryList = window.matchMedia(query);
  const value = ref(queryList.matches);
  const listener = (ev: MediaQueryListEvent) => (value.value = ev.matches);
  nextTick(() => {
    queryList.addEventListener("change", listener);
  });
  onUnmounted(() => queryList.removeEventListener("change", listener));
  return value;
}
