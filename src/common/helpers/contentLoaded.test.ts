/**
 * @file Tests for the isContentLoaded utility function
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import { waitForContent, areElementsLoaded } from "./contentLoaded";
import { jsdom } from "jsdom";
should();

describe("On content loaded utility functions", () => {
    describe("areElementsLoaded", () => {
        it("Should return false if any of the elements are not loaded", () => {
            const document: Document = jsdom("");
            const img: HTMLImageElement = document.createElement("img");
            Object.defineProperty(img, "complete", {
                get: () => true
            });
            const video: HTMLVideoElement = document.createElement("video");
            document.documentElement.appendChild(img);
            document.documentElement.appendChild(video);
            areElementsLoaded(document.querySelectorAll("img, video") as NodeListOf<HTMLImageElement | HTMLVideoElement>).should.be.false;
        });
        it("Should return true if all elements are loaded", () => {
            const document: Document = jsdom("");
            const img: HTMLImageElement = document.createElement("img");
            Object.defineProperty(img, "complete", {
                get: () => true
            });
            const video: HTMLVideoElement = document.createElement("video");
            Object.defineProperty(video, "readyState", {
                get: () => 3
            });
            document.documentElement.appendChild(img);
            document.documentElement.appendChild(video);
            areElementsLoaded(document.querySelectorAll("img, video") as NodeListOf<HTMLImageElement | HTMLVideoElement>).should.be.true;
        });
        it("Should return true if the input does not have any image or video element", () => {
            const document: Document = jsdom("<div></div>");
            areElementsLoaded(document.querySelectorAll("img, video, div") as NodeListOf<HTMLImageElement | HTMLVideoElement>).should.be.true;
        });
    });
    describe("waitForContent", () => {
        it("Should wait for images to load", async () => {
            const document: Document = jsdom("");
            const img: HTMLImageElement = document.createElement("img");
            const video: HTMLVideoElement = document.createElement("video");
            Object.defineProperty(video, "readyState", {
                get: () => 3
            });
            document.documentElement.appendChild(img);
            document.documentElement.appendChild(video);
            const promise: Promise<void> = waitForContent(document.documentElement);
            Object.defineProperty(img, "complete", {
                get: () => true
            });
            img.onload(undefined);
            await promise;
        });
        it("Should wait for videos to load", async () => {
            const document: Document = jsdom("");
            const img: HTMLImageElement = document.createElement("img");
            const video: HTMLVideoElement = document.createElement("video");
            Object.defineProperty(img, "complete", {
                get: () => true
            });
            document.documentElement.appendChild(img);
            document.documentElement.appendChild(video);
            const promise: Promise<void> = waitForContent(document.documentElement);
            Object.defineProperty(video, "readyState", {
                get: () => 3
            });
            video.onloadeddata(undefined);
            await promise;
        });
    });
});
