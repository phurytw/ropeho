/**
 * @file Component that displays medias in a card grid layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { cardView } from "./styles.css";

export interface CardViewProps {
    items?: {
        media?: Ropeho.Models.Media,
        name?: string,
        href?: string
    }[];
}

export const CardView: (props?: React.HTMLProps<HTMLDivElement>) => JSX.Element =
    ({ children }: React.HTMLProps<HTMLDivElement>): JSX.Element => <div className={cardView}>{children}</div>;

export default CardView;
