import { Controller, Get, Next, Query, Render, Req, Res } from '@nestjs/common';
import { Configuration, V0alpha1Api,  } from '@ory/kratos-client';
import { FlowDTO } from 'src/dto/FlowDTO';
import config from '../../config';
import { Response, Request, NextFunction } from 'express';
import { isString, redirectOnSoftError } from '../../helpers/sdk'
import { ErrorDTO } from 'src/dto/ErrorDTO';
import { AxiosError } from 'axios';

@Controller()
export class KratosController {

  @Get('/')
  public async dashboard(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {

    res.render('dashboard');
  }

  @Get('/auth/registration')
  public registration(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {
    const flow = query.flow
    console.log(`Kratos link: ${config.kratos.public}`);
    console.log(`Flow: ${flow}`);
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )

    // The flow is used to identify the login and registration flow and
    // return data like the csrf_token and so on.
    if (!flow || !isString(flow)) {
      console.log('No flow ID found in URL, initializing registration flow.')
      res.redirect(`${config.kratos.browser}/self-service/registration/browser`)
      return
    }

    kratos
      .getSelfServiceRegistrationFlow(flow, req.header('Cookie'))
      .then(({ status, data: flow }) => {
        if (status !== 200) {
          return Promise.reject(flow)
        }

        flow.ui.nodes

        // Render the data using a view (e.g. Jade Template):
        res.render('registration', flow)
      })
      // Handle errors using ExpressJS' next functionality:
      .catch(redirectOnSoftError(res, next, '/self-service/registration/browser'))
  }

  @Get('/auth/login')
  // @Render('login')
  public login(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {
    const flow = query.flow;
    console.log(`Kratos link: ${config.kratos.public}`);
    console.log(`Flow: ${flow}`);
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )

    // The flow is used to identify the login and registration flow and
    // return data like the csrf_token and so on.
    if (!flow || !isString(flow)) {
      console.log('No flow ID found in URL, initializing login flow.')
      res.redirect(`${config.kratos.browser}/self-service/login/browser`)
      return
    }

    return (
      kratos
        .getSelfServiceLoginFlow(flow, req.header('cookie'))
        .then(({ status, data: flow, ...response }) => {
          if (status !== 200) {
            return Promise.reject(flow)
          }

          // Render the data using a view (e.g. Jade Template):
          res.render('login', flow)
        })
        // Handle errors using ExpressJS' next functionality:
        .catch(redirectOnSoftError(res, next, '/self-service/login/browser'))
    )
  }

  @Get('/error')
  public errorHandler(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: ErrorDTO) {
    const error = query.error
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )

    if (!error || !isString(error)) {
      // No error was send, redirecting back to home.
      res.redirect(config.baseUrl)
      return
    }

    kratos
      .getSelfServiceError(error)
      .then(({ status, data: body }) => {
        if ('error' in body) {
          res.status(500).render('error', {
            message: JSON.stringify(body.error, null, 2),
          })
          return Promise.resolve()
        }

        return Promise.reject(
          `expected errorContainer to contain "errors" but got ${JSON.stringify(
            body
          )}`
        )
      })
      .catch((err: AxiosError) => {
        if (!err.response) {
          next(err)
          return
        }

        if (err.response.status === 404) {
          // The error could not be found, redirect back to home.
          res.redirect(config.baseUrl)
          return
        }

        next(err)
      })
  }

  @Get('/settings')
  public async settings(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {
    const flow = query.flow;
    console.log(`Kratos link: ${config.kratos.public}`);
    console.log(`Flow: ${flow}`);
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )
    // The flow ID is used to identify the account settings flow and
    // return data like the csrf_token and so on.
    if (!flow || !isString(flow)) {
      console.log('No flow found in URL, initializing flow.')
      res.redirect(`${config.kratos.browser}/self-service/settings/browser`)
      return
    }
    console.log("ok now");

    // Create a logout URL
    const {
      data: { logout_url: logoutUrl },
    } = await kratos.createSelfServiceLogoutFlowUrlForBrowsers(
      req.header('Cookie')
    )

    kratos
      .getSelfServiceSettingsFlow(flow, undefined, req.header('Cookie'))
      .then(({ status, data: flow }) => {
        if (status !== 200) {
          console.log(`Status: ${status}`);
          return Promise.reject(flow)
        }

        // Render the data using a view (e.g. Jade Template):
        res.render('settings', { ...flow, logoutUrl })
      })
      .catch(redirectOnSoftError(res, next, '/self-service/settings/browser'))
  }

  @Get('/verify')
  public verify(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {
    const flow = query.flow;
    console.log(`Kratos link: ${config.kratos.public}`);
    console.log(`Flow: ${flow}`);
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )

    // The flow is used to identify the account verification flow and
    // return data like the csrf_token and so on.
    if (!flow || !isString(flow)) {
      console.log('No request found in URL, initializing verification flow.')
      res.redirect(`${config.kratos.browser}/self-service/verification/browser`)
      return
    }

    kratos
      .getSelfServiceVerificationFlow(flow, req.header('Cookie'))
      .then(({ status, data: flow }) => {
        if (status != 200) {
          return Promise.reject(flow)
        }
  
        // Render the data using a view (e.g. Jade Template):
        res.render('verification', flow)
      })
      .catch(redirectOnSoftError(res, next, '/self-service/verification/browser'))
  }

  @Get('/recovery')
  public recovery(@Res() res: Response, @Req() req: Request, @Next() next: NextFunction, @Query() query: FlowDTO) {
    const flow = query.flow;
    console.log(`Kratos link: ${config.kratos.public}`);
    console.log(`Flow: ${flow}`);
    const kratos = new V0alpha1Api(
      new Configuration({ basePath: config.kratos.public })
    )

    // The flow is used to identify the account recovery flow and
    // return data like the csrf_token and so on.
    if (!flow || !isString(flow)) {
      console.log('No request found in URL, initializing recovery flow.')
      res.redirect(`${config.kratos.browser}/self-service/recovery/browser`)
      return
    }
  
    kratos
      .getSelfServiceRecoveryFlow(flow, req.header('Cookie'))
      .then(({ status, data: flow }) => {
        if (status !== 200) {
          return Promise.reject(flow)
        }
  
        // Render the data using a view (e.g. Jade Template):
        res.render('recovery', flow)
      })
      .catch(redirectOnSoftError(res, next, '/self-service/recovery/browser'))
  }
}
