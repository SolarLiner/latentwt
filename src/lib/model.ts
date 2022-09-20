import * as ort from "onnxruntime-web";
import {Point} from '../types';
import modelUrl from '../assets/latentwt.onnx?url';

export class LatentWavetable {
  static async load(): Promise<LatentWavetable> {
    const module = await fetch(modelUrl).then(res => res.arrayBuffer());
    return new LatentWavetable(await ort.InferenceSession.create(module, { executionMode: 'sequential', graphOptimizationLevel: 'all' }));
  }

  constructor(public readonly inference: ort.InferenceSession) {
  }

  async run(pt: Point): Promise<number[]> {
    const input = new ort.Tensor("float32", [pt.x, pt.y]);
    const output = await this.inference.run({ pos: input });
    return Array.from(output.wavetable.data as Float32Array);
  }
}