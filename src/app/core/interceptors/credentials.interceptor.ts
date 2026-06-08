import { HttpInterceptorFn } from '@angular/common/http';

function isPhotonApiUrl(url: string): boolean {
  return url.includes('photon.komoot.io');
}

/** Adds withCredentials to requests so cookies are sent cross-origin (Photon search excluded). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPhotonApiUrl(req.url)) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
