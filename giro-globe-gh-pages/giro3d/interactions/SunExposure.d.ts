import type { BufferAttribute } from 'three';
import { Box3, EventDispatcher, Sphere, type Object3D } from 'three';
import type Disposable from '../core/Disposable';
import type Instance from '../core/Instance';
import type Progress from '../core/Progress';
import type Entity3D from '../entities/Entity3D';
import ColorMap from '../core/ColorMap';
import Extent from '../core/geographic/Extent';
import PointCloud from '../entities/PointCloud';
/**
 * The names of the computed variables.
 * - `meanIrradiance` (in Watts/square meter) is the mean irradiance received by the surface over the
 *   time period.
 * - `irradiation` (in Watt-hours/square meter) is the cumulated energy received by the surface over
 *   the time period
 * - `hoursOfSunlight` is the total number of hours that the surface was exposed to direct sunlight.
 */
export type VariableName = 'meanIrradiance' | 'irradiation' | 'hoursOfSunlight';
/**
 * The solar constant, in Watts / m².
 * Taken from https://en.wikipedia.org/wiki/Solar_constant
 */
export declare const SOLAR_CONSTANT = 1361;
/**
 * The amount of solar energy that is absorbed by the atmosphere.
 * 25% is typical for a clear sky.
 */
export declare const ATMOSPHERIC_ABSORPTION = 0.25;
/**
 * The result of the computation.
 */
export interface ComputationResult {
    /**
     * The generated point cloud. This is the same entity
     * as seen in the preview during computation. This point
     * cloud contains one attribute per solar variable.
     */
    entity: PointCloud;
    /**
     * The computed variables. Note that those variables are already
     * set up in the {@link entity}. However if for some reason you
     * want to use them for other purposes, you can access them directly here.
     */
    variables: Record<VariableName, SolarVariable>;
}
/**
 * Describes a single measured value for all probes.
 */
export interface SolarVariable {
    /** The variable values for all probes. Can directly be used
     * as a buffer attribute for a geometry.
     */
    buffer: BufferAttribute;
    /** The average value of the variable across all probes */
    mean: number;
    /** The minimum value of the variable across all probes */
    min: number;
    /** The maximum value of the variable across all probes */
    max: number;
}
export interface SunExposureOptions {
    /**
     * The Giro3D instance to use. This must be the same instance
     * as the one that will host the resulting point cloud.
     */
    instance: Instance;
    /**
     * The objects to include in the computation.
     */
    objects: Array<Entity3D | Object3D>;
    /**
     * The area of interest to limit the simulation.
     * The smaller the area of interest, the faster the simulation will be.
     */
    limits: Extent | Box3 | Sphere;
    /**
     * The date at the start of the simulation time range.
     */
    start: Date;
    /**
     * The date at the end of the simulation time range.
     * If unspecified, then the time range will be [start, start]
     * and only one simulation step will be performed.
     */
    end?: Date;
    /**
     * The color map to use on the point cloud preview to display irradiation.
     * Note that once the computation is finished, you
     * can modify the colormaps on the resulting point cloud.
     * @defaultValue a rainbow colormap
     */
    colorMap?: ColorMap;
    /**
     * The spatial resolution, in scene units. This is the
     * average space between simulation probes. If unspecified,
     * a default value is computed from the dimensions of {@link limits}.
     */
    spatialResolution?: number;
    /**
     * If true, show helpers to help visualize the computation steps.
     * Helpers will remain visible until the dispose() method is called.
     * @defaultValue false
     */
    showHelpers?: boolean;
    /**
     * The temporal resolution, in seconds. This is the interval
     * between simulation steps. If {@link end} was not set,
     * then this parameter has no effect.
     * @defaultValue 3600
     */
    temporalResolution?: number;
}
export interface SunExposureEventMap {
    /** Raised when the simulation progress changes */
    progress: {
        progress: number;
    };
}
/**
 * Simulates sun exposure on meshes and produces various sun-related measures (see {@link VariableName}).
 *
 * The output is a point cloud that covers the area of interest.
 * Each point represents a _sun probe_ that samples sun exposure at this location.
 *
 * Computation can occurs on a single point in time or within a time range. In that case,
 * the time range is discretized into snapshots that are one `temporalResolution` apart.
 *
 * ### Irradiance and irradiation
 *
 * Irradiance (in Watts / square meter) represents the amount of solar power that reaches a surface at a given time.
 *
 * We first compute the cosine between the probe's normal and the sun direction. If the cosine
 * is zero or less, it means the surface is not exposed to sunlight at all. It thus receives
 * zero watts of solar power.
 *
 * If the cosine is greater than zero, it is used to compute the solar power with a simple formula:
 *
 *      irradiance = cos(angle) * SolarConstant * AtmosphereAbsorption
 *
 * where SolarConstant is the {@link SOLAR_CONSTANT} and AtmosphereAbsorption is the {@link
 * ATMOSPHERIC_ABSORPTION} constant.
 *
 * Thus, at noon UTC during summer solstice and at the northern tropic (23.43° N, 0° E),
 * the irradiance of an horizontal surface will be at its maximum value, which is
 * (SolarConstant * AtmosphereAbsorption), since the cosine of the angle will be 1.
 *
 * Irradiation (in Watt-hours / square meter) is then computed as the integral of the
 * irradiance over the time period (in hours).
 *
 * ### Hours of sunlight
 *
 * This variable is computed by counting the number of time increments that a given probe
 * receives sunlight (i.e is not in the shadow of another object). Those increments do not
 * need to be consecutive. Thus, if a probe receives 0.5 hours of sunlight in the morning,
 * then is in the shade until 16:00, then receives another 2 hours of sunlight in the afternoon,
 * then is occluded by shadow again, then receives 1.5 hours until sunset, its hours of sunlight
 * will be 4 hours (0.5 + 2 + 1.5).
 *
 * ### Remarks and caveats
 *
 * - Be careful when passing `Date` parameters. By default, dates are using the local
 *   time zone. It is advised to pass UTC dates to avoid ambiguity.
 *
 * - Only mesh-like objects (3D models, maps, 3D tiles, etc) are supported.
 *   Point clouds are not supported, as they don't expose surfaces and normals required
 *   for solar exposure computation.
 *
 * - You must include "ground" like meshes so that other meshes (like buildings) are properly
 *   shaded (especially in morning/evening periods) when the sun is low. A simple flat plane
 *   is enough if you don't have anything else. Otherwise you can use a Map with terrain.
 *
 * - Be _very_ careful with the `spatialResolution` parameter. It must be reasonable
 *   and consistent with the dimensions of the area of interest. For example, if the area
 *   of interest is 1000m long, and the spatial resolution is 0.1, then this will create
 *   millions of sun probes, making computation much longer than expected, and using a lot
 *   of memory. It is recommended to start with a high value and then reduce it afterwards.
 */
export declare class SunExposure extends EventDispatcher<SunExposureEventMap> implements Progress, Disposable {
    private readonly _opCounter;
    private readonly _start;
    private readonly _end;
    private readonly _temporalResolution;
    private readonly _limits;
    private readonly _instance;
    private readonly _root;
    private readonly _showHelpers;
    private readonly _objects;
    private readonly _spatialResolution;
    private readonly _colorMap;
    private readonly _toDispose;
    get loading(): boolean;
    get progress(): number;
    constructor(params: SunExposureOptions);
    private createShadowMapCamera;
    private createDepthMapHelper;
    private processStep;
    private computeTightBounds;
    private createBoundsHelper;
    private createOutputPointCloud;
    private computeVariableStatistics;
    private runSimulationStep;
    /**
     * Starts the computation.
     */
    compute(options?: {
        /** An optional signal to abort the computation */
        signal?: AbortSignal;
    }): Promise<ComputationResult>;
    dispose(): void;
}
export default SunExposure;
//# sourceMappingURL=SunExposure.d.ts.map