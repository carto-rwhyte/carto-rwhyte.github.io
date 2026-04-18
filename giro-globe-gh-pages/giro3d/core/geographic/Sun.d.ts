import { Vector3 } from 'three';
import Coordinates from './Coordinates';
/**
 * Gets the position of the sun in [**equatorial coordinates**](https://en.wikipedia.org/wiki/Position_of_the_Sun#Equatorial_coordinates)
 * at the given date.
 *
 * Note: the geographic position of the sun is the location on earth where the sun is at the zenith.
 * @param date - The date to compute the geographic position. If unspecified, the current date is used.
 * @returns The geographic position of the sun at the given date.
 */
export declare function getGeographicPosition(date?: Date, target?: Coordinates): Coordinates;
/**
 * Returns the local position of the sun, given the zenith and azimuth.
 */
export declare function getLocalPosition(params: {
    /**
     * The zenith of the sun, in degrees, in horizontal coordinates.
     *
     * Note: the value is clamped to the [0°, 90°] range.
     */
    zenith: number;
    /**
     * The azimuth of the sun, in degrees, in horizontal coordinates
     */
    azimuth: number;
    /**
     * The local point.
     * @defaultValue (0, 0, 0)
     */
    point?: Vector3;
    /**
     * The distance of the sun to the local point.
     * @defaultValue 1
     */
    distance?: number;
}, target?: Vector3): Vector3;
/**
 * Gets the direction vector of sun rays at a given date, in the ECEF coordinate system.
 */
export declare function getDirection(date?: Date): Vector3;
/**
 * Gets the direction vector of sun rays at a given date in the ENU
 * coordinate system centered at the observer location.
 * Note: this assumes that the target coordinate system is north up.
 */
export declare function getLocalFrameDirection(observer: Coordinates, date?: Date): Vector3;
/**
 * Utility functions related to the position of the sun.
 */
declare const _default: {
    getGeographicPosition: typeof getGeographicPosition;
    getLocalPosition: typeof getLocalPosition;
    getLocalFrameDirection: typeof getLocalFrameDirection;
    getDirection: typeof getDirection;
};
export default _default;
//# sourceMappingURL=Sun.d.ts.map