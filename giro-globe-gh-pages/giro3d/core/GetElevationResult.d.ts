import type ElevationSample from './ElevationSample';
import type Coordinates from './geographic/Coordinates';
interface GetElevationResult {
    /**
     * The coordinates of the samples.
     */
    coordinates: Coordinates;
    /**
     * The elevation samples.
     */
    samples: ElevationSample[];
}
export default GetElevationResult;
//# sourceMappingURL=GetElevationResult.d.ts.map