/**
 * @file Combines host name and port into a single string
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { trim } from "lodash";

const resolveEndPoint: (host: string, port?: number) => string =
    (host: string, port?: number): string => {
        port = typeof port === "string" ? parseInt(port) : port;
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

// tslint:disable:no-http-string
export const endPoints: Ropeho.Configuration.EndPointsConfiguration = {
    api: {
        host: process.env.API_ADDR || "http://localhost",
        port: process.env.API_PORT || 8000
    },
    client: {
        host: process.env.CLIENT_ADDR || "http://localhost",
        port: process.env.CLIENT_PORT || 3000
    },
    admin: {
        host: process.env.ADMIN_ADDR || "http://localhost",
        port: process.env.ADMIN_PORT || 3010
    },
    customer: {
        host: process.env.CUSTOMER_ADDR || "http://localhost",
        port: process.env.CUSTOMER_PORT || 3020
    },
    clientDevServer: {
        host: process.env.CLIENT_DEV_ADDR || "http://localhost",
        port: process.env.CLIENT_DEV_PORT || 3001
    },
    adminDevServer: {
        host: process.env.ADMIN_DEV_ADDR || "http://localhost",
        port: process.env.ADMIN_DEV_PORT || 3011
    },
    customerDevServer: {
        host: process.env.CUSTOMER_DEV_ADDR || "http://localhost",
        port: process.env.CUSTOMER_DEV_PORT || 3021
    }
};
export const API_END_POINT: string = resolveEndPoint(endPoints.api.host, endPoints.api.port);
export const ADMIN_END_POINT: string = resolveEndPoint(endPoints.admin.host, endPoints.admin.port);
export const ADMIN_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.adminDevServer.host, endPoints.adminDevServer.port);
export const CLIENT_END_POINT: string = resolveEndPoint(endPoints.client.host, endPoints.client.port);
export const CLIENT_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.clientDevServer.host, endPoints.clientDevServer.port);
export const CUSTOMER_END_POINT: string = resolveEndPoint(endPoints.customer.host, endPoints.customer.port);
export const CUSTOMER_DEV_SERVER_END_POINT: string = resolveEndPoint(endPoints.customerDevServer.host, endPoints.customerDevServer.port);
export default resolveEndPoint;
