
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Configuration, V0alpha1Api } from '@ory/kratos-client';
import config from '../config';
import urljoin = require("url-join");

@Injectable()
export class GuardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const kratos = new V0alpha1Api(
        new Configuration({ basePath: config.kratos.public })
    )
    kratos
    .toSession(undefined, req.header('Cookie'))
    .then(({ data: session }) => {
        console.log(session);
      // `whoami` returns the session or an error. We're changing the type here
      // because express-session is not detected by TypeScript automatically.
      (req as Request & { user: any }).user = { session };
      next();
    })
    .catch(() => {
      // If no session is found, redirect to login.
      res.redirect(urljoin(config.baseUrl, '/auth/login'))
    })
  }
}
