// src/infrastructure/CanvasRenderer.ts
import { Wire, FieldPoint, Vector3D } from '../domain/entities';
import { IRenderer } from '../domain/ports';

export class CanvasRenderer implements IRenderer {
    private ctxMain: CanvasRenderingContext2D;
    private ctxOverlay: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private pixelsToMeters: number;

    // Se inyecta la escala para revertir la matemática al dibujar
    constructor(canvasMain: HTMLCanvasElement, canvasOverlay: HTMLCanvasElement, pixelsToMeters: number) {
        this.ctxMain = canvasMain.getContext('2d')!;
        this.ctxOverlay = canvasOverlay.getContext('2d')!;
        this.width = canvasMain.width;
        this.height = canvasMain.height;
        this.pixelsToMeters = pixelsToMeters;
    }

    clear(): void {
        this.ctxMain.clearRect(0, 0, this.width, this.height);
        this.ctxOverlay.clearRect(0, 0, this.width, this.height);
    }

    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number): void {
        this.ctxMain.clearRect(0, 0, this.width, this.height);
        this.drawField(fieldData, multiplier);
        this.drawWire(wire);
    }

    renderProbe(position: Vector3D | null): void {
        this.ctxOverlay.clearRect(0, 0, this.width, this.height);
        
        if (position !== null) {
            // Se convierte de metros a píxeles
            const pxX = position.x / this.pixelsToMeters;
            const pxY = position.y / this.pixelsToMeters;

            this.ctxOverlay.strokeStyle = 'rgba(25, 118, 210, 0.8)';
            this.ctxOverlay.lineWidth = 1;
            this.ctxOverlay.beginPath();
            
            this.ctxOverlay.moveTo(pxX - 10, pxY);
            this.ctxOverlay.lineTo(pxX + 10, pxY);
            this.ctxOverlay.moveTo(pxX, pxY - 10);
            this.ctxOverlay.lineTo(pxX, pxY + 10);
            
            this.ctxOverlay.arc(pxX, pxY, 5, 0, Math.PI * 2);
            this.ctxOverlay.stroke();
        }
    }

    private drawWire(wire: Wire): void {
        if (wire.segments.length === 0) return;
        
        this.ctxMain.beginPath();
        // Se divide por la escala para volver a la pantalla
        this.ctxMain.moveTo(wire.segments[0].start.x / this.pixelsToMeters, wire.segments[0].start.y / this.pixelsToMeters);
        for (const seg of wire.segments) {
            this.ctxMain.lineTo(seg.end.x / this.pixelsToMeters, seg.end.y / this.pixelsToMeters);
        }
        this.ctxMain.strokeStyle = '#000';
        this.ctxMain.lineWidth = 3;
        this.ctxMain.stroke();
    }

    private drawField(fieldData: FieldPoint[], multiplier: number): void {
        let maxB = 0;
        for (const data of fieldData) {
            const mag = Math.abs(data.fieldVector.z * multiplier);
            if (mag > maxB) maxB = mag;
        }
        if (maxB === 0) maxB = 1;

        for (const data of fieldData) {
            const mag = data.fieldVector.z * multiplier;
            let intensity = Math.pow(Math.abs(mag) / maxB, 0.4);
            
            if (intensity < 0.05) continue;

            // Se vuelve a píxeles para ubicar los indicadores visuales
            const pxX = data.point.x / this.pixelsToMeters;
            const pxY = data.point.y / this.pixelsToMeters;
            
            this.ctxMain.globalAlpha = intensity;

            if (mag < 0) { 
                this.ctxMain.strokeStyle = '#d32f2f';
                this.ctxMain.lineWidth = 1.5;
                this.ctxMain.beginPath();
                this.ctxMain.moveTo(pxX - 4, pxY - 4); this.ctxMain.lineTo(pxX + 4, pxY + 4);
                this.ctxMain.moveTo(pxX + 4, pxY - 4); this.ctxMain.lineTo(pxX - 4, pxY + 4);
                this.ctxMain.stroke();
            } else { 
                this.ctxMain.fillStyle = '#1976d2';
                this.ctxMain.beginPath();
                this.ctxMain.arc(pxX, pxY, 3, 0, Math.PI * 2);
                this.ctxMain.fill();
            }
        }
        this.ctxMain.globalAlpha = 1.0;
    }
}