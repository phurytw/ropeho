/**
 * @file Utility functions that get medias dimensions
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { MediaTypes } from "../../enum";
import { isArray } from "lodash";

import Media = Ropeho.Models.Media;

export type Dimensions = { width?: number; height?: number };

/**
 * Loads and image and gets its dimensions
 * @param {string} src src attribute value
 * @returns {Promise<Dimensions>} a promise that fulfills with the image dimensions
 */
export const getImageDimensions: (src: string) => Promise<Dimensions> =
    (src: string): Promise<Dimensions> => new Promise<Dimensions>((resolve: (value?: Dimensions | PromiseLike<Dimensions>) => void) => {
        const img: HTMLImageElement = document.createElement("img");
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = () => resolve({});
        img.src = src;
    });

/**
 * Gets dimensions of a video
 * @param {string} src src attribute value
 * @returns {Promise<Dimensions>} a promise that fulfills with the video dimensions
 */
export const getVideoDimensions: (src: string) => Promise<Dimensions> =
    (src: string): Promise<Dimensions> => new Promise<Dimensions>((resolve: (value?: Dimensions | PromiseLike<Dimensions>) => void) => {
        const video: HTMLVideoElement = document.createElement("video");
        video.addEventListener("loadedmetadata", () => {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight
            });
        });
        video.onerror = () => resolve({});
        video.preload = "metadata";
        video.src = src;
    });

/**
 * Gets the smallest dimensions possible out of one or multiple medias
 * @param {Media} media a {Media} or an array of {Media}
 * @returns {Promise<Dimensions>} a promise that fulfills with the video dimensions
 */
export const getMediaDimensions: (media: Media | Media[]) => Promise<Dimensions> =
    (media: Media | Media[]): Promise<Dimensions> => new Promise<Dimensions>(async (resolve: (value?: Dimensions | PromiseLike<Dimensions>) => void) => {
        if (isArray<Media>(media)) {
            let promises: Promise<Dimensions>[] = [];
            for (const m of media) {
                promises = [...promises, getMediaDimensions(m)];
            }
            const dimensions: Dimensions[] = await Promise.all(promises);
            resolve({
                width: Math.min(...dimensions.map<number>((d: Dimensions) => d.width)),
                height: Math.min(...dimensions.map<number>((d: Dimensions) => d.height))
            });
        } else {
            switch (media.type) {
                case MediaTypes.Image:
                    resolve(await getImageDimensions(media.sources[0].preview));
                    break;
                case MediaTypes.Slideshow:
                    let dimensions: Dimensions[] = [];
                    for (const source of media.sources) {
                        dimensions = [...dimensions, await getImageDimensions(source.preview)];
                    }
                    resolve({
                        width: Math.min(...dimensions.map<number>((d: Dimensions) => d.width)),
                        height: Math.min(...dimensions.map<number>((d: Dimensions) => d.height))
                    });
                    break;
                case MediaTypes.Video:
                    resolve(await getVideoDimensions(media.sources[0].preview));
                    break;
                default:
                    resolve({});
                    break;
            }
        }
    });
