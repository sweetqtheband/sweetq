import { app } from "../../services/app";
import { authSvc } from "../../services/auth";

const medias = [
  {
    id: '1',
    title: 'Lo siento, pero no'
  },
  {
    id: '2',
    title: '¿Qué vamos a hacer?'
  },
  {
    id: '3',
    title: 'Atrapado en el tiempo'
  },
]

app.get('/media', (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});