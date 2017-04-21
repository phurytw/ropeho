/**
 * @file Menu displayed on larger screens
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { logo as logoBase64 } from "../../assets";
import { logo, menu, links, socials, placeholder } from "./styles.css";

export const MenuSide: () => JSX.Element =
    (): JSX.Element => <header className={placeholder}>
        <div className={menu}>
            <div className={logo}>
                <Link to="/">
                    <img src={`data:image/png;base64, ${logoBase64}`} alt="logo" />
                </Link>
            </div>
            <div className={links}>
                <Link to="/photographies">Photographie</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/about">A propos</Link>
            </div>
            <div className={socials}>
                <a role="social" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/pages/Ropeho-Production/282030468615179">
                    <i className="fa fa-lg fa-facebook-official" aria-hidden="true"></i><p>Facebook</p>
                </a>
                <a role="social" target="_blank" rel="noopener noreferrer" href="https://twitter.com/ropeho">
                    <i className="fa fa-lg fa-twitter" aria-hidden="true"></i><p>Twitter</p>
                </a>
                <a role="social" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/ropeho/">
                    <i className="fa fa-lg fa-instagram" aria-hidden="true"></i><p>Instagram</p>
                </a>
            </div>
        </div>
    </header>;

export default MenuSide;
