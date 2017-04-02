/**
 * @file Combines host name and port into a single string
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { trim } from "lodash";
import config from "../../config";
const endPoints: Ropeho.Configuration.EndPointsConfiguration = config.endPoints;

const resolveEndPoint: (host: string, port?: number) => string =
    (host: string, port?: number): string => {
        host = host.toLowerCase();
        host = trim(host);
        host = trim(host, ":");
        host = trim(host, "/");
        if (!isFinite(port) || isNaN(port)) {
            return host;
        } else if (/^https:/.test(host) && port === 443) {
            return host;
        } else if (/^http:/.test(host) && port === 80) {
            return host;
        } else {
            return `${host}:${port}`;
        }
    };

export const API_END_POINT: string = resolveEndPoint(endPoints.api.host, endPoints.api.port);
export const MEDIA_END_POINT: string = resolveEndPoint(endPoints.media.host, endPoints.media.port);
export const ADMIN_END_POINT: string = resolveEndPoint(endPoints.admin.host, endPoints.admin.port);
export const ADMIN_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.adminDevServer.host, endPoints.adminDevServer.port);
export const CLIENT_END_POINT: string = resolveEndPoint(endPoints.client.host, endPoints.client.port);
export const CLIENT_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.clientDevServer.host, endPoints.clientDevServer.port);
export const CUSTOMER_END_POINT: string = resolveEndPoint(endPoints.customer.host, endPoints.customer.port);
export const CUSTOMER_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.customerDevServer.host, endPoints.customerDevServer.port);
export default resolveEndPoint;
