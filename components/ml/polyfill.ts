/**
 * React Native Polyfills for @huggingface/transformers
 *
 * This file must be imported BEFORE @huggingface/transformers.
 *
 * Problem 1: navigator.userAgent
 *   transformers.js calls navigator.userAgent.match(...) at module load time to
 *   detect Safari. In Hermes, navigator.userAgent is undefined → crash.
 *
 * Problem 2: ONNX Runtime backend
 *   transformers.web.js resolves its ONNX backend by checking globalThis for a
 *   special Symbol('onnxruntime') key. If absent, it falls back to
 *   `onnxruntime-web` (WASM) which doesn't work in React Native.
 *   We inject `onnxruntime-react-native` under that symbol so the library
 *   picks it up automatically.
 */

// ─── Fix 1: navigator.userAgent ─────────────────────────────────────────────
if (typeof navigator !== 'undefined' && navigator.userAgent === undefined) {
  Object.defineProperty(navigator, 'userAgent', {
    get() {
      return 'ReactNative';
    },
    configurable: true,
  });
}

// ─── Fix 2: ONNX Runtime backend ─────────────────────────────────────────────
// The symbol key used internally by @huggingface/transformers to locate ORT.
const ORT_SYMBOL = Symbol.for('onnxruntime');

if (!(ORT_SYMBOL in globalThis)) {
  // Lazy-require so Metro can tree-shake if this file is never imported.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ort = require('onnxruntime-react-native');
  (globalThis as any)[ORT_SYMBOL] = ort;
}
