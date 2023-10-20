
import path from "path";
import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import fs from "fs";

app.get('/stream*', (req, res) => {
  if (authSvc.auth(req, res)) {
    const file = path.join(__dirname, '..', `media/${String(req.params['0']).replace("/", "")}.mp3`);
    const stat = fs.statSync(file);
    const total = stat.size;
    if (req.headers?.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const partialStart = parts[0];
      const partialEnd = parts[1];

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
      const chunksize = (end - start) + 1;
      const rstream = fs.createReadStream(file, { start: start, end: end });

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg'
      });
      rstream.pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
      fs.createReadStream(file).pipe(res);
    }
  }
});