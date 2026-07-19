// src/domain/VectorMath.ts
import { Vector3D } from './entities';

export const VectorMath = {
    cross: (a: Vector3D, b: Vector3D): Vector3D => ({
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    }),
    add: (a: Vector3D, b: Vector3D): Vector3D => ({
        x: a.x + b.x, 
        y: a.y + b.y, 
        z: a.z + b.z
    }),
    sub: (a: Vector3D, b: Vector3D): Vector3D => ({
        x: a.x - b.x, 
        y: a.y - b.y, 
        z: a.z - b.z
    }),
    mag: (v: Vector3D): number => Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)
};