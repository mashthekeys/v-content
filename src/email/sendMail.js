import {createTransport} from "nodemailer";
import emailConfig from "../../config/email.js";

const {mailAuth, mailServer} = emailConfig;

export async function sendMail(outbox, debug) {
  const accepted = [];
  const rejected = [];
  const errorMessages = [];

  for (let i = 0; i < outbox.length; i++) {
    const mail = outbox[i];

    if (debug) {
      let to = mail.to;

      if (typeof to === "string") to = to.split(",");
      else if (!Array.isArray(to)) throw new TypeError("mail.to must be string or array, got " + typeof to);

      mail.to = to.filter(email => {
        if (emailConfig.allowEmail(email)) {
          return true;
        } else {
          console.error(`Forbidden to email «${email}»\n\n`);

          errorMessages.push('Forbidden to email');

          rejected.push(email.replace(/^.*</, "").replace(/>.*$/, ""));

          return false;
        }
      });
    }

    let transport, info;

    try {
      transport = createTransport({
        host: mailServer.host,
        port: mailServer.port,
        auth: mailAuth
      });
    } catch (e) {
      console.error('createTransport failed\n', e);
      throw e;
    }

    try {
      info = await transport.sendMail(mail);

      debug && console.log('sendMail complete\n', info)
    } catch (e) {
      console.error('sendMail failed\n', e);
      throw e;
    }

    if (info == null) {
      errorMessages.push(`sendMail returned ${info}`);
    }

    if (info.rejected && info.rejected.length) {
      errorMessages.push('Some or all recipients were rejected');
      accepted.push.apply(accepted, info.accepted ?? []);
      rejected.push.apply(rejected, info.rejected ?? []);
    } else {
      accepted.push.apply(accepted, info.accepted ?? []);
    }
  }
  return {accepted, rejected, errorMessages};
}
