/**
 * @file Page showing a single production and its medias
 * @author François Nguyen <https://github.com/lith-light-g>
 */
// tslint:disable:react-this-binding-issue
import * as React from "react";
import { PartialRouteComponentProps, Route } from "react-router-dom";
import Banner from "../../../common/components/Banner";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import StrictMasonryContainer from "../../../common/components/StrictMasonryContainer";
import { separator, masonryContainer, masonryItem } from "./styles.css";
import { ViewerParams, default as Viewer } from "../Viewer";

export interface ProductionParams {
    productionName?: string;
    mediaNumber?: string;
}

export interface ProductionProps extends PartialRouteComponentProps<ProductionParams> {
    production: Ropeho.Models.Production;
}

export class Production extends React.Component<ProductionProps, {}> {
    constructor(props?: ProductionProps) {
        super(props);
    }
    render(): JSX.Element {
        const { production: { banner, background, name, description, location, date, models, medias }, match: { params: { productionName } } }: ProductionProps = this.props;
        return <div>
            <Banner banner={banner} background={background} title={name} description={description} location={location} date={new Date(date).toLocaleDateString()} models={models} />
            <h3 className={separator}><i className="fa fa-angle-double-down" aria-hidden="true"></i><span>{name}</span><i className="fa fa-angle-double-down" aria-hidden="true"></i></h3>
            <ContainerRenderer presentations={medias.map<Ropeho.Models.Presentation>((m: Ropeho.Models.Media, i: number) => ({
                _id: m._id,
                mainMedia: m,
                href: `/${productionName}/${i}`,
                options: {
                    rowSpan: 2
                } as Ropeho.Models.StrictMasonryPresentationOptions
            }))}
                interval={100}>
                <StrictMasonryContainer blockSize={160} containerClassName={masonryContainer} presentationClassName={masonryItem} />
            </ContainerRenderer>
            <Route path={`/:productionName/:mediaNumber`}
                render={(routeProps: PartialRouteComponentProps<ViewerParams>) => <Viewer {...routeProps} medias={medias} />} />
        </div>;
    }
}

export default Production;
