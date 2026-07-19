// src/infrastructure/CanvasRenderer.ts
import { Wire, FieldPoint } from '../domain/entities';
import { IRenderer } from '../domain/ports';

export class CanvasRenderer implements IRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number): void {
        this.drawField(fieldData, multiplier);
        this.drawWire(wire);
    }

    private drawWire(wire: Wire): void {
        if (wire.segments.length === 0) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(wire.segments[0].start.x, wire.segments[0].start.y);
        for (const seg of wire.segments) {
            this.ctx.lineTo(seg.end.x, seg.end.y);
        }
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
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
            this.ctx.globalAlpha = intensity;

            if (mag < 0) { 
                this.ctx.strokeStyle = '#d32f2f';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(x - 4, y - 4); this.ctx.lineTo(x + 4, y + 4);
                this.ctx.moveTo(x + 4, y - 4); this.ctx.lineTo(x - 4, y + 4);
                this.ctx.stroke();
            } else { 
                this.ctx.fillStyle = '#1976d2';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
}