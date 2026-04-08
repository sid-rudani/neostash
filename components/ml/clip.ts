import './polyfill';
import { pipeline, env } from '@huggingface/transformers';

// Setup Transformers.js for React Native Environment
env.allowLocalModels = false;
env.useBrowserCache = false;

class ClipService {
  private static embedder: any = null;
  private static taskProcessing: boolean = false;

  static async init() {
    if (this.embedder || this.taskProcessing) return;
    this.taskProcessing = true;
    try {
      console.log('Loading Quantized Local CLIP Model...');
      // Use Xenova's ONNX-quantized model. On React Native this falls back 
      // smoothly via ONNX Runtime Hooks if configured or the WASM engine.
      this.embedder = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32', {
        dtype: 'q8',
      });
      console.log('Local CLIP Models loaded successfully.');
    } catch (e) {
      console.error('Failed to load local ONNX CLIP Model', e);
    }
    this.taskProcessing = false;
  }

  static async embedText(text: string): Promise<number[] | null> {
    await this.init();
    if (!this.embedder) return null;
    try {
      const output = await this.embedder(text);
      return Array.from(output.data);
    } catch(e) {
      console.error("Text Embed Error", e);
      return null;
    }
  }

  static async embedImage(imageUrl: string): Promise<number[] | null> {
    await this.init();
    if (!this.embedder) return null;
    try {
      const output = await this.embedder(imageUrl);
      return Array.from(output.data);
    } catch (e) {
      console.error("Image Embed Error", e);
      return null;
    }
  }
}

export default ClipService;
