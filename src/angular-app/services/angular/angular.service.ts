
import angular from 'angular';
import { AngularUtils } from '../../../utils';

/**
 * Interface for services handling dynamic HTML compilation and insertion in Angular applications.
 */
export interface IAngularService {

	/**
	 * Adds compiled HTML to the DOM using Angular's compilation process, allowing Angular directives within the HTML to interact properly with the scope.
	 * @param $scope The Angular scope where the HTML should be linked.
	 * @param element The DOM element to which the HTML will be added.
	 * @param rawHtml The raw HTML string to compile and add.
	 * @param operation (Optional) Specifies how the HTML should be added to the element: 'append', 'prepend', or 'after'. Default is 'after'.
	 * @param doApply (Optional) Specifies whether to execute $scope.$apply() after adding the compiled html element.
	 */
	addCompiledHtml($gcope: angular.IScope, element: HTMLElement, rawHtml: string, operation?: 'append' | 'prepend' | 'after', doApply?: boolean): angular.IAugmentedJQuery;

	/**
	 * Adds a help link to a specified HTML element within an Angular application.
	 * This method creates a label with a help link based on the provided search keyword.
	 * @param $scope The Angular scope to which the label's interactions and bindings will be linked.
	 * @param elementToAddAfter The HTML element after which the help link will be added.
	 * @param helpSearchWord The search keyword to be used in the help link, facilitating context-specific assistance.
	 * @param doApply (Optional) Specifies whether to execute $scope.$apply() after adding the compiled html element. 
	 * @returns Returns the augmented jQuery object containing the compiled and linked HTML of the new label.
	 */
	addHelpLink($scope: angular.IScope, elementToAddAfter: HTMLElement, helpSearchWord: string, doApply?: boolean): angular.IAugmentedJQuery;

}


export class AngularService implements IAngularService {
	constructor(private $compile: angular.ICompileService) { }

	public addCompiledHtml($scope: angular.IScope, element: HTMLElement, rawHtml: string, operation: 'append' | 'prepend' | 'after' = 'after', doApply = true): angular.IAugmentedJQuery {
		const $element = angular.element(element);
		const $html = angular.element(rawHtml);
		switch (operation) {
			case "append":
				$element.append($html);
				break;
			case "after":
				$element.after($html);
				break;
			default:
				$element.prepend($html);
				break;
		}
		this.$compile($html)($scope);
		doApply && AngularUtils.$apply($scope);
		return $html;
	}


	public addHelpLink($scope: angular.IScope, elementToAddAfter: HTMLElement, helpSearchWord: string, doApply = true): angular.IAugmentedJQuery {
		const html = `<ui-label help-search-word="${helpSearchWord}" add-help-links="true"></ui-label>`;
		return this.addCompiledHtml($scope, elementToAddAfter, html, 'after', doApply);
	}

}