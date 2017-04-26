/**
 * @file Home page
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { Dispatch } from "redux";
import { RopehoClientState } from "../../reducer";
import * as presentationModule from "../../modules/presentation";
import { getHasRendered, getPresentations } from "../../selectors";
import { connect } from "react-redux";
import StrictMasonryContainer from "../../../common/components/StrictMasonryContainer";
import VerticalMasonryContainer from "../../../common/components/VerticalMasonryContainer";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import { waitForContent } from "../../../common/helpers/contentLoaded";
import { PresentationTypes } from "../../../enum";
import { isEqual } from "lodash";
import "../../../common/helpers/rAFTimers";

import PresentationContainer = Ropeho.Models.PresentationContainer;

export const mapStateToProps: (state: RopehoClientState, ownProps?: HomeProps) => HomeProps =
    (state: RopehoClientState, ownProps?: HomeProps): HomeProps => ({
        hasRendered: getHasRendered(state),
        presentations: getPresentations(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: HomeProps) => HomeProps =
    (dispatch: Dispatch<any>, ownProps?: HomeProps): HomeProps => ({
        fetchPresentations: () => dispatch<Promise<presentationModule.Actions.SetPresentations>, {}>(presentationModule.fetchPresentations())
    });

export interface HomeProps {
    hasRendered?: boolean;
    presentations?: PresentationContainer[];
    fetchPresentations?: () => Promise<presentationModule.Actions.SetPresentations>;
}

export interface HomeState {
    take?: number;
}

export const timeout: number = 5000;
export const interval: number = 100;

export class Home extends React.Component<HomeProps, HomeState> {
    timeout: number;
    interval: number;
    constructor(props?: HomeProps) {
        super(props);
        this.state = { take: 0 };
    }
    componentWillMount(): void {
        const { hasRendered, fetchPresentations }: HomeProps = this.props;
        if (!hasRendered) {
            fetchPresentations();
        }
    }
    componentDidMount(): void {
        this.setState({ take: 0 });
        waitForContent().then(() => {
            this.renderAll();
        });
        this.timeout = window.requestTimeout(() => this.renderAll(), 5000) as any;
    }
    componentDidUpdate(prevProps: HomeProps): void {
        if (!isEqual(prevProps.presentations, this.props.presentations)) {
            waitForContent().then(() => {
                this.renderAll();
            });
        }
    }
    componentWillUnmount(): void {
        if (this.interval) {
            window.clearRequestTimeout(this.interval);
            this.interval = undefined;
        }
        if (this.timeout) {
            window.clearRequestTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    renderAll: (index?: number) => void = (index: number = 0): void => {
        let take: number = this.state.take;
        take++;
        if (this.props.presentations.length >= take) {
            this.setState({ take });
            this.interval = window.requestTimeout(() => {
                this.renderAll(take);
            }, interval * this.props.presentations[take - 1].presentations.length) as any;
        } else if (this.timeout) {
            window.clearRequestTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    static fetchData(dispatch: Dispatch<RopehoClientState>): Promise<presentationModule.Actions.SetPresentations> {
        return dispatch(presentationModule.fetchPresentations());
    }
    render(): JSX.Element {
        const { presentations }: HomeProps = this.props;
        const { take }: HomeState = this.state;
        return <div>
            {presentations
                .map<JSX.Element>((p: PresentationContainer, i: number) => <ContainerRenderer presentations={p.presentations} key={i} render={i < take ? timeout : false} interval={interval}>
                    {
                        p.type === PresentationTypes.StrictMasonry ? <StrictMasonryContainer /> : <VerticalMasonryContainer />
                    }
                </ContainerRenderer>)}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
