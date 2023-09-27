
import angular from 'angular';
import { AppService } from '.';
import { IBottomToastService, IBroadcastService, IDialogEditService, IDisplayLogService, IMarkdownService, ISpinnerService, ITranslationService } from '..';


export const AppServiceModule = angular.module('appServiceModule', [])
	.service('$app', [
		'$state',
		'$rootScope',
		'$broadcast',
		'$timeout',
		'$translate',
		'$md',
		'$edit',
		'$spinner',
		'$bottomToast',
		'$displayLog',
		function (
			$state: angular.ui.IStateService,
			$rootScope: angular.IRootScopeService,
			$broadcast: IBroadcastService,
			$timeout: angular.ITimeoutService,
			$translate: ITranslationService,
			$md: IMarkdownService,
			$edit: IDialogEditService,
			$spinner: ISpinnerService,
			$bottomToast: IBottomToastService,
			$displayLog: IDisplayLogService
		) {
			return new AppService(
				$state,
				$rootScope,
				$broadcast,
				$timeout,
				$translate,
				$md,
				$edit,
				$spinner,
				$bottomToast,
				$displayLog
			);
		}]);