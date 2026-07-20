import { Wire, FieldPoint, Vector3D } from '../domain/entities';
import { IRenderer } from '../domain/ports';

export class CanvasRenderer implements IRenderer {
    private ctxMain: CanvasRenderingContext2D;
    private ctxOverlay: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private pixelsToMeters: number;

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

    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number, phase: number): void {
        this.ctxMain.clearRect(0, 0, this.width, this.height);
        this.drawField(fieldData, multiplier);
        this.drawWire(wire, multiplier, phase);
    }

    renderProbe(position: Vector3D | null): void {
        this.ctxOverlay.clearRect(0, 0, this.width, this.height);
        
        if (position !== null) {
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

    private drawWire(wire: Wire, multiplier: number, phase: number): void {
        if (wire.segments.length === 0) return;
        
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(wire.segments[0].start.x / this.pixelsToMeters, wire.segments[0].start.y / this.pixelsToMeters);
        for (const seg of wire.segments) {
            this.ctxMain.lineTo(seg.end.x / this.pixelsToMeters, seg.end.y / this.pixelsToMeters);
        }
        this.ctxMain.strokeStyle = '#000';
        this.ctxMain.lineWidth = 4;
        this.ctxMain.stroke();

        const arrowSpacingPx = 40; 

        let offset = phase % arrowSpacingPx;
        
        if (multiplier < 0) {
            offset = arrowSpacingPx - offset;
        }

        let nextArrowAt = offset;
        let currentDist = 0;

        this.ctxMain.fillStyle = '#fff';
        this.ctxMain.strokeStyle = '#000';
        this.ctxMain.lineWidth = 1;

        for (const seg of wire.segments) {
            const dxPx = seg.deltaL.x / this.pixelsToMeters;
            const dyPx = seg.deltaL.y / this.pixelsToMeters;
            const segmentLengthPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);

            while (currentDist + segmentLengthPx >= nextArrowAt) {
                const overshoot = nextArrowAt - currentDist;
                const ratio = overshoot / segmentLengthPx; 
                
                const px = (seg.start.x / this.pixelsToMeters) + dxPx * ratio;
                const py = (seg.start.y / this.pixelsToMeters) + dyPx * ratio;

                let angle = Math.atan2(dyPx, dxPx);
                if (multiplier < 0) angle += Math.PI;

                const arrowSize = 6;
                this.ctxMain.beginPath();
                this.ctxMain.moveTo(px + arrowSize * Math.cos(angle), py + arrowSize * Math.sin(angle));
                this.ctxMain.lineTo(px + arrowSize * Math.cos(angle + 2.443), py + arrowSize * Math.sin(angle + 2.443));
                this.ctxMain.lineTo(px + arrowSize * Math.cos(angle - 2.443), py + arrowSize * Math.sin(angle - 2.443));
                this.ctxMain.closePath();
                
                this.ctxMain.fill();
                this.ctxMain.stroke();

                nextArrowAt += arrowSpacingPx;
            }
            currentDist += segmentLengthPx;
        }
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
            let intensity = Math.pow(Math.abs(mag) / maxB, 0.3);
            
            if (intensity < 0.2) continue;

            const pxX = data.point.x / this.pixelsToMeters;
            const pxY = data.point.y / this.pixelsToMeters;
            
            this.ctxMain.globalAlpha = intensity;

            if (mag < 0) {
                this.ctxMain.fillStyle = '#1976d2';
                this.ctxMain.beginPath();
                this.ctxMain.arc(pxX, pxY, 3, 0, Math.PI * 2);
                this.ctxMain.fill();
            } else {
                this.ctxMain.strokeStyle = '#d32f2f';
                this.ctxMain.lineWidth = 1.5;
                this.ctxMain.beginPath();
                this.ctxMain.moveTo(pxX - 4, pxY - 4); this.ctxMain.lineTo(pxX + 4, pxY + 4);
                this.ctxMain.moveTo(pxX + 4, pxY - 4); this.ctxMain.lineTo(pxX - 4, pxY + 4);
                this.ctxMain.stroke();
            }
        }
        this.ctxMain.globalAlpha = 1.0;
    }
}