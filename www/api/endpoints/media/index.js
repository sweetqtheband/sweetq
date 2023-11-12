import { app } from "../../services/app";
import { authSvc } from "../../services/auth";

const medias = [
  {
    id: '1',
    title: 'Atrapado en el tiempo'
  },
  {
    id: '2',
    title: 'Lo siento, pero no'
  },
  {
    id: '3',
    title: '¿Qué vamos a hacer?'
  },
]

app.get('/media', (req, res) => {
  if (authSvc.auth(req, res)) {
    res.json({ data: medias });
  }
});