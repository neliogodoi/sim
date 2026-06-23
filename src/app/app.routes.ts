import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { demoAdminGuard } from './core/guards/demo-admin.guard';
import { loginGuard } from './core/guards/login.guard';
import { premiumGuard } from './core/guards/premium.guard';

const demoAdminRoutes: Routes = [
	{
		path: 'demo',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
	},
	{
		path: 'demo/convidados',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/guests/guests.page').then((m) => m.GuestsPage),
	},
	{
		path: 'demo/agenda',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/schedule/schedule-admin.page').then((m) => m.ScheduleAdminPage),
	},
	{
		path: 'demo/presentes',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/gifts/gifts-admin.page').then((m) => m.GiftsAdminPage),
	},
	{
		path: 'demo/padrinhos',
		canActivate: [demoAdminGuard],
		loadComponent: () =>
			import('./pages/admin/wedding-party/wedding-party-admin.page').then((m) => m.WeddingPartyAdminPage),
	},
	{
		path: 'demo/pessoas',
		canActivate: [demoAdminGuard],
		loadComponent: () =>
			import('./pages/admin/important-people/important-people-admin.page').then((m) => m.ImportantPeopleAdminPage),
	},
	{
		path: 'demo/fornecedores',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/vendors/vendors-admin.page').then((m) => m.VendorsAdminPage),
	},
	{
		path: 'demo/musicas',
		canActivate: [demoAdminGuard],
		loadComponent: () =>
			import('./pages/admin/entrance-songs/entrance-songs-admin.page').then((m) => m.EntranceSongsAdminPage),
	},
	{
		path: 'demo/relatorio',
		canActivate: [demoAdminGuard],
		loadComponent: () =>
			import('./pages/admin/capacity-report/capacity-report.page').then((m) => m.CapacityReportPage),
	},
	{
		path: 'demo/configuracoes',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/settings/settings.page').then((m) => m.SettingsPage),
	},
	{
		path: 'demo/recados',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/messages/messages-admin.page').then((m) => m.MessagesAdminPage),
	},
	{
		path: 'demo/tema',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/theme/theme-admin.page').then((m) => m.ThemeAdminPage),
	},
	{
		path: 'demo/mais',
		canActivate: [demoAdminGuard],
		loadComponent: () => import('./pages/admin/more/more-admin.page').then((m) => m.MoreAdminPage),
	},
];

const premiumAdminGuards = [adminGuard, premiumGuard];

export const routes: Routes = [
	...demoAdminRoutes,
	{
		path: '',
		loadComponent: () => import('./pages/public/landing/landing-page.component').then((m) => m.LandingPageComponent),
	},
	{
		path: 'confirmar-presenca',
		loadComponent: () => import('./pages/public/rsvp/rsvp.page').then((m) => m.RsvpPage),
	},
	{
		path: 'convite/:guestId',
		loadComponent: () => import('./pages/public/rsvp/rsvp.page').then((m) => m.RsvpPage),
	},
	{
		path: 'local',
		loadComponent: () => import('./pages/public/location/location.page').then((m) => m.LocationPage),
	},
	{
		path: 'presentes',
		loadComponent: () => import('./pages/public/gifts/gifts.page').then((m) => m.GiftsPage),
	},
	{
		path: 'mais',
		loadComponent: () => import('./pages/public/more/more.page').then((m) => m.MorePage),
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
		path: 'convite-padrinhos/:memberId',
		loadComponent: () =>
			import('./pages/public/groomsmen-invite/groomsmen-invite.page').then((m) => m.GroomsmenInvitePage),
	},
	{
		path: 'convite-especial/:personId',
		loadComponent: () =>
			import('./pages/public/important-person-invite/important-person-invite.page').then((m) => m.ImportantPersonInvitePage),
	},
	{
		path: 'admin/login',
		canActivate: [loginGuard],
		loadComponent: () => import('./pages/admin/login/login.page').then((m) => m.LoginPage),
	},
	{
		path: 'admin/cadastro',
		canActivate: [loginGuard],
		loadComponent: () => import('./pages/admin/register/register.page').then((m) => m.RegisterPage),
	},
	{
		path: 'admin/pagamento',
		canActivate: [adminGuard],
		loadComponent: () => import('./pages/admin/payment/payment.page').then((m) => m.PaymentPage),
	},
	{
		path: 'admin',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
	},
	{
		path: 'admin/convidados',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/guests/guests.page').then((m) => m.GuestsPage),
	},
	{
		path: 'admin/agenda',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/schedule/schedule-admin.page').then((m) => m.ScheduleAdminPage),
	},
	{
		path: 'admin/presentes',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/gifts/gifts-admin.page').then((m) => m.GiftsAdminPage),
	},
	{
		path: 'admin/padrinhos',
		canActivate: premiumAdminGuards,
		loadComponent: () =>
			import('./pages/admin/wedding-party/wedding-party-admin.page').then((m) => m.WeddingPartyAdminPage),
	},
	{
		path: 'admin/pessoas',
		canActivate: premiumAdminGuards,
		loadComponent: () =>
			import('./pages/admin/important-people/important-people-admin.page').then((m) => m.ImportantPeopleAdminPage),
	},
	{
		path: 'admin/musicas',
		canActivate: premiumAdminGuards,
		loadComponent: () =>
			import('./pages/admin/entrance-songs/entrance-songs-admin.page').then((m) => m.EntranceSongsAdminPage),
	},
	{
		path: 'admin/fornecedores',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/vendors/vendors-admin.page').then((m) => m.VendorsAdminPage),
	},
	{
		path: 'admin/relatorio',
		canActivate: premiumAdminGuards,
		loadComponent: () =>
			import('./pages/admin/capacity-report/capacity-report.page').then((m) => m.CapacityReportPage),
	},
	{
		path: 'admin/recados',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/messages/messages-admin.page').then((m) => m.MessagesAdminPage),
	},
	{
		path: 'admin/tema',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/theme/theme-admin.page').then((m) => m.ThemeAdminPage),
	},
	{
		path: 'admin/mais',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/more/more-admin.page').then((m) => m.MoreAdminPage),
	},
	{
		path: 'admin/configuracoes',
		canActivate: premiumAdminGuards,
		loadComponent: () => import('./pages/admin/settings/settings.page').then((m) => m.SettingsPage),
	},
	{
		path: 'default/admin',
		redirectTo: 'demo',
		pathMatch: 'full',
	},
	{
		path: 'default/admin/:section',
		redirectTo: 'demo/:section',
	},
	{
		path: ':slug',
		loadComponent: () => import('./pages/public/home/home.page').then((m) => m.HomePage),
	},
	{
		path: ':slug/confirmar-presenca',
		loadComponent: () => import('./pages/public/rsvp/rsvp.page').then((m) => m.RsvpPage),
	},
	{
		path: ':slug/convite/:guestId',
		loadComponent: () => import('./pages/public/rsvp/rsvp.page').then((m) => m.RsvpPage),
	},
	{
		path: ':slug/local',
		loadComponent: () => import('./pages/public/location/location.page').then((m) => m.LocationPage),
	},
	{
		path: ':slug/presentes',
		loadComponent: () => import('./pages/public/gifts/gifts.page').then((m) => m.GiftsPage),
	},
	{
		path: ':slug/mais',
		loadComponent: () => import('./pages/public/more/more.page').then((m) => m.MorePage),
	},
	{
		path: ':slug/recados',
		loadComponent: () => import('./pages/public/messages/messages.page').then((m) => m.MessagesPage),
	},
	{
		path: ':slug/album',
		loadComponent: () => import('./pages/public/album/album.page').then((m) => m.AlbumPage),
	},
	{
		path: ':slug/convite-padrinhos/:memberId',
		loadComponent: () =>
			import('./pages/public/groomsmen-invite/groomsmen-invite.page').then((m) => m.GroomsmenInvitePage),
	},
	{
		path: ':slug/convite-especial/:personId',
		loadComponent: () =>
			import('./pages/public/important-person-invite/important-person-invite.page').then((m) => m.ImportantPersonInvitePage),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
