/**
 * @file List of sources
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import SourceInterface from "../SourceInterface";
import { MediaTypes } from "../../../enum";
import { v4 } from "uuid";
import { container } from "./styles.css";

import Source = Ropeho.Models.Source;
import Media = Ropeho.Models.Media;

export interface SourceSelectorProps {
    sources?: Source[];
    media?: Media;
    setError?: (error?: Ropeho.IErrorResponse) => any;
    setSource?: (source: Source) => any;
    selectSource?: (sourceId: string) => any;
    setSourcePosition?: (sourceId: string, position: number) => any;
    setFile?: (objectURL: string, file: File) => any;
}

export class SourceSelector extends React.Component<SourceSelectorProps, {}> {
    constructor(props: SourceSelectorProps) {
        super(props);
    }
    setFromUrl: (source: Source, preview: string) => void = (source: Source, preview: string): void => {
        const targetSource: Source = source || {
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            src: "",
            preview,
            zoom: 1
        };
        this.props.setSource({
            ...targetSource,
            preview
        });
    }
    moveSourceUp: (sourceId: string) => void = (sourceId: string): void => {
        const { setSourcePosition, sources }: SourceSelectorProps = this.props;
        setSourcePosition(sourceId, Math.max(sources.map((s: Source) => s._id).indexOf(sourceId) - 1, 0));
    }
    moveSourceDown: (sourceId: string) => void = (sourceId: string): void => {
        const { setSourcePosition, sources }: SourceSelectorProps = this.props;
        setSourcePosition(sourceId, sources.map((s: Source) => s._id).indexOf(sourceId) + 1);
    }
    render(): JSX.Element {
        const { sources, media, setError, selectSource, setFile }: SourceSelectorProps = this.props;
        let addNew: JSX.Element = <SourceInterface setError={setError} setSrc={this.setFromUrl} setFile={setFile} />;
        let isVideo: boolean = false;
        // tslint:disable:react-this-binding-issue
        switch (media && media.type) {
            case MediaTypes.Image:
                if (sources.length > 0) {
                    addNew = undefined;
                }
                break;
            case MediaTypes.Video:
                isVideo = true;
                if (sources.length > 0) {
                    addNew = undefined;
                }
                break;
            case MediaTypes.Slideshow:
                break;
            default:
                addNew = undefined;
                break;
        }
        return <div className={container}>
            {
                // show the existing sources
                media && media.type !== MediaTypes.Text && sources ? sources.map<JSX.Element>((s: Source, index: number) => <SourceInterface
                    key={index}
                    source={s}
                    isVideo={isVideo}
                    setError={setError}
                    setSrc={this.setFromUrl}
                    selectSource={selectSource}
                    moveDown={this.moveSourceDown}
                    moveUp={this.moveSourceUp}
                    setFile={setFile}
                />) : ""
            }
            {addNew}
        </div>;
    }
}

export default SourceSelector;
