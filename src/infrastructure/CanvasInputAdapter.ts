// src/infrastructure/CanvasInputAdapter.ts
import { Wire, Vector3D, Segment } from '../domain/entities';
import { IWireInputHandler } from '../domain/ports';

export class CanvasInputAdapter implements IWireInputHandler {
    private isDrawing = false;
    private rawPointsMeters: Vector3D[] = []; // Ahora almacena estado en metros
    private canvas: HTMLCanvasElement;
    private pixelsToMeters: number;

    private drawingCallback: ((wire: Wire) => void) | null = null;
    private completeCallback: ((wire: Wire) => void) | null = null;
    private probeMoveCallback: ((pos: Vector3D | null) => void) | null = null;

    // Se inyecta la escala
    constructor(canvas: HTMLCanvasElement, pixelsToMeters: number) {
        this.canvas = canvas;
        this.pixelsToMeters = pixelsToMeters;
        this.bindEvents();
    }

    onWireDrawing(callback: (wire: Wire) => void): void { this.drawingCallback = callback; }
    onWireComplete(callback: (wire: Wire) => void): void { this.completeCallback = callback; }
    onProbeMove(callback: (pos: Vector3D | null) => void): void { this.probeMoveCallback = callback; }

    clearState(): void {
        this.rawPointsMeters = [];
        this.isDrawing = false;
    }

    private bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.rawPointsMeters = [{ 
                x: e.offsetX * this.pixelsToMeters, 
                y: e.offsetY * this.pixelsToMeters, 
                z: 0 
            }];
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const currentPosMeters = { 
                x: e.offsetX * this.pixelsToMeters, 
                y: e.offsetY * this.pixelsToMeters, 
                z: 0 
            };
            
            if (!this.isDrawing && this.probeMoveCallback) {
                this.probeMoveCallback(currentPosMeters);
                return;
            }

            if (this.isDrawing) {
                this.rawPointsMeters.push(currentPosMeters);
                if (this.drawingCallback) this.drawingCallback(this.buildWire());
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            if (!this.isDrawing && this.probeMoveCallback) this.probeMoveCallback(null);
        });

        this.canvas.addEventListener('mouseup', () => {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            
            const optimizedPoints: Vector3D[] = [];
            if(this.rawPointsMeters.length > 0) optimizedPoints.push(this.rawPointsMeters[0]);
            
            // Tolerancia de optimización convertida a metros (5px)
            const toleranceMeters = 5 * this.pixelsToMeters;

            for(let i = 1; i < this.rawPointsMeters.length; i++){
                const last = optimizedPoints[optimizedPoints.length - 1];
                const current = this.rawPointsMeters[i];
                const dx = current.x - last.x;
                const dy = current.y - last.y;
                if(Math.sqrt(dx*dx + dy*dy) > toleranceMeters){
                    optimizedPoints.push(current);
                }
            }

            if (this.completeCallback && optimizedPoints.length > 1) {
                this.completeCallback(this.buildWireFromPoints(optimizedPoints));
            }
        });
    }

    private buildWire(): Wire { return this.buildWireFromPoints(this.rawPointsMeters); }

    private buildWireFromPoints(points: Vector3D[]): Wire {
        const segments: Segment[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i+1];
            segments.push({
                start, end,
                deltaL: { x: end.x - start.x, y: end.y - start.y, z: 0 },
                midPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, z: 0 }
            });
        }
        return { segments };
    }
}