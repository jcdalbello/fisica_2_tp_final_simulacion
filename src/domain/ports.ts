// src/domain/ports.ts
import { Vector3D, Wire, FieldPoint } from './entities';

export interface IBiotSavartSolver {
    calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null;
}

export interface IRenderer {
    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number): void;
    clear(): void;
}

export interface ISimulationState {
    getCurrentMultiplier(): number;
}

export interface IWireInputHandler {
    onWireDrawing(callback: (wire: Wire) => void): void;
    onWireComplete(callback: (wire: Wire) => void): void;
    clearState(): void;
}