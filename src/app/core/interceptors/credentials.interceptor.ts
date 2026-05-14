import { HttpInterceptorFn } from '@angular/common/http';
import { isPhotonApiUrl } from '../services/photon-api';

/** Adds withCredentials to requests so cookies are sent cross-origin (Photon search excluded). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPhotonApiUrl(req.url)) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
