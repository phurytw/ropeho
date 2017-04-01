/**
 * @file Form that edits production meta data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { sourceEdit } from "./styles.css";
import { Input } from "react-toolbox";

export class SourceEditMetaDataProps {
    setSource: (production: Ropeho.Models.Source) => any;
    source: Ropeho.Models.Source;
}

export class SourceEditMetaData extends React.Component<SourceEditMetaDataProps, {}> {
    constructor(props: SourceEditMetaDataProps) {
        super(props);
    }
    setPosX: (posX: number) => void = (posX: number): void => {
        const { source, setSource }: SourceEditMetaDataProps = this.props;
        setSource({
            ...source,
            posX
        });
    }
    setPosY: (posY: number) => void = (posY: number): void => {
        const { source, setSource }: SourceEditMetaDataProps = this.props;
        setSource({
            ...source,
            posY
        });
    }
    setZoom: (zoom: number) => void = (zoom: number): void => {
        const { source, setSource }: SourceEditMetaDataProps = this.props;
        setSource({
            ...source,
            zoom
        });
    }
    render(): JSX.Element {
        const { source }: SourceEditMetaDataProps = this.props;
        return <form className={sourceEdit}>
            <Input label="X" onChange={this.setPosX} value={source.posX} type="number" />
            <Input label="Y" onChange={this.setPosY} value={source.posY} type="number" />
            <Input label="Zoom" onChange={this.setZoom} value={source.zoom} type="number" />
        </form>;
    }
}

export default SourceEditMetaData;
