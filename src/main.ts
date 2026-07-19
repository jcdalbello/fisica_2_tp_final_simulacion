// src/main.ts
import { BiotSavartCalculator } from './application/BiotSavartCalculator';
import { CanvasRenderer } from './infrastructure/CanvasRenderer';
import { UIStateAdapter } from './infrastructure/UIStateAdapter';
import { CanvasInputAdapter } from './infrastructure/CanvasInputAdapter';
import { Wire, Vector3D, FieldPoint } from './domain/entities';
import { IBiotSavartSolver, IRenderer, ISimulationState, IWireInputHandler } from './domain/ports';

class SimulationController {
    private gridPoints: Vector3D[] = [];
    private currentWire: Wire = { segments: [] };
    private currentBaseField: FieldPoint[] = [];

    constructor(
        private solver: IBiotSavartSolver,
        private renderer: IRenderer,
        private stateProvider: ISimulationState,
        private inputHandler: IWireInputHandler,
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
            this.renderer.renderSimulation(wire, [], 0); 
        });

        this.inputHandler.onWireComplete((wire: Wire) => {
            this.currentWire = wire;
            this.calculateBaseField();
            this.renderFinal();
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
        const multiplier = this.stateProvider.getCurrentMultiplier(); 
        const visualMultiplier = 100 * multiplier;
        this.renderer.renderSimulation(this.currentWire, this.currentBaseField, visualMultiplier);
    }
}

const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const btnClear = document.getElementById('btnClear') as HTMLButtonElement;

const calculator = new BiotSavartCalculator();
const renderer = new CanvasRenderer(canvas);
const stateAdapter = new UIStateAdapter();
const inputAdapter = new CanvasInputAdapter(canvas);

new SimulationController(
    calculator, 
    renderer, 
    stateAdapter, 
    inputAdapter, 
    canvas.width, 
    canvas.height
);

btnClear.addEventListener('click', () => {
    renderer.clear();
    inputAdapter.clearState();
});