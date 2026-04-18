/*
 * Copyright (c) 2015-2018, IGN France.
 * Copyright (c) 2018-2026, Giro3D team.
 * SPDX-License-Identifier: MIT
 */

/**
 * Returns a promise that will resolve after the specified duration.
 *
 * @param duration - The duration, in milliseconds.
 * @returns The promise.
 */
function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}
function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
export let PromiseStatus = /*#__PURE__*/function (PromiseStatus) {
  PromiseStatus["Fullfilled"] = "fulfilled";
  PromiseStatus["Rejected"] = "rejected";
  return PromiseStatus;
}({});
export class AbortError extends Error {
  constructor() {
    super('aborted');
    this.name = 'AbortError';
  }
}

/**
 * Returns an Error with the 'aborted' reason.
 *
 * @returns The error.
 */
function abortError() {
  return new AbortError();
}
const SLICE_DURATION_MILLISECONDS = 4;
function batch(items, transformer, options) {
  const result = options?.outputItems ?? [];
  return (start => {
    const begin = performance.now();
    for (let i = start; i < items.length; i++) {
      const input = items[i];
      const output = transformer(input, i);
      if (output != null) {
        result.push(output);
      }
      const elapsed = performance.now() - begin;
      if (elapsed > SLICE_DURATION_MILLISECONDS) {
        const nextStart = i + 1;
        return Promise.resolve(nextStart);
      }
    }
    options?.signal?.throwIfAborted();
    return Promise.resolve(undefined);
  })(options?.start ?? 0).then(async nextStart => {
    if (nextStart != null) {
      options?.signal?.throwIfAborted();
      await batch(items, transformer, {
        outputItems: result,
        signal: options?.signal,
        start: nextStart
      });
    }
    return result;
  });
}
export default {
  delay,
  PromiseStatus,
  abortError,
  nextFrame,
  batch
};