import { Routes } from '@angular/router';
import { TermsAndConditionsPage } from './pages/terms-and-conditions-page/terms-and-conditions-page';

export const legalRoutes: Routes = [
  {
    path: '',
    title: 'Terms & Conditions',
    component: TermsAndConditionsPage,
  },
];
