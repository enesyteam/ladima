var goSua = angular.module('goSua', [
	'ui.router',
	'ngAnimate',
    'ui.bootstrap',
  	'ngSanitize',
    'toastr',
	'angular-sweet-alert',
    'slick',
	'mLadipage'
	])
    .constant('appVersion', '4.4.0')
    .constant('releaseDate', 'May-20, 2018')
    .config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    	$locationProvider.hashPrefix('');

    	$urlRouterProvider.otherwise("/");

    	$stateProvider
    		.state( 'home', {
    			url: '/',
    			controller: 'MainCtrl',
    			templateUrl: '/pages/home.html'
    		} )
			.state( 'home.main', {
				url: '/',
				controller: 'MainCtrl',
				templateUrl: '/pages/home-main.html'
			} )
	    	.state('home.collection', {
	            url: 'c=:colId',
	            controller: 'DetailCtrl',
                params     : { colId: null},
	            templateUrl: '/pages/collection.html',
				reloadOnSearch: false
	        })
    })
    .run(themeRun);


function themeRun($window, $rootScope, $timeout) {

}

goSua.directive('splitArray', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attr, ngModel) {

			function fromUser(text) {
				return text.split("\n");
			}

			function toUser(array) {
				return array.join("\n");
			}

			ngModel.$parsers.push(fromUser);
			ngModel.$formatters.push(toUser);
		}
	};
});
