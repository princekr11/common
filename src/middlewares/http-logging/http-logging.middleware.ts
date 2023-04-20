import {Middleware, MiddlewareContext} from '@loopback/rest';
import {LoggingUtils, RestError} from '../../utils';
import _ from 'lodash';
import moment from 'moment-timezone';
import {QueueProducer, LogProcessingQueueMessageEventType} from '../../queues';
import {stringifyCircularJSON} from '../../utils/circular-replacer-json';
import {ApplicationErrorLogs, RequestInfoLogs} from './';
import {ErrorCodes} from '../../constants/error-codes-mapping';
import {Option} from '../../constants';

export const httpLogging: Middleware = async (middlewareCtx: MiddlewareContext, next: Function) => {
  const {request} = middlewareCtx;
  const userProfile = middlewareCtx.getBinding('userProfile').getValue(middlewareCtx);
  const startTime = moment();

  const transactionId: string = userProfile.TrxId ?? '';
  // LoggingUtils.info('Transaction Id' + ' ' + transactionId);
  let logData = {
    ipAddress: userProfile.ip,
    appUserId: userProfile.appUserId ?? null,
    startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: request.method,
    requestURL: request.originalUrl.split('?')[0],
    logGenTime: new Date(),
    transactionId
  };

  let payload = {queryParams: request.query};

  const incomingRequestData: RequestInfoLogs = {
    startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
    requestMethod: request.method,
    requestURL: request.originalUrl,
    transactionId
  };

  let shouldLog = true;
  for (let keys of Option.GLOBALOPTIONS.URIEXCLUSIONFROMHTTPACCESSLOGS) {
    if (request.path.includes(keys)) {
      shouldLog = false;
      break;
    }
  }
  if (shouldLog) LoggingUtils.info(incomingRequestData, 'http-logging-middleware');
  try {
    // Proceed with the request
    const result = await next();

    const endTime = moment();
    const durationInMs = moment.duration(endTime.diff(startTime)).asMilliseconds();
    // Process response
    payload = _.extend(payload, {
      requestBody: request.body ?? null
    });
    logData = _.extend(logData, {
      payload,
      responseJSON: result,
      isError: false,
      endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
      durationInMs
    });

    QueueProducer.sendMessageInLogProcessingQueue({
      eventType: LogProcessingQueueMessageEventType.HTTP_ACCESS_LOG,
      logDate: moment().toDate(),
      data: logData
    }).catch((err: any) => {
      LoggingUtils.error(err);
    });

    return result;
  } catch (err) {
    // Catch errors from downstream middleware

    const endTime = moment();
    const durationInMs = moment.duration(endTime.diff(startTime)).asMilliseconds();

    payload = _.extend(payload, {
      requestBody: request.body ?? null
    });

    logData = _.extend(logData, {
      payload,
      responseJSON: {
        name: 'Error',
        message: err.message ?? err,
        statusCode: +(err.status ?? err.statusCode)
      },
      isError: true,
      endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
      durationInMs
    });

    QueueProducer.sendMessageInLogProcessingQueue({
      eventType: LogProcessingQueueMessageEventType.HTTP_ACCESS_LOG,
      logDate: moment().toDate(),
      data: logData
    }).catch((err: any) => {
      LoggingUtils.error(err);
    });

    const errorObjectToLog: ApplicationErrorLogs = {
      requestMethod: request.method,
      requestURL: request.originalUrl,
      transactionId: transactionId,
      errorMessage: err.message ?? err.Error.message ?? '',
      errorDetails: err.details ? JSON.stringify(err.details) : '',
      errorStack: err.stack ?? ''
    };
    LoggingUtils.error(errorObjectToLog, 'http-logging-middleware/error-handler');
    if (err.hasOwnProperty('code') && err.code == 'VALIDATION_FAILED') {
      return Promise.reject(new RestError(422, 'The request body is invalid'));
    } else if (!(err instanceof RestError)) {
      //We need to handle this seperately as the authorization component isn't responding with a RestError
      if (err.hasOwnProperty('statusCode') && err.statusCode == 403) {
        return Promise.reject(new RestError(403, 'Access denied'));
      } else {
        return Promise.reject(new RestError(491, 'Something went wrong'));
      }
    } else {
      let status_array = [400, 411, 413, 414, 415, 416, 401, 404, 422];
      if (status_array.includes(Number(err.status))) {
        return Promise.reject(err);
        // return Promise.reject(new RestError(491, "Something went wrong")) //
        //return Promise.reject(err) ; //for now returning error as is
        // if(err.extra && err.extra.systemcode && ErrorCodes.SYSTEMCODEMAPPING[err.extra.systemcode]){
        //   return Promise.reject(new RestError(ErrorCodes.SYSTEMCODEMAPPING[err.extra.systemcode]['httpStatus'], err.message))
        // }else{
        //   if(String(process.env.NODE_ENV).toLowerCase()=== 'production'){
        //     return Promise.reject(new RestError(err.status,err.message))
        //   }else{
        //     return Promise.reject(new RestError(491, "Something went wrong"))
        //   }
        // }
      } else {
        return Promise.reject(err);
      }
    }
  }
};
