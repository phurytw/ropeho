/**
 * @file Wraps a Presentation with a anchor tag when needed
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { PresentationProps, Presentation } from "../Presentation";
import { Link } from "react-router-dom";

export interface PresentationWithHrefProps extends PresentationProps {
    href?: string;
}

export const PresentationWithHref: (props?: PresentationWithHrefProps) => JSX.Element =
    (props?: PresentationWithHrefProps): JSX.Element => {
        const { href, className, style }: PresentationWithHrefProps = props;
        const presentationProps: PresentationWithHrefProps = {
            ...props
        };
        delete presentationProps.href;
        delete presentationProps.ref;
        if (!href) {
            return <Presentation {...(presentationProps as any) } />;
        } else {
            delete presentationProps.className;
            delete presentationProps.key;
            delete presentationProps.style;
            if (href.startsWith("/")) {
                return <Link
                    to={href}
                    style={style}
                    className={className}
                >
                    <Presentation {...(presentationProps as any) } />
                </Link>;
            } else {
                return <a
                    href={href}
                    style={style}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Presentation {...(presentationProps as any) } />
                </a>;
            }
        }
    };

export default PresentationWithHref;
