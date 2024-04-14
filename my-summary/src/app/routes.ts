import { Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routeConfig: Routes = [
    {
        path: '',
        component: DashboardComponent,
        title: 'トップページ'
    },
    {
        path: 'details',
        component: DetailComponent,
        title: '詳細ページ'
    }
];

export default routeConfig