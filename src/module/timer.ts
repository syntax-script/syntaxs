export namespace timer {

    var startTime: number;
    const markers: Record<string, number> = {};

    export function start() {
        startTime = Date.now();
    }

    export function sinceStart(): number {
        return Date.now() - startTime;
    }

    export function sinceMarker(marker: string): number {
        return Date.now() - (markers[marker] ?? startTime);
    }

    export function mark(marker: string): void {
        markers[marker] = Date.now();
    }

}