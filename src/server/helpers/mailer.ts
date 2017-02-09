/**
 * @file API to use nodemailer
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as nodemailer from "nodemailer";
import config from "../../config";

export const transporter: nodemailer.Transporter = nodemailer.createTransport(config.mailer.transporterOptions);

/**
 * Send mail
 * @param {nodemailer.SendMailOptions} mail Mail options
 * @returns {Promise<nodemailer.SentMessageInfo>} A promise to the results of the email
 */
export const sendMail: (mail: nodemailer.SendMailOptions) => Promise<nodemailer.SentMessageInfo> =
    (mail: nodemailer.SendMailOptions) => new Promise<nodemailer.SentMessageInfo>((resolve: (value?: nodemailer.SentMessageInfo | PromiseLike<nodemailer.SentMessageInfo>) => void, reject: (reason?: any) => void) => {
        transporter.sendMail(mail, (error: Error, info: nodemailer.SentMessageInfo) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });

export default transporter;
