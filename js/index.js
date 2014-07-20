var app = {
    client_id : '77p0rzolyohfp8',
    redirect_uri : 'http://metaaps.com',
    scope: 'r_fullprofile',
    state : 'dYnxjbWk7cgemTGp',
    client_secret: 'MztCv6L6vD30eh5L',

    init: function() {
        $('#login a').on('click', function() {
            app.onLoginButtonClick();
        });
        //Check if we have a valid token
        //cached or if we can get a new
        //one using a refresh token.
        linkedinapi.getToken({
            client_id: this.client_id,
            client_secret: this.client_secret
        }).done(function() {
            //Show the greet view if we get a valid token
            app.showGreetView();
        }).fail(function() {
            //Show the login view if we have no valid token
            app.showLoginView();
        });
    },
    showLoginView: function() {
        $('#login').show();
        $('#greet').hide();
    },
    showGreetView: function() {
        $('#login').hide();
        $('#greet').show();

        //Get the token, either from the cache
        //or by using the refresh token.
        linkedinapi.getToken({
            client_id: this.client_id,
            client_secret: this.client_secret
        }).then(function(data) {
            //Pass the token to the API call and return a new promise object
            return linkedinapi.userInfo({'oauth2_access_token': data.access_token });
        }).done(function(user) {
            //Display a greeting if the API call was successful
            $('#greet h1').html('Hello ' + user.firstName + " " + user.lastName + '!' + JSON.stringify(user));
        }).fail(function( jqxhr, textStatus, error ) {
            alert("Could not get user info " + error);
            //If getting the token fails, or the token has been
            //revoked, show the login view.
            app.showLoginView();
        });
    },
    onLoginButtonClick: function() {
        //Show the consent page
        linkedinapi.authorize({
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.redirect_uri,
            scope: this.scope,
            state: this.state
        }).done(function() {
            //Show the greet view if access is granted
            app.showGreetView();
        }).fail(function(data) {
            //Show an error message if access was denied
            $('#login p').html("Error " + data.error);
        });
    }
};

$(document).on('deviceready', function() {
    alert('Device ready');
    app.init();
});

$(document).ready(function() {
    alert('Device ready');
    app.init();
});
