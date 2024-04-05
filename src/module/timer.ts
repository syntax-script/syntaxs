export namespace timer {

    var startTime: number;
    const markers: Record<string, number> = {};

    /**
     * Starts the timer.
     */
    export function start() {
        startTime = Date.now();
    }

    /**
     * Returns the time since the timer started in milliseconds.
     * @returns Time since start.
     */
    export function sinceStart(): number {
        return Date.now() - startTime;
    }

    /**
     * Returns the time since a marker was set. Will return the time since start if the marker isn't present.
     * @param marker Marker name.
     * @returns The time since marker.
     */
    export function sinceMarker(marker: string): number {
        return Date.now() - (markers[marker] ?? startTime);
    }

    /**
     * Creates a marker in the timer.
     * @param marker Marker name.
     */
    export function mark(marker: string): void {
        markers[marker] = Date.now();
    }

}