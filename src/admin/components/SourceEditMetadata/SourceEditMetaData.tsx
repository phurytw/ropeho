/**
 * @file Form that edits production meta data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { sourceEdit } from "./styles.css";
import { Input, Button } from "react-toolbox";
import { isEqual } from "lodash";

export class SourceEditMetaDataProps {
    setSource: (production: Ropeho.Models.Source) => any;
    removeSource: (sourceId: string) => any;
    source: Ropeho.Models.Source;
}

export class SourceEditMetaData extends React.Component<SourceEditMetaDataProps, {}> {
    constructor(props: SourceEditMetaDataProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: SourceEditMetaDataProps): boolean {
        return !isEqual(nextProps.source, this.props.source);
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
    removeSource: () => void = (): void => {
        const { removeSource, source }: SourceEditMetaDataProps = this.props;
        removeSource(source._id);
    }
    render(): JSX.Element {
        const { source }: SourceEditMetaDataProps = this.props;
        return <form className={sourceEdit}>
            <Input label="X" onChange={this.setPosX} value={source.posX} type="number" />
            <Input label="Y" onChange={this.setPosY} value={source.posY} type="number" />
            <Input label="Zoom" onChange={this.setZoom} value={source.zoom} type="number" />
            <Button label="Supprimer" icon="delete" onClick={this.removeSource} accent={true} />
        </form>;
    }
}

export default SourceEditMetaData;
