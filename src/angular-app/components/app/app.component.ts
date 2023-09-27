import angular from 'angular';
import { AppController } from '.';

export class AppComponent implements angular.IComponentOptions {
    public controller = AppController;
    public templateUrl = './js/angular-app/components/app/app.html';
    public transclude = {
        header: '?headerPane',
        toolbar: '?toolbarPane',
        body: '?bodyPane',
        footer: '?footerPane',
        leftSidebar: '?leftSidebarPane',
        rightSidebar: '?rightSidebarPane'
    };
}
