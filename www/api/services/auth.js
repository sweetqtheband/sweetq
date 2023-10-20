import config from "../config";
import { encSvc } from "./encryption";

class AuthorizationService {
  auth(req, res) {
    let valid = Boolean(req.headers?.tid);

    if (valid) {
      const conf = config.listen;
      const hashParts = encSvc.decrypt('hash', req.headers.tid).split(":");
      return hashParts.every((hashPart, index) => encSvc.decrypt(`chunk${index + 1}`, conf[`chunk${index + 1}`]) === hashPart);
    } else {
      res.status(500);
      res.end();
    }
  }
}

export const authSvc = new AuthorizationService();