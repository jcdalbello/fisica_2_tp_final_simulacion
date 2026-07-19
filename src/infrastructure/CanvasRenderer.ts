// src/infrastructure/CanvasRenderer.ts
import { Wire, FieldPoint, Vector3D } from '../domain/entities';
import { IRenderer } from '../domain/ports';

export class CanvasRenderer implements IRenderer {
    private ctxMain: CanvasRenderingContext2D;
    private ctxOverlay: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvasMain: HTMLCanvasElement, canvasOverlay: HTMLCanvasElement) {
        this.ctxMain = canvasMain.getContext('2d')!;
        this.ctxOverlay = canvasOverlay.getContext('2d')!;
        this.width = canvasMain.width;
        this.height = canvasMain.height;
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

    // Nuevo método: Dibuja y borra solo en el canvas transparente superior
    renderProbe(position: Vector3D | null): void {
        this.ctxOverlay.clearRect(0, 0, this.width, this.height);
        
        if (position !== null) {
            this.ctxOverlay.strokeStyle = 'rgba(25, 118, 210, 0.8)';
            this.ctxOverlay.lineWidth = 1;
            this.ctxOverlay.beginPath();
            
            // Dibuja un crosshair indicativo
            this.ctxOverlay.moveTo(position.x - 10, position.y);
            this.ctxOverlay.lineTo(position.x + 10, position.y);
            this.ctxOverlay.moveTo(position.x, position.y - 10);
            this.ctxOverlay.lineTo(position.x, position.y + 10);
            
            this.ctxOverlay.arc(position.x, position.y, 5, 0, Math.PI * 2);
            this.ctxOverlay.stroke();
        }
    }

    private drawWire(wire: Wire): void {
        if (wire.segments.length === 0) return;
        
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(wire.segments[0].start.x, wire.segments[0].start.y);
        for (const seg of wire.segments) {
            this.ctxMain.lineTo(seg.end.x, seg.end.y);
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

            const x = data.point.x;
            const y = data.point.y;
            this.ctxMain.globalAlpha = intensity;

            if (mag < 0) { 
                this.ctxMain.strokeStyle = '#d32f2f';
                this.ctxMain.lineWidth = 1.5;
                this.ctxMain.beginPath();
                this.ctxMain.moveTo(x - 4, y - 4); this.ctxMain.lineTo(x + 4, y + 4);
                this.ctxMain.moveTo(x + 4, y - 4); this.ctxMain.lineTo(x - 4, y + 4);
                this.ctxMain.stroke();
            } else { 
                this.ctxMain.fillStyle = '#1976d2';
                this.ctxMain.beginPath();
                this.ctxMain.arc(x, y, 3, 0, Math.PI * 2);
                this.ctxMain.fill();
            }
        }
        this.ctxMain.globalAlpha = 1.0;
    }
}