/**
 * @file Form that edits production meta data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { MediaPermissions } from "../../../enum";
import { productionMetaForm } from "./productionMetaForm.css";
import { Input, Dropdown } from "react-toolbox";
import { isEqual } from "lodash";

export class ProductionEditMetaDataProps {
    setProduction: (production: Ropeho.Models.Production) => any;
    production: Ropeho.Models.Production;
}

export class ProductionEditMetaData extends React.Component<ProductionEditMetaDataProps, {}> {
    constructor(props: ProductionEditMetaDataProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: ProductionEditMetaDataProps): boolean {
        return !isEqual(nextProps.production, this.props.production);
    }
    setName: (name: string) => void = (name: string): void => {
        const { production, setProduction }: ProductionEditMetaDataProps = this.props;
        setProduction({
            ...production,
            name
        });
    }
    setDescription: (description: string) => void = (description: string): void => {
        const { production, setProduction }: ProductionEditMetaDataProps = this.props;
        setProduction({
            ...production,
            description
        });
    }
    setMediaPermissions: (state: number) => void = (state: number): void => {
        const { production, setProduction }: ProductionEditMetaDataProps = this.props;
        setProduction({
            ...production,
            state
        });
    }
    render(): JSX.Element {
        const { production }: ProductionEditMetaDataProps = this.props;
        return <form className={productionMetaForm}>
            <Input label="Nom" onChange={this.setName} value={production.name} />
            <Input label="Description" onChange={this.setDescription} value={production.description} />
            <Dropdown
                required
                label="Accès"
                value={production.state}
                onChange={this.setMediaPermissions}
                source={[{
                    label: "Publique (visible sur le site)",
                    value: MediaPermissions.Public.valueOf()
                }, {
                    label: "Privé (visible que par les clients concernés)",
                    value: MediaPermissions.OwnerOnly.valueOf()
                }, {
                    label: "Vérouillé (visible que par les administrateurs)",
                    value: MediaPermissions.Locked.valueOf()
                }]}
            />
        </form>;
    }
}

export default ProductionEditMetaData;
