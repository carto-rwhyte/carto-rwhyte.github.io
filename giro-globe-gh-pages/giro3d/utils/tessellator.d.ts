/**
 * Triangulate (or tessellate) the given polygon. Triangulation will work in any plane, contrary
 * to the naive Earcut implementation that does not work if all vertices are located on a vertical plane
 * (since the algorithm works on the XY coordinates).
 * @param forceFlat - If true, then the algorithm considers that the polygon is flat on the
 * horizontal plane and does not try to correct orientation of faces.
 */
export declare function triangulate(flatCoordinates: ArrayLike<number>, holeIndices?: ArrayLike<number>, forceFlat?: boolean): number[];
//# sourceMappingURL=tessellator.d.ts.map