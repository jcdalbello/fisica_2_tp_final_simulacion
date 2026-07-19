// src/infrastructure/ProbeUIAdapter.ts
import { IProbeUI } from '../domain/ports';

export class ProbeUIAdapter implements IProbeUI {
    private displayElement: HTMLSpanElement;

    constructor() {
        this.displayElement = document.getElementById('probeValue') as HTMLSpanElement;
    }

    displayFieldValue(value: number | null): void {
        if (value === null) {
            this.displayElement.textContent = "Singularidad (r ≈ 0)";
            this.displayElement.style.color = "#d32f2f";
            return;
        }

        // Conversión de Teslas a microteslas (1 T = 10^6 µT)
        const valueInMicroTeslas = value * 1e6;
        
        // Al estar en microteslas, podemos volver a usar 2 decimales fijos
        const formatted = valueInMicroTeslas.toFixed(2);
        
        this.displayElement.textContent = `${formatted} [µT]`;
        this.displayElement.style.color = value < 0 ? "#d32f2f" : "#1976d2";
    }
}