export interface Vector3D {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export interface Segment {
    readonly start: Vector3D;
    readonly end: Vector3D;
    readonly midPoint: Vector3D;
    readonly deltaL: Vector3D;
}

export interface Wire {
    readonly segments: Segment[];
}

export interface FieldPoint {
    point: Vector3D;
    fieldVector: Vector3D;
}