import { writable, type Unsubscriber, get } from "svelte/store";

export const buffers = writable<[string, string]>(["", ""]);
const lastOperation = writable("");

export const swapBuffers = () => buffers.update(([low, hi]) => [hi, low]);
export const pushChar = (char: string) => {
  buffers.update((state) => {
    if (state[0].length >= 24) return state;

    state[0] += char;
    return state;
  });
};

export const operate = () => {
  const [low, _] = get(buffers);
  buffers.update(([low, hi]) => {
    low = low.replace(/(?<!\d)0+(?![\.\*\+\/\-])/m, "");
    if (low.length === 0) {
      if (get(lastOperation).length) return [get(lastOperation), hi];

      return ["", hi];
    }
    return ["", eval(low.replace("Ans", hi))];
  });
  lastOperation.set(low);
};
export const clear = (all: boolean) =>
  all ? buffers.set(["", ""]) : buffers.update(([_low, hi]) => ["", hi]);
