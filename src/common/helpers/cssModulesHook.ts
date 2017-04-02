/**
 * @file Function to call to handle CSS Modules
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as hook from "css-modules-require-hook";
import * as postCssConfig from "../../../postcss.config";
import { cssModulePattern } from "../../../webpack.config";

let isHooked: boolean = false;

export default (): void => {
    if (!isHooked) {
        hook({
            prepend: postCssConfig.plugins,
            generateScopedName: cssModulePattern
        });
        isHooked = true;
    }
};
