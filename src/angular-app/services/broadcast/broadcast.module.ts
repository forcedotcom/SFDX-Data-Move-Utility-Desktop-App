import { AngularBroadcastService } from '.';

export const broadcastServiceModule = angular.module('broadcastServiceModule', [])
	.service('$broadcast', function () {
		return new AngularBroadcastService();
	});
