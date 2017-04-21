/**
 * @file Menu displayed on smaller screens
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { logo as logoBase64 } from "../../assets";
import { logo, menu, links } from "./styles.css";

export const MenuTop: () => JSX.Element =
    (): JSX.Element => <header className={menu}>
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
    </header>;

export default MenuTop;
