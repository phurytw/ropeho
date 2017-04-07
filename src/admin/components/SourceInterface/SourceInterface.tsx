/**
 * @file Element that accepts a file or a URL to be used as a source
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { container, preview } from "./styles.css";
import { ErrorCodes } from "../../../enum";
import SourceInterfaceButtons from "../SourceInterfaceButtons";
import { isEqual } from "lodash";

export interface SourceInterfaceProps {
    source?: Ropeho.Models.Source;
    setSrc?: (source: Ropeho.Models.Source, src: string) => any;
    setError?: (error: Ropeho.IErrorResponse) => any;
    isVideo?: boolean;
    selectSource?: (sourceId: string) => any;
    moveUp?: (sourceId: string) => any;
    moveDown?: (sourceId: string) => any;
    setFile?: (objectURL: string, file: File) => any;
}

export class SourceInterface extends React.Component<SourceInterfaceProps, {}> {
    fileInput: HTMLInputElement;
    constructor(props: SourceInterfaceProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: SourceInterfaceProps): boolean {
        return !isEqual(nextProps.source, this.props.source);
    }
    handleFileChange: () => void = (): void => {
        if (this.fileInput.files.length > 0) {
            const { setSrc, setError, isVideo, source, setFile }: SourceInterfaceProps = this.props;
            const file: File = this.fileInput.files[0];
            const objectURL: string = URL.createObjectURL(file);
            if (isVideo) {
                if (document.createElement("video").canPlayType(file.type)) {
                    setSrc(source, objectURL);
                } else {
                    setError({
                        errorCode: ErrorCodes.InvalidRequest,
                        developerMessage: "Invalid video",
                        userMessage: "Ce fichier ne peut pas être utilisé comme vidéo"
                    });
                }
            } else {
                if (!file.type.startsWith("image")) {
                    setError({
                        errorCode: ErrorCodes.InvalidRequest,
                        developerMessage: `Invalid image (mime: ${file.type})`,
                        userMessage: "Ce fichier ne peut pas être utilisé comme image"
                    });
                } else {
                    setSrc(source, objectURL);
                }
            }
            setFile(objectURL, file);
        }
    }
    setFileInput: (input: HTMLInputElement) => void = (input: HTMLInputElement): void => {
        this.fileInput = input;
    }
    showFileBrowser: () => void = (): void => {
        this.fileInput.click();
    }
    componentDidMount(): void {
        this.fileInput.addEventListener("change", this.handleFileChange);
    }
    componentWillUnmount(): void {
        this.fileInput.removeEventListener("change", this.handleFileChange);
    }
    selectThisSource: () => void = (): void => {
        const { selectSource, source }: SourceInterfaceProps = this.props;
        selectSource(source._id);
    }
    moveDown: () => void = (): void => {
        const { moveDown, source }: SourceInterfaceProps = this.props;
        moveDown(source._id);
    }
    moveUp: () => void = (): void => {
        const { moveUp, source }: SourceInterfaceProps = this.props;
        moveUp(source._id);
    }
    render(): JSX.Element {
        const { source }: SourceInterfaceProps = this.props;
        return <div className={container}>
            <div role="img" onClick={this.showFileBrowser} className={preview}>
                <input type="file" style={{ display: "none" }} ref={this.setFileInput} />
                <p>+</p>
            </div>
            {
                source ?
                    <SourceInterfaceButtons onMoveDown={this.moveDown} onMoveUp={this.moveUp} onSelect={this.selectThisSource} /> : ""
            }
        </div>;
    }
}

export default SourceInterface;
