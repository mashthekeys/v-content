import {sendMail} from "../email/sendMail.js";
import xmlSafe from "../util/xmlSafe.js";


export function createEmailNotifier(subject, from, to) {
  function reqHeaders(rawHeaders) {
    return rawHeaders.map((s, i) => {
      if (i % 2) {
        return s.replace(/\n/g, "\n    ") + "\n";
      } else {
        return (s.replace(/\n/g, "\n    ") + ": ").padEnd(20, " ");
      }
    }).join("").trimEnd();
  }


  return function notifyAdmin(req, res, text) {
    text = `${text}

### BEGIN REQUEST LOG ###
${req.method} ${req.url}

${reqHeaders(req.rawHeaders)}
### END REQUEST LOG ###

### BEGIN RESPONSE LOG ###
${res.statusCode} ${res.statusMessage}
# ${(res.finished || res.writableEnded) ? "SENT" : "NOT SENT"}
### END RESPONSE LOG ###

■`;

    const firstLine = String(text.split("\n").filter($ => $ != null && $.length && $[0] !== "#")[0]);

    const fullSubject = `${subject} (${firstLine.substr(0, 100)})`;

    const html = `<pre style="white-space: pre-wrap; width: 100%;">${xmlSafe(text)}</pre>`;

    // noinspection JSIgnoredPromiseFromCall
    sendMail([{
      from: `${JSON.stringify(String(from.name || from.email))} <${from.email}>`,
      to: `${JSON.stringify(String(to.name || to.email))} <${to.email}>`,
      subject: fullSubject,
      text,
      html,
    }]);
  }
}