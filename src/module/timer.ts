import { log } from './log.js';

export namespace timer {

    var startTime: number;
    const markers: Record<string, number> = {};

    /**
     * Starts the timer.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function start() {
        startTime = Date.now();
        log.debug(`timer started at ${new Date(startTime).toISOString()}`);
    }

    /**
     * Returns the time since the timer started in milliseconds.
     * @returns Time since start.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function sinceStart(): number {
        return Date.now() - startTime;
    }

    /**
     * Returns the time since a marker was set. Will return the time since start if the marker isn't present.
     * @param {string} marker Marker name.
     * @returns The time since marker.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function sinceMarker(marker: string): number {
        return Date.now() - (markers[marker] ?? startTime);
    }

    /**
     * Creates a marker in the timer.
     * @param {string} marker Marker name.
     * @author efekos
     * @version 1.0.0
     * @since 0.0.1-alpha
     */
    export function mark(marker: string): void {
        markers[marker] = Date.now();
        log.debug(`timer mark '${marker}' at ${new Date(markers[marker]).toISOString()}`);
    }

}