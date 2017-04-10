/**
 * @file Redux selectors to use throughout the application
 * @author François Nguyen
 */
/// <reference path="./typings.d.ts" />
import { RopehoAdminState } from "./reducer";
import { Map, List } from "immutable";

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import UploadEntry = Ropeho.Socket.UploadEntry;

export const getHasRendered: (state: RopehoAdminState) => boolean =
    (state: RopehoAdminState): boolean => state.rendering.get("hasRendered");

export const getCurrentUser: (state: RopehoAdminState) => User =
    (state: RopehoAdminState): User => {
        const user: Map<string, any> = state.session.get("user");
        return user && user.toJS();
    };

export const getError: (state: RopehoAdminState) => Ropeho.IErrorResponse =
    (state: RopehoAdminState): Ropeho.IErrorResponse => {
        const error: Map<string, any> = state.error.get("error");
        return error && error.toJS();
    };

export const getProductions: (state: RopehoAdminState) => Production[] =
    (state: RopehoAdminState): Production[] => {
        const order: List<string> = state.productionIndex.get("order") as List<string>;
        return order.map<any>((id: string) => state.productionIndex.getIn(["productions", id])).toJS();
    };

export const getProduction: (state: RopehoAdminState) => Production =
    (state: RopehoAdminState): Production => {
        const production: Map<string, any> = state.productionEdit.get("production");
        return production && production.toJS();
    };

export const getMedias: (state: RopehoAdminState) => Media[] =
    (state: RopehoAdminState): Media[] => {
        let medias: Media[] = [];
        (state.mediaEdit.get("order") as List<string>).forEach((id: string) => medias = [...medias, state.mediaEdit.getIn(["medias", id]).toJS()]);
        return medias;
    };

export const getSources: (state: RopehoAdminState) => Source[] =
    (state: RopehoAdminState): Source[] => {
        return (state.sourceEdit.get("sources") as Map<string, any>).toList().toJS();
    };

export const getUpdatedMedias: (state: RopehoAdminState) => Media[] =
    (state: RopehoAdminState): Media[] => {
        let medias: Media[] = [];
        (state.mediaEdit.get("order") as List<string>).forEach((id: string) => {
            const media: Map<string, any> = state.mediaEdit.getIn(["medias", id]).set("sources", (state.mediaEdit.getIn(["sources", id]) as List<string>).map((sid: string) => state.sourceEdit.getIn(["sources", sid])));
            medias = [...medias, media.toJS()];
        });
        return medias;
    };

export const getSelectedMedia: (state: RopehoAdminState) => Media =
    (state: RopehoAdminState): Media => {
        const media: Map<string, any> = state.mediaEdit.getIn(["medias", state.mediaEdit.get("selected")]);
        return media && media.toJS();
    };

export const getSelectedSource: (state: RopehoAdminState) => Source =
    (state: RopehoAdminState): Source => {
        const source: Map<string, any> = state.sourceEdit.getIn(["sources", state.sourceEdit.get("selected")]);
        return source && source.toJS();
    };

export const getSourcesFromSelectedMedia: (state: RopehoAdminState) => Source[] =
    (state: RopehoAdminState): Source[] => {
        const sourceIds: List<string> = state.mediaEdit.getIn(["sources", state.mediaEdit.get("selected")]);
        if (sourceIds) {
            return sourceIds.map<Source>((sid: string) => state.sourceEdit.getIn(["sources", sid])).toJS();
        } else {
            return [];
        }
    };

export const getUploadQueue: (state: RopehoAdminState) => UploadEntry[] =
    (state: RopehoAdminState): UploadEntry[] => {
        let entries: UploadEntry[] = [];
        (state.uploadQueue.get("order") as List<string>).forEach((id: string) => entries = [...entries, state.uploadQueue.getIn(["uploadQueue", id]).toJS()]);
        return entries;
    };

export const getActiveUploadQueue: (state: RopehoAdminState) => UploadEntry[] =
    (state: RopehoAdminState): UploadEntry[] => {
        let entries: UploadEntry[] = [];
        (state.uploadQueue.get("order") as List<string>).forEach((id: string) => {
            const entry: UploadEntry = state.uploadQueue.getIn(["uploadQueue", id]).toJS();
            if (entry.active) {
                entries = [...entries, state.uploadQueue.getIn(["uploadQueue", id]).toJS()];
            }
        });
        return entries;
    };

export const getFile: (state: RopehoAdminState, objectURL: string) => File =
    (state: RopehoAdminState, objectURL: string): File => {
        return state.objectURL.getIn(["objectURLs", objectURL]);
    };
