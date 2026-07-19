// src/main.ts
import { BiotSavartCalculator } from './application/BiotSavartCalculator';
import { CanvasRenderer } from './infrastructure/CanvasRenderer';
import { UIStateAdapter } from './infrastructure/UIStateAdapter';
import { CanvasInputAdapter } from './infrastructure/CanvasInputAdapter';
import { ProbeUIAdapter } from './infrastructure/ProbeUIAdapter';
import { Wire, Vector3D, FieldPoint } from './domain/entities';
import { IBiotSavartSolver, IRenderer, ISimulationState, IWireInputHandler, IProbeUI } from './domain/ports';

class SimulationController {
    private gridPoints: Vector3D[] = [];
    private currentWire: Wire = { segments: [] };
    private currentBaseField: FieldPoint[] = [];

    constructor(
        private solver: IBiotSavartSolver,
        private renderer: IRenderer,
        private stateProvider: ISimulationState,
        private inputHandler: IWireInputHandler,
        private probeUI: IProbeUI,
        private widthPx: number,
        private heightPx: number,
        private pixelsToMeters: number
    ) {
        this.generateGrid();
        this.setupWiring();
    }

    private generateGrid() {
        const spacingPx = 20;
        // La grilla se genera directamente en metros
        for (let xPx = spacingPx / 2; xPx < this.widthPx; xPx += spacingPx) {
            for (let yPx = spacingPx / 2; yPx < this.heightPx; yPx += spacingPx) {
                this.gridPoints.push({ 
                    x: xPx * this.pixelsToMeters, 
                    y: yPx * this.pixelsToMeters, 
                    z: 0 
                });
            }
        }
    }

    private setupWiring() {
        this.inputHandler.onWireDrawing((wire: Wire) => {
            this.renderer.clear();
            this.probeUI.displayFieldValue(0);
            this.renderer.renderSimulation(wire, [], 0); 
        });

        this.inputHandler.onWireComplete((wire: Wire) => {
            this.currentWire = wire;
            this.calculateBaseField();
            this.renderFinal();
        });

        this.inputHandler.onProbeMove((position: Vector3D | null) => {
            this.renderer.renderProbe(position);
            
            if (position === null || this.currentWire.segments.length === 0) {
                this.probeUI.displayFieldValue(0);
                return;
            }

            const fieldBase = this.solver.calculateFieldAt(position, this.currentWire);
            
            if (fieldBase === null) {
                this.probeUI.displayFieldValue(null);
            } else {
                const currentI = this.stateProvider.getCurrentMultiplier();
                this.probeUI.displayFieldValue(fieldBase.z * currentI);
            }
        });

        if (this.stateProvider instanceof UIStateAdapter) {
            this.stateProvider.onStateChange(() => {
                if (this.currentWire.segments.length > 0) {
                    this.renderFinal();
                }
            });
        }
    }

    private calculateBaseField() {
        this.currentBaseField = [];
        for (const point of this.gridPoints) {
            const fieldVector = this.solver.calculateFieldAt(point, this.currentWire);
            if (fieldVector !== null) {
                this.currentBaseField.push({ point, fieldVector });
            }
        }
    }

    public renderFinal() {
        this.renderer.clear();
        const currentI = this.stateProvider.getCurrentMultiplier(); 
        this.renderer.renderSimulation(this.currentWire, this.currentBaseField, currentI);
    }
}

const simCanvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const overlayCanvas = document.getElementById('overlayCanvas') as HTMLCanvasElement;
const btnClear = document.getElementById('btnClear') as HTMLButtonElement;

// Se define la escala en la capa superior y se inyecta en cascada
const PIXELS_TO_METERS = 0.01; 

const calculator = new BiotSavartCalculator();
const renderer = new CanvasRenderer(simCanvas, overlayCanvas, PIXELS_TO_METERS);
const stateAdapter = new UIStateAdapter();
const inputAdapter = new CanvasInputAdapter(simCanvas, PIXELS_TO_METERS); 
const probeAdapter = new ProbeUIAdapter();

new SimulationController(
    calculator, 
    renderer, 
    stateAdapter, 
    inputAdapter, 
    probeAdapter,
    simCanvas.width, 
    simCanvas.height,
    PIXELS_TO_METERS
);

btnClear.addEventListener('click', () => {
    renderer.clear();
    inputAdapter.clearState();
    probeAdapter.displayFieldValue(0);
});