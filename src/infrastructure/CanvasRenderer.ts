// src/infrastructure/CanvasRenderer.ts
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

    renderSimulation(wire: Wire, fieldData: FieldPoint[], multiplier: number): void {
        this.ctxMain.clearRect(0, 0, this.width, this.height);
        this.drawField(fieldData, multiplier);
        
        // Ahora pasamos el multiplicador para saber el sentido de la corriente
        this.drawWire(wire, multiplier);
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

    private drawWire(wire: Wire, multiplier: number): void {
        if (wire.segments.length === 0) return;
        
        // 1. Dibujar el cable principal
        this.ctxMain.beginPath();
        this.ctxMain.moveTo(wire.segments[0].start.x / this.pixelsToMeters, wire.segments[0].start.y / this.pixelsToMeters);
        for (const seg of wire.segments) {
            this.ctxMain.lineTo(seg.end.x / this.pixelsToMeters, seg.end.y / this.pixelsToMeters);
        }
        this.ctxMain.strokeStyle = '#000';
        this.ctxMain.lineWidth = 4; // Un poco más grueso para que las flechas se vean mejor
        this.ctxMain.stroke();

        // 2. Dibujar flechas de dirección de corriente
        const arrowSpacingPx = 40; // Distancia entre flechas
        let accumulatedLengthPx = arrowSpacingPx / 2; // Empezamos a la mitad para que la primera no quede pegada al inicio

        this.ctxMain.fillStyle = '#fff'; // Flechas blancas para que contrasten sobre el cable negro
        this.ctxMain.strokeStyle = '#000';
        this.ctxMain.lineWidth = 1;

        for (const seg of wire.segments) {
            const dxPx = seg.deltaL.x / this.pixelsToMeters;
            const dyPx = seg.deltaL.y / this.pixelsToMeters;
            const segmentLengthPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);

            accumulatedLengthPx += segmentLengthPx;

            if (accumulatedLengthPx >= arrowSpacingPx) {
                const pxMx = seg.midPoint.x / this.pixelsToMeters;
                const pxMy = seg.midPoint.y / this.pixelsToMeters;
                
                // Calculamos el ángulo del segmento
                let angle = Math.atan2(dyPx, dxPx);
                
                // Si la corriente es negativa (invertida), rotamos la flecha 180 grados
                if (multiplier < 0) {
                    angle += Math.PI;
                }

                // Dibujar un triángulo para la cabeza de la flecha
                const arrowSize = 6;
                this.ctxMain.beginPath();
                // Punta de la flecha
                this.ctxMain.moveTo(pxMx + arrowSize * Math.cos(angle), pxMy + arrowSize * Math.sin(angle));
                // Esquina inferior izquierda (140 grados)
                this.ctxMain.lineTo(pxMx + arrowSize * Math.cos(angle + 2.443), pxMy + arrowSize * Math.sin(angle + 2.443));
                // Esquina inferior derecha (-140 grados)
                this.ctxMain.lineTo(pxMx + arrowSize * Math.cos(angle - 2.443), pxMy + arrowSize * Math.sin(angle - 2.443));
                this.ctxMain.closePath();
                
                this.ctxMain.fill();
                this.ctxMain.stroke();

                accumulatedLengthPx = 0; // Reiniciar el contador para la próxima flecha
            }
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