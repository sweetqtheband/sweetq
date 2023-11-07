import express from 'express';
import cors from 'cors';
import config from '../config';

class AppService {
  get conf() {
    const env = process.env.NODE_ENV || "production";
    return config.environments[env];
  }
  constructor() {
    this.app = express();

    // handling CORS
    this.app.use(cors())
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (this.conf.origins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, TID");
      next();
    });
  }

  get() {
    return this.app.get(...arguments);
  }

  launch() {
    this.app.listen(this.conf.port, () => {
      console.log(`Server listening on port ${this.conf.port}`);
    });
  }
}

export const app = new AppService();