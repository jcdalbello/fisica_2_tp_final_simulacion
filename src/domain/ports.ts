// src/domain/ports.ts
import { Vector3D, Wire, FieldPoint } from './entities';

export interface IBiotSavartSolver {
    calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null;
}

export interface IRenderer {
    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number): void;
    renderProbe(position: Vector3D | null): void; // Dibuja el indicador
    clear(): void;
}

export interface ISimulationState {
    getCurrentMultiplier(): number;
}

export interface IProbeUI {
    displayFieldValue(value: number | null): void;
}

export interface IWireInputHandler {
    onWireDrawing(callback: (wire: Wire) => void): void;
    onWireComplete(callback: (wire: Wire) => void): void;
    onProbeMove(callback: (position: Vector3D | null) => void): void; // Rastrea el mouse
    clearState(): void;
}