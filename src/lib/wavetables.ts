import {Point} from '../types';
import data from '../assets/wavetables.json';

type WavetablesData = Array<[number[], [number, number]]>;

export class Wavetables {
  static load(): Wavetables {
    return new Wavetables(data as WavetablesData);
  }

  constructor(private readonly data: WavetablesData) {
  }

  *positions(): Generator<Point> {
    for(const [,[x,y]] of this.data) {
      yield { x, y };
    }
  }
}