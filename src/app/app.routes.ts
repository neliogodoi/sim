import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/public/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'confirmar-presenca',
    loadComponent: () => import('./pages/public/rsvp/rsvp.page').then((m) => m.RsvpPage),
  },
  {
    path: 'local',
    loadComponent: () => import('./pages/public/location/location.page').then((m) => m.LocationPage),
  },
  {
    path: 'agenda',
    loadComponent: () => import('./pages/public/schedule/schedule.page').then((m) => m.SchedulePage),
  },
  {
    path: 'presentes',
    loadComponent: () => import('./pages/public/gifts/gifts.page').then((m) => m.GiftsPage),
  },
  {
    path: 'recados',
    loadComponent: () => import('./pages/public/messages/messages.page').then((m) => m.MessagesPage),
  },
  {
    path: 'album',
    loadComponent: () => import('./pages/public/album/album.page').then((m) => m.AlbumPage),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'admin/convidados',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/guests/guests.page').then((m) => m.GuestsPage),
  },
  {
    path: 'admin/agenda',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/schedule/schedule-admin.page').then((m) => m.ScheduleAdminPage),
  },
  {
    path: 'admin/presentes',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/gifts/gifts-admin.page').then((m) => m.GiftsAdminPage),
  },
  {
    path: 'admin/recados',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/messages/messages-admin.page').then((m) => m.MessagesAdminPage),
  },
  {
    path: 'admin/configuracoes',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
