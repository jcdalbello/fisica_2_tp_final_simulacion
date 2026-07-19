import { ISimulationState } from '../domain/ports';

export class UIStateAdapter implements ISimulationState {
    private slider: HTMLInputElement;
    private display: HTMLSpanElement;
    private btnInvert: HTMLButtonElement;
    private currentDirection: number = 1;

    constructor() {
        this.slider = document.getElementById('currentSlider') as HTMLInputElement;
        this.display = document.getElementById('currentValDisplay') as HTMLSpanElement;
        this.btnInvert = document.getElementById('btnInvert') as HTMLButtonElement;

        this.bindEvents();
    }

    private bindEvents() {
        this.slider.addEventListener('input', (e) => {
            this.display.textContent = (e.target as HTMLInputElement).value;
        });

        this.btnInvert.addEventListener('click', () => {
            this.currentDirection *= -1;
            this.btnInvert.textContent = `Invertir Sentido (I ${this.currentDirection > 0 ? '> 0' : '< 0'})`;
        });
    }

    getCurrentMultiplier(): number {
        const value = parseFloat(this.slider.value);
        return value * this.currentDirection;
    }
    
    onStateChange(callback: () => void) {
        this.slider.addEventListener('input', callback);
        this.btnInvert.addEventListener('click', callback);
    }
}