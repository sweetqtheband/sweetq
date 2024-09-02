import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import medias from "../../assets/data/tracks";

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