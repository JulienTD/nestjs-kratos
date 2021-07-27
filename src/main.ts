import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as handlebars from 'express-handlebars'
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NextFunction } from 'express';
import config from './config';
import { getTitle, onlyNodes, toUiNodePartial } from './helpers/ui'
// require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    (res as any).locals.projectName = config.projectName;
    (res as any).locals.baseUrl = config.baseUrl;
    (res as any).locals.pathPrefix = config.baseUrl.replace(/\/+$/, '') + '/'
    next()
  })

  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.engine(
    'hbs',
    handlebars({
      extname: 'hbs',
      layoutsDir: `${__dirname}/../views/layouts/`,
      partialsDir: `${__dirname}/../views/partials/`,
      defaultLayout: 'main',
      helpers: {
        ...require('handlebars-helpers')(),
        json: (context: any) => JSON.stringify(context),
        jsonPretty: (context: any) => JSON.stringify(context, null, 2),
        onlyNodes,
        getTitle,
        toUiNodePartial: toUiNodePartial,
      },
    })
  )

  await app.listen(process.env.PORT);
}
bootstrap();
