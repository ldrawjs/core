import { Vector3 } from 'three';

export default function vectorized(...points: number[]) {
    const vec: Vector3[] = [];
    while (points.length) {
        const [x, y, z] = points.splice(0, 3);
        vec.push(new Vector3(x, y, z));
    }
    return vec;
}
