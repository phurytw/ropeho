/**
 * Based on https://gist.github.com/joelambert/1002116
 * @file setInterval and setTimeout using requestAnimationFrame
 * @author Joe Lambert <https://github.com/joelambert>, François Nguyen <https://github.com/lith-light-g>
 */

type CancelAnimationFrame = (handle: number) => void;
type RequestAnimationFrame = (callback: FrameRequestCallback) => number;
type RAFSetTimer = (callback: Function, interval: number) => number;
interface Window {
    mozRequestAnimationFrame: RequestAnimationFrame;
    mozCancelRequestAnimationFrame: any;
    oRequestAnimationFrame: RequestAnimationFrame;
    msRequestAnimationFrame: RequestAnimationFrame;
    webkitCancelRequestAnimationFrame: CancelAnimationFrame;
    oCancelRequestAnimationFrame: CancelAnimationFrame;
    msCancelRequestAnimationFrame: CancelAnimationFrame;
    requestInterval: RAFSetTimer;
    requestTimeout: RAFSetTimer;
    clearRequestInterval: (timer: number) => void;
    clearRequestTimeout: (timer: number) => void;
}

const intervals: {
    [key: string]: number;
} = {};
const timeouts: {
    [key: string]: number;
} = {};
const defaultRequestAnimationFrame: RequestAnimationFrame = (callback: FrameRequestCallback): number => window.setTimeout(callback, 1000 / 60);
const requestAnimFrame: RequestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    defaultRequestAnimationFrame;
const cancelAnimFrameInterval: (handle: number) => void = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearInterval;
const cancelAnimFrameTimeout: (handle: number) => void = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout;

/**
 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
 * @param {Function} fn The callback function
 * @param {number} delay The delay in milliseconds
 */
window.requestInterval = (fn: Function, delay: number): number => {
    if (!window.requestAnimationFrame &&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame &&
        !window.msRequestAnimationFrame) {
        return window.setInterval(fn, delay);
    }

    let start: number = new Date().getTime();
    const loop: () => void = (): void => {
        const current: number = new Date().getTime(),
            delta: number = current - start;
        if (delta >= delay) {
            fn();
            start = new Date().getTime();
        }
        if (intervals[timer]) {
            intervals[timer] = requestAnimFrame(loop);
        }
    };

    const timer: number = requestAnimFrame(loop);
    intervals[timer] = timer;
    return timer;
};

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {Function} fn The callback function
 * @param {number} delay The delay in milliseconds
 */
window.requestTimeout = (fn: Function, delay: number): number => {
    if (!window.requestAnimationFrame &&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame &&
        !window.msRequestAnimationFrame) {
        return window.setTimeout(fn, delay);
    }

    const start: number = new Date().getTime();
    const loop: () => void = (): void => {
        const current: number = new Date().getTime(),
            delta: number = current - start;
        if (timeouts[timer]) {
            delta >= delay ? fn() : timeouts[timer] = requestAnimFrame(loop);
        }
    };

    const timer: number = requestAnimFrame(loop);
    timeouts[timer] = timer;
    return timer;
};

/**
 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {number} timer Timer to clear
 */
window.clearRequestInterval = (timer: number): void => {
    delete intervals[timer];
    cancelAnimFrameInterval(timer);
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {number} timer Timer to clear
 */
window.clearRequestTimeout = (timer: number): void => {
    delete timeouts[timer];
    cancelAnimFrameTimeout(timer);
};
