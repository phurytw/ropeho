/**
 * @file Form that handles creating a production
 * @author François Nguyen
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Input, Button } from "react-toolbox";
import { container } from "./container.css";

export interface ProductionNewProps {
    createProduction?: (production: Ropeho.Models.Production) => Promise<any>;
}

export class ProductionNew extends React.Component<ProductionNewProps, {}> {
    name: string;
    description: string;
    constructor(props: ProductionNewProps) {
        super(props);
    }
    setName: (name: string) => void = (name: string): void => {
        this.name = name;
    }
    setDescription: (description: string) => void = (description: string): void => {
        this.description = description;
    }
    createProduction: (event?: React.FormEvent<HTMLFormElement>) => Promise<any> = (event?: React.FormEvent<HTMLFormElement>): Promise<any> => {
        if (event) {
            event.preventDefault();
        }
        const { name, description }: ProductionNew = this;
        return this.props.createProduction({ name, description });
    }
    render(): JSX.Element {
        return <form className={container} onSubmit={this.createProduction}>
            <Input label="Nom" required onChange={this.setName} />
            <Input label="Description" onChange={this.setDescription} multiline={true} rows={5} />
            <Button type="submit" label="Créer la production" primary={true} />
        </form>;
    }
}

export default ProductionNew;
