import angular from 'angular';
import { UiLangSwitcherController } from '.';

export function UiLangSwitcherDirective(): angular.IDirective {
	return {
		restrict: 'E',
		scope: {
			onChange: '&'
		},
		controller: UiLangSwitcherController,
		controllerAs: '$ctrl',
		bindToController: true,
		template: `
		<div class="dropdown">
		  <button class="btn btn-secondary dropdown-toggle" type="button" 
		  			data-bs-toggle="dropdown" 
					aria-haspopup="true" 
					aria-expanded="false"
					ng-click="$ctrl.expandDropdown()">
			<span>
				<i class="{{$ctrl.selectedLang.flagClass}}"></i>
				{{$ctrl.selectedLang.nativeName}}
			</span>
		  </button>
		  <div class="dropdown-menu">
			<a class="dropdown-item" ng-repeat="lang in $ctrl.selectSource" 
				ng-click="$ctrl.changeLanguage(lang.code)" 
				href="javascript:void(0)">
			  <span class="{{lang.flagClass}}"></span> {{lang.nativeName}}
			</a>
		  </div>
		</div>
	  `,
	};
}