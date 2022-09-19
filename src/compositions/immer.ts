import { Draft, produce } from "immer";
import { Ref, shallowRef } from "vue";

type Update<T> = (recipe: (draft: Draft<T>) => void | Draft<T>) => void;

export function immer<T>(state: T): Ref<T> & { update: Update<T> } {
  const ref = shallowRef(state);
  const update: Update<T> = (draft) => {
    ref.value = produce(ref.value, draft);
  };
  return Object.assign(ref, { update });
}
