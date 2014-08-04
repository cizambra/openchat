(function() {
	"use strict";

	var app = angular.module("openchat",["ui.router"]);

  app.factory('socket', function ($rootScope) {
    var socket = io.connect('ws://104.131.249.228:1337');
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });

	app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");
  //
  // Now set up the states
  $stateProvider
    .state('login', {
      url: "/login",
      views: {
      	'greet'  : {
      		templateUrl: "partials/greet.html",
      		controller: "MenuController as ac"
      	},
      	'content': {
      		templateUrl: "partials/login.html",
      		controller: "LoginController as lc"
      	}
    	}
    })
    .state('chat', {
      url: "/chat",
      views: {
      	'greet'  : {
      		templateUrl: "partials/greet.html",
      		controller: "MenuController as ac"
      	},
      	'content': {
      		templateUrl: "partials/chat.html",
      		controller: "ChatLoaderController"
      	}
    	}
    })
    .state('logout', {
    	url: "/logout",
    	template: "",
    	onEnter: function($stateParams, $state) {
    		current_user = null;
    		$state.transitionTo('login');
    	}
    })
  });

	/* New controller */
	app.controller("MenuController", function() {
		this.current_user = current_user;
		this.isUserLogged = function() {
			return this.current_user && this.current_user.logged;
		}
	});

	app.controller("LoginController", ['$scope','$state','socket',function($scope, $state, socket) {
    $scope.userTaken = false;

		if (current_user && current_user.logged === true) {
			$state.transitionTo('chat');
		} else {
			this.current_user = {};
      /* Se cargan los JS asociados */
      $scope.$on('$viewContentLoading',
        function(event, viewConfig){
          console.log('content loading: ', event, viewConfig)
      });

      $scope.$on('$viewContentLoaded',
        function(event){
          onLoginResize();
          console.log('content loaded: ',event)
      });
		}
		this.login = function() {
			this.current_user.logged = true;
      this.current_user.isBusy = false;
      current_user = this.current_user;
      socket.emit('user.new', current_user);
      var s = $state;
      socket.on('user.status',function(data) {
        if (data.status == "connected") {
          token = data.token;
          s.transitionTo('chat');
        } else {
          console.log('Connection Error');
          $scope.userTaken = true;
        }
      });
		};
	}]);

	/* Controller for loading chat panel */
	app.controller("ChatLoaderController", function($scope, $state) {
		if (current_user.logged !== true) {
			$state.transitionTo('login');
		} else {
		 	$scope.$on('$viewContentLoading',
        function(event, viewConfig){
          console.log('content loading: ', event, viewConfig)
     	});

     	$scope.$on('$viewContentLoaded',
        function(event){
        	onChatResize();
          console.log('content loaded: ',event)
      });
    }
	});

	app.controller("ConversationController", ['$scope', 'socket', function($scope, socket) {
		$scope.comments = [];

    socket.on('comment.send', function (data) {
        console.log(data);
        $("textarea#comment").removeAttr('disabled'); // let the user write another message
        $scope.comments.push(data);
        console.log($scope.comments);
        $(".conversation").animate({ scrollTop: $(".conversation").prop("scrollHeight") }, 100);
    });
	}]);

	app.controller("UserController", ['$scope', 'socket', function($scope, socket) {
		$scope.users = {};
    socket.emit('user.connected');
    socket.on('user.list', function(data) {
      console.log(data);
      $scope.users = data;
      console.log($scope.users);
    });
		$scope.isBusy = function(user) {
			return user.isBusy;
		};
		$scope.isCurrent = function(user) {
			return user.name === current_user.name;
		}
	}]);

	app.controller("CommentController", ['$scope', 'socket', function($scope, socket) {
		this.comment = {};
		this.addComment = function() {
			this.comment.user = current_user.name;
      socket.emit('comment.received', this.comment);
      $("textarea#comment").attr('disabled', 'disabled');

			this.comment = {};
		};
	}]);

	app.directive("sendOnEnter", function() {
		return {
			restrict: 'A',
			link: function (scope, element, attributes) {
        element.on("keydown", function (e) {
        	if(e.keyCode == 13)
    	   {
    	   		if (!e.shiftKey) {
    	   			e.preventDefault();
    	   			element.parent().find("input").trigger("click");
    	   		}
    	   }
      	});
      }
		}
	});

  var token = null;

	var current_user = {
		logged : false
	};
}) ();