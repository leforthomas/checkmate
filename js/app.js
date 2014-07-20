(function(){
	'use strict';

    $(document).on('deviceready', function() {
        angular.bootstrap(document, ['checkMate']);
    });

    var myApp = angular.module('checkMate', ['ngAnimate', 'onsen.directives']);
    
    myApp.controller("controller", ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window, $http) {

        var profiles;
        var usedNames = {};
        
        $scope.state = {
            showResult: false
        };
        
        // for testing
/*
        if(!localStorage.hasVisited) {
            delete localStorage.hasVisited;
        }
*/
        
        $scope.connect = function() {
            
            $scope.showIntro = false;
            
            var linkedInParameters = {
                client_id : '77p0rzolyohfp8',
                redirect_uri : 'http://metaaps.com',
                scope: 'r_basicprofile r_network',
                state : 'dYnxjbWk7cgemTGp',
                client_secret: 'MztCv6L6vD30eh5L'
            };
            //Get the token, either from the cache
            //or by using the refresh token.
            linkedinapi.getToken({
                client_id: linkedInParameters.client_id,
                client_secret: linkedInParameters.client_secret
            }).then(function(data) {
                //Pass the token to the API call and return a new promise object
                return linkedinapi.connections({'oauth2_access_token': data.access_token });
            }).done(function(connections) {
                profiles = connections.values;
                //Display a greeting if the API call was successful
                $scope.ons.screen.presentPage('page1.html');
                localStorage.hasVisited = false;
                $scope.start();
                $scope.$apply();
            }).fail(function( jqxhr, textStatus, error ) {
                console.log("Could not get user info " + error);
                //Show the consent page
                linkedinapi.authorize({
                    client_id: linkedInParameters.client_id,
                    client_secret: linkedInParameters.client_secret,
                    redirect_uri: linkedInParameters.redirect_uri,
                    scope: linkedInParameters.scope,
                    state: linkedInParameters.state
                }).done(function() {
                    $scope.connect();
                }).fail(function(data) {
                    //Show an error message if access was denied
                    console.log("Error " + data.error);
                });
            });
        };

        $scope.start = function() {
            $scope.state.showResult = false;
            $scope.score = 0;
            $scope.currentLeft = 0;
            $scope.tested = 0;
            $scope.scoreValue = 'get ready!';
            $scope.scoreComment = '';
            $scope.names = [];
            $scope.profileImage = '';
            
            $scope.loadNames();
        };
        
        $scope.loadNames = function() {
            if(!profiles) {
            } else {
                // pick the real name and 5 more randomly
                var names = [], currentNames = {}, profile, name = "", index = 0, count = 0, maxIterations = 10000, profilePicture;
                for(; index < maxIterations && count < 5; index++) {
                    profile = profiles[Math.floor(Math.random() * profiles.length)];
                    name = profile.formattedName;
                    profilePicture =  profile.pictureUrl;
                    if(name && profilePicture && !currentNames[name] && !usedNames[name]) {
                        names.push({name: name, profilePicture: profilePicture, selection: false});
                        currentNames[name] = true;
                        count++;
                    }
                }
                profile = names[Math.floor(Math.random() * names.length)];
                profile.selection = true;
                usedNames[profile.name] = true;
                $scope.names = names;
                $scope.profileImage = profile.profilePicture;
                $scope.currentLeft = names.length;
            }
        };
        
        $scope.reloadNames = function() {
            $scope.loadNames();
        };

        $scope.updateScore = function(rightAnswer) {
            if(rightAnswer === true) {
                $scope.scoreComment = "Great job!";
                $scope.score = $scope.score + ($scope.currentLeft == 5 ? 1 : 0);
                $scope.tested++;
                if($scope.tested == 10) {
                    $scope.state.showResult = true;
                    var ratio = $scope.score / $scope.tested;
                    $scope.scoreResult = ratio > 0.8 ? "a brilliant " + $scope.score + '. Well done expert! You truly know your connections.' :
                                            ratio > 0.6 ? "a reassuring " + $scope.score + '. You do seem to have an idea of who your connections are. Still room for improvement though.' :
                                            ratio > 0.3 ? "a worrying " + $scope.score + '. Either your memory is short term or you have too many connections to remember them. Have another go, you might need it for next time you go on LinkedIn.' :
                                            "a disgraceful " + $scope.score + '. Make sure you don\'t share your score!'
                                            ;
                    return;
                } else {
                    $scope.reloadNames();
                }
            } else {
                $scope.currentLeft--;
                $scope.scoreComment = $scope.currentLeft == 4 ? "Woops!" :
                                        $scope.currentLeft == 3 ? "Baaaad!" :
                                            $scope.currentLeft == 2 ? "For f** sake!" :
                                                $scope.currentLeft == 1 ? "Aaaarrrg" : "";
                $scope.score = $scope.score + ($scope.currentLeft == 4 ? 0 : -1);
            }
            $scope.scoreValue = $scope.score + ' - checked mates: ' + $scope.tested;
        };
        
        $scope.share = function() {
            linkedinapi.share(
                {
                    'content': 'I just tested my LinkedIn network knowledge',
                    'oauth2_access_token': data.access_token
                });
        };
        
        $scope.restart = function() {
            $rootScope.ons.screen.presentPage('page1.html');
            $scope.start();
        };

        // start app
        if(!localStorage.hasVisited) {
            $scope.showIntro = true;
        } else {
            $scope.connect();
        }
        
    }]);
    
    
    myApp.controller("nameController", function($scope) {
        
        $scope.checkUser = function() {
            if($scope.name.selection === true) {
                $scope.updateScore(true);
            } else {
                $scope.error = true;
                $scope.updateScore(false);
            }
        };
        
    });
    
    myApp.directive('uiScopeComment', function($animate) {
        return {
            link: function(scope, element, attrs) {
                scope.$watch(attrs.uiScopeComment, function(val, oldVal) {
                    if(val == oldVal) return;
                    $animate.removeClass(element, 'fadeOut animated');
                    $animate.removeClass(element, 'fadeIn animated');
                    $animate.addClass(element, 'fadeIn animated', function() {
                        if(val == 'Great job!') {
                            $animate.addClass(element, 'fadeOut animated', function() {
                            });
                        }
                    });
                });
            }
        };
    });

})();
