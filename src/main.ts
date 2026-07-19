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
        private width: number,
        private height: number
    ) {
        this.generateGrid();
        this.setupWiring();
    }

    private generateGrid() {
        const spacing = 20;
        for (let x = spacing / 2; x < this.width; x += spacing) {
            for (let y = spacing / 2; y < this.height; y += spacing) {
                this.gridPoints.push({ x, y, z: 0 });
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
                // Se lee la corriente actual real en Amperes desde el slider
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
        // Se envía la corriente real (I) al renderizador
        const currentI = this.stateProvider.getCurrentMultiplier(); 
        this.renderer.renderSimulation(this.currentWire, this.currentBaseField, currentI);
    }
}

const simCanvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const overlayCanvas = document.getElementById('overlayCanvas') as HTMLCanvasElement;
const btnClear = document.getElementById('btnClear') as HTMLButtonElement;

const calculator = new BiotSavartCalculator();
const renderer = new CanvasRenderer(simCanvas, overlayCanvas);
const stateAdapter = new UIStateAdapter();
const inputAdapter = new CanvasInputAdapter(simCanvas); 
const probeAdapter = new ProbeUIAdapter();

new SimulationController(
    calculator, 
    renderer, 
    stateAdapter, 
    inputAdapter, 
    probeAdapter,
    simCanvas.width, 
    simCanvas.height
);

btnClear.addEventListener('click', () => {
    renderer.clear();
    inputAdapter.clearState();
    probeAdapter.displayFieldValue(0);
});