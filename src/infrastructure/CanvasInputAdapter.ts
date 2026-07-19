// src/infrastructure/CanvasInputAdapter.ts
import { Wire, Vector3D, Segment } from '../domain/entities';
import { IWireInputHandler } from '../domain/ports';

export class CanvasInputAdapter implements IWireInputHandler {
    private isDrawing = false;
    private rawPoints: Vector3D[] = [];
    private canvas: HTMLCanvasElement;

    private drawingCallback: ((wire: Wire) => void) | null = null;
    private completeCallback: ((wire: Wire) => void) | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.bindEvents();
    }

    onWireDrawing(callback: (wire: Wire) => void): void {
        this.drawingCallback = callback;
    }

    onWireComplete(callback: (wire: Wire) => void): void {
        this.completeCallback = callback;
    }

    clearState(): void {
        this.rawPoints = [];
        this.isDrawing = false;
    }

    private bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.rawPoints = [{ x: e.offsetX, y: e.offsetY, z: 0 }];
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;
            this.rawPoints.push({ x: e.offsetX, y: e.offsetY, z: 0 });
            if (this.drawingCallback) {
                this.drawingCallback(this.buildWire());
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            
            // Optimización de trazo: evitar segmentos ultra cortos
            const optimizedPoints: Vector3D[] = [];
            if(this.rawPoints.length > 0) optimizedPoints.push(this.rawPoints[0]);
            
            for(let i = 1; i < this.rawPoints.length; i++){
                const last = optimizedPoints[optimizedPoints.length - 1];
                const current = this.rawPoints[i];
                const dx = current.x - last.x;
                const dy = current.y - last.y;
                if(Math.sqrt(dx*dx + dy*dy) > 5){
                    optimizedPoints.push(current);
                }
            }

            if (this.completeCallback && optimizedPoints.length > 1) {
                this.completeCallback(this.buildWireFromPoints(optimizedPoints));
            }
        });
    }

    private buildWire(): Wire {
        return this.buildWireFromPoints(this.rawPoints);
    }

    private buildWireFromPoints(points: Vector3D[]): Wire {
        const segments: Segment[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i+1];
            segments.push({
                start,
                end,
                deltaL: { x: end.x - start.x, y: end.y - start.y, z: 0 },
                midPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, z: 0 }
            });
        }
        return { segments };
    }
}