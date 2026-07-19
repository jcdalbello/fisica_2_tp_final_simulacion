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

        // Formateo con dos decimales y un símbolo indicativo
        const formatted = value.toFixed(2);
        this.displayElement.textContent = `${formatted}`;
        this.displayElement.style.color = value < 0 ? "#d32f2f" : "#1976d2";
    }
}