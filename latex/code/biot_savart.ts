private readonly MU_0_OVER_4PI = 1e-7;
private readonly SINGULARITY_THRESHOLD = 0.05;

calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null {
    let b: Vector3D = {x: 0, y: 0, z: 0};
    
    for (const segment of wire.segments) {
        const rVec = VectorMath.sub(point, segment.midPoint);
        const rMag = VectorMath.mag(rVec);
        
        if (rMag < this.SINGULARITY_THRESHOLD) return null;
        
        const rUnit = VectorMath.normalize(rVec);
        const crossProduct = VectorMath.cross(segment.deltaL, rUnit);
        const inverseSquareOfDistance = 1 / Math.pow(rMag, 2);
        const integrand = VectorMath.multiplyScalar(
            crossProduct,
            inverseSquareOfDistance
        );
        
        b = VectorMath.add(b, integrand);
    }
    
    b = VectorMath.multiplyScalar(b, this.MU_0_OVER_4PI);
    
    return b;
}