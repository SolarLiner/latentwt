import { Ref, ref, UnwrapRef } from "vue";

export function usePromise<T>(
  p: Promise<UnwrapRef<T>>
): Ref<UnwrapRef<T> | null> {
  const res = ref<T | null>(null);
  p.then((value) => {
    res.value = value;
  });
  return res;
}
