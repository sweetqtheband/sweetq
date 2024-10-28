import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import medias from "../../assets/data/tracks";
import path from "path";

app.get('/media', (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});

app.get("/media/:trackId", (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias.find(item => item.id === req.params.trackId) });
  }
});

app.get("/media/:trackId/download", (req, res) => {
  if (authSvc.auth(req, res)) {
    const media = medias.find(item => item.id === req.params.trackId);
    if (media && media.download) {
      const file = path.join(__dirname, '..', `media/${media.id}.mp3`);
      res.download(file);
    }
  }
});