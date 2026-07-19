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

        const valueInMicroTeslas = value * 1e6;
        
        const formatted = valueInMicroTeslas.toFixed(2);
        
        this.displayElement.textContent = `${formatted} [µT]`;
        this.displayElement.style.color = value < 0 ? "#d32f2f" : "#1976d2";
    }
}