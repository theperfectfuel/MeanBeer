angular.module('beerApp', ['ngRoute', 'ngAnimate', 'auth0', 'angular-jwt'])
	.config(['$routeProvider', 'authProvider', '$httpProvider', 'jwtInterceptorProvider', function($routeProvider, authProvider, $httpProvider, jwtInterceptorProvider) {
		$routeProvider.when('/home', {
			templateUrl: './views/home.html',
			controller: 'beerCtrl'
		})
		.when('/new-recipe', {
			templateUrl: './views/new-recipe.html',
			controller: 'newRecipeCtrl'
		})
		.when('/list-recipes', {
			templateUrl: './views/list-recipes.html',
			controller: 'listRecipesCtrl'
		})
		.when('/list-recipes/:recipeID', {
			templateUrl: './views/beer-recipe.html',
			controller: 'showBeerCtrl'
		})
		.when('/shopping-list/:recipeID', {
			templateUrl: './views/shopping-list.html',
			controller: 'shoppingListCtrl'
		})
		.when('/shopping-lists', {
			templateUrl: './views/shopping-lists.html',
			controller: 'listShoppingListsCtrl'
		})
		.otherwise('/home');

		authProvider.init({
			domain: 'theperfectfuel.auth0.com',
			clientID: 'PbkQCgbjAuOV4hf02FMZ3xRzTivqJwK9'
		});

		authProvider.on('loginSuccess', function($location, profilePromise, idToken) {
			console.log("Login Success");
			profilePromise.then(function(profile) {
				localStorage.setItem('profile', profile);
				localStorage.setItem('token', idToken);
			});
			$location.path('/');
		});

		authProvider.on('loginFailure', function() {
		   // Error Callback
		});

		jwtInterceptorProvider.tokenGetter = [function() {
			return localStorage.getItem('token');
		}];

		$httpProvider.interceptors.push('jwtInterceptor');

	}])

	.run(function($rootScope, auth, jwtHelper, $location) {
		auth.hookEvents();
		// This events gets triggered on refresh or URL change
		$rootScope.$on('$locationChangeStart', function() {
			var token = localStorage.getItem('token');
			if (token) {
				if (!jwtHelper.isTokenExpired(token)) {
					if (!auth.isAuthenticated) {
						auth.authenticate(localStorage.getItem('profile'), token);
					}
				} else {
					// Either show the login page or use the refresh token to get a new idToken
					$location.path('/');
				}
			}
		});
	})

	.factory('recipeRequest', function() {

		return function(recipeID) {
			return ("Hello: " + recipeID);
		};

	})

	.controller('loginCtrl', ['$scope', 'auth', function($scope, auth) {
		$scope.auth = auth;
		$scope.title = "Home";

		$scope.logout = function() {
			auth.signout();
			localStorage.removeItem('profile');
			localStorage.removeItem('token');
			console.log("Logged out! " + auth.isAuthenticated);
		};

	}])

	.controller('beerCtrl', ['$scope', function($scope) {
		$scope.brandMsg = "Welcome to SharedBrew.com";
		$scope.maintitle = "Let's Brew Some Beer!";

	}])

	.controller('newRecipeCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
		$scope.recipetitle = "Create a New Recipe";

		$scope.newRecipe = {};

		$scope.grains_list = [];
		$scope.grains_list_obj = {};

		$scope.hops_list = [];
		$scope.hops_list_obj = {};

		$scope.yeast_list = [];
		$scope.yeast_list_obj = {};

		$scope.other_list = [];
		$scope.other_list_obj = {};

		$scope.pushGrains = function() {
			$scope.grains_list.push({grains_type:$scope.grains_type, grains_amount:$scope.grains_amount});
			$scope.grains_type = "";
			$scope.grains_amount = "";
			$scope.grains_list_obj = angular.copy($scope.grains_list);
		};

		$scope.pushHops = function() {
			$scope.hops_list.push({hops_type:$scope.hops_type, hops_amount:$scope.hops_amount});
			$scope.hops_type = "";
			$scope.hops_amount = "";
			$scope.hops_list_obj = angular.copy($scope.hops_list);
		};

		$scope.pushYeast = function() {
			$scope.yeast_list.push({yeast_type:$scope.yeast_type, yeast_amount:$scope.yeast_amount});
			$scope.yeast_type = "";
			$scope.yeast_amount = "";
			$scope.yeast_list_obj = angular.copy($scope.yeast_list);
		};

		$scope.pushOther = function() {
			$scope.other_list.push({other_ingredient:$scope.other_ingredient, other_amount:$scope.other_amount});
			$scope.other_ingredient = "";
			$scope.other_amount = "";
			$scope.other_list_obj = angular.copy($scope.other_list);
		};

		$scope.addRecipe = function() {
			$scope.newRecipe = {
				beer_name: $scope.beer_name,
				beer_style: $scope.beer_style,
				beer_abv: $scope.beer_abv,
				grains_list: $scope.grains_list_obj,
				hops_list: $scope.hops_list_obj,
				yeast_list: $scope.yeast_list_obj,
				other_list: $scope.other_list_obj,
				orig_grav: $scope.orig_grav,
				final_grav: $scope.final_grav,
				brew_difficulty: $scope.brew_difficulty,
				batch_size: $scope.batch_size,
				brew_instructions: $scope.brew_instructions
			};

			$http({
				method: 'POST',
				url: '/new-recipe',
				data: $scope.newRecipe,
				//headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).then(function successCallback(response) {
				console.log('done');
			});

			// Reset form
			$scope.beer_name = "";
			$scope.beer_style = "";
			$scope.beer_abv = "";
			$scope.grains_type = "";
			$scope.grains_amount = "";
			$scope.hops_type = "";
			$scope.hops_amount = "";
			$scope.yeast_type = "";
			$scope.yeast_amount = "";
			$scope.orig_grav = "";
			$scope.final_grav = "";
			$scope.brew_difficulty = "";
			$scope.batch_size = "";
			$scope.other_ingredient = "";
			$scope.other_amount = "";
			$scope.brew_instructions = "";
			$location.path( "/list-recipes" );
		};

	}])

	.controller('listRecipesCtrl', ['$scope', '$http', function($scope, $http) {

		var recList = {};

		$http({
			method: 'GET',
			url: '/list-recipes'
		}).then(function successCallback(response) {
			recList = response.data;
			console.log(recList);
			$scope.datas = recList;
			}, function errorCallback(response) {
			console.log(response);
		});

	}])


	.controller('showBeerCtrl', ['$scope', '$routeParams', '$route', '$http', 'recipeRequest', 'auth', function($scope, $routeParams, $route, $http, recipeRequest, auth) {

		$scope.recipeID = $routeParams.recipeID;
		$scope.auth = auth;

		var recipe = {};

		$http({
			method: 'GET',
			url: '/list-recipes/:recipeID',
			params: {recipeID: $scope.recipeID}
		}).then(function successCallback(response) {
			recipe = response.data;
			console.log(recipe);
			$scope.beer_recipe = recipe;
			}, function errorCallback(response) {
			console.log(response);
		});

	}])


	.controller('shoppingListCtrl', ['$scope', '$route', '$routeParams', '$http', function($scope, $route, $routeParams, $http) {

		$scope.recipeID = $routeParams.recipeID;
		$scope.beer_recipe = {};
		$scope.shoppingList = {};

		var newShoppingList = function() {

			console.log("Inside shoppingList", $scope.beer_recipe);

			$scope.shoppingList = {
				beer_name: $scope.beer_recipe.beer_name,
				grains_list: $scope.beer_recipe.grains_list,
				hops_list: $scope.beer_recipe.hops_list,
				yeast_list: $scope.beer_recipe.yeast_list,
				other_list: $scope.beer_recipe.other_list,
				batch_size: $scope.beer_recipe.batch_size
			};

			$http({
				method: 'POST',
				url: '/shopping-list/:recipeID',
				data: $scope.shoppingList,
				//headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).then(function successCallback(response) {
					console.log('Finished shoppingList function');
			});

		};


		$http({
			method: 'GET',
			url: '/list-recipes/:recipeID',
			params: {recipeID: $scope.recipeID}
		}).then(function successCallback(response) {
			$scope.beer_recipe = response.data;
			newShoppingList();
			}, function errorCallback(response) {
			console.log("Error cb " + response);
		});

	}])

	.controller('listShoppingListsCtrl', ['$scope', '$http', 'auth', function($scope, $http, auth) {

		$scope.auth = auth;
		$scope.datas = {};

		$http({
			method: 'GET',
			url: '/shopping-lists'
		}).then(function successCallback(response) {
			$scope.datas = response.data;
			}, function errorCallback(response) {
			console.log(response);
		});

	}])

	.animation('.slide-toggle', ['$animateCss', function($animateCss) {
	    return {
	        addClass: function(element, className, doneFn) {
	            if (className == 'ng-hide') {
	                var animator = $animateCss(element, {                    
	                    to: {height: '0px', opacity: 0}
	                });
	                if (animator) {
	                    return animator.start().finally(function() {
	                        element[0].style.height = '';
	                        doneFn();
	                    });
	                }
	            }
	            doneFn();
	        },
	        removeClass: function(element, className, doneFn) {
	            if (className == 'ng-hide') {
	                var height = element[0].offsetHeight;
	                var animator = $animateCss(element, {
	                    from: {height: '0px', opacity: 0},
	                    to: {height: height + 'px', opacity: 1}
	                });
	                if (animator) {
	                 return animator.start().finally(doneFn);
	                }
	            }
	            doneFn();
	        }
	    };
	}]);



