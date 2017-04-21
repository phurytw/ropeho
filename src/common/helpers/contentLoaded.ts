/**
 * @file Checks if page, images and videos are loaded
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/**
 * Waits for document to be ready, images to be loaded and videos to be ready to play
 * @param {Element} element scan elements only under this element
 * @returns {Promise<void>} resolves when all elements are done loading
 */
export const waitForContent: (element?: Element) => Promise<void> =
    (element: Element = document.documentElement): Promise<void> => new Promise<void>((resolve: () => void) => {
        const elements: NodeListOf<HTMLImageElement | HTMLVideoElement> = element.querySelectorAll("img, video") as NodeListOf<HTMLImageElement | HTMLVideoElement>;
        const onReady: () => void = (): void => {
            if (document.readyState === "complete" && areElementsLoaded(elements)) {
                resolve();
            }
        };
        if (document.readyState !== "complete") {
            document.onreadystatechange = () => onReady();
        }
        const count: number = elements.length;
        for (let i: number = 0; i < count; i++) {
            const element: HTMLImageElement | HTMLVideoElement = elements.item(i);
            if (element.tagName === "IMG") {
                const img: HTMLImageElement = element as HTMLImageElement;
                if (img.complete) {
                    onReady();
                } else {
                    img.onload = () => onReady();
                    img.onerror = () => onReady();
                }
            } else if (element.tagName === "VIDEO") {
                const video: HTMLVideoElement = element as HTMLVideoElement;
                if (video.readyState >= 3) {
                    onReady();
                } else {
                    video.onloadeddata = () => {
                        onReady();
                    };
                    video.onerror = () => onReady();
                }
            }
        }
        onReady();
    });

/**
 * Checks if element is loaded and ready to play
 * @param {NodeListOf<HTMLImageElement|HTMLVideoElement>} elements Elements to check
 * @returns {boolean} true if all image and video elements are loaded and ready
 */
export const areElementsLoaded: (elements: NodeListOf<HTMLImageElement | HTMLVideoElement>) => boolean = (elements: NodeListOf<HTMLImageElement | HTMLVideoElement>): boolean => {
    let isLoaded: boolean = true;
    const count: number = elements.length;
    for (let i: number = 0; i < count; i++) {
        const element: HTMLImageElement | HTMLVideoElement = elements.item(i);
        if (element.tagName === "IMG") {
            isLoaded = (element as HTMLImageElement).complete;
        } else if (element.tagName === "VIDEO") {
            isLoaded = (element as HTMLVideoElement).readyState >= 3;
        }
        if (!isLoaded) {
            break;
        }
    }
    return isLoaded;
};
