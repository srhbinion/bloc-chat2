/**
 * Establishes Angular framework and other plugins
 * @param  {function} UI router   - framework to enhance routing and states
 * @param  {function} firebase  - data storage site. https://binchat.firebaseio.com/
 * @param  {function} bootstrap  - prebuilt libaray of features. Used this feature to prompt a modal
 * @param  {function} ngCookies  - common way to store a string in your browser. Used to store username
 */
var binChat = angular.module("binChat", ["ui.router","firebase","ui.bootstrap","ngCookies"]);

/**
 * Configuration for the angular site views and linking the controller views
 * @param  {function} $stateProvider    - html code for displaying differnt views
 * @param  {function} $locationProvider  - removes errors and hashbangs from address
 */
binChat.config(function($locationProvider, $stateProvider) {
	//configure an application's path
	$locationProvider.html5Mode({
        //Disables hashbangs in URL
        enabled: true,
        //avoids common $location errors
        requireBase: false
    });
    $stateProvider
		.state("landing",{
			// properties of the state listed in "controller"
			url: "/index.html",
			controller:"LandingController",
			templateUrl:"/templates/landing.html"
    });
});

/**
 * Stops the loading of the page and promps the user to sign in with a username. Cookie stores the user name information.
 * @param  {function} $cookie    - html code for displaying differnt views
 */
binChat.run(["$cookies", "$uibModal", function ($cookies, $uibModal) {
   //condition to open model if ture
    if(!$cookies.binChatCurrentUser || $cookies.binChatCurrentUser === " "){
       //The modal opens with this page and conditions
       $uibModal.open({
           templateUrl:"/templates/myModalContent.html",
           controller: "ModalInstanceCtrl",
           size: "sm"
       });
   }
}]);

/**
 * Controls the landing view and the creation and subtraction of chat rooms and messages.
 * @return {array}  - adds and removes chat rooms in the firebase array for rooms
 */
binChat.controller("LandingController", ["$scope", "$firebaseArray","Room", "Message", function($scope, $firebaseArray, Room, Message) {
    $scope.welcome = "BLOC CHAT";
    //"message" array
    $scope.messages = Room.allMessages;
	//user name
	$scope.currentUserName = {
		show: Message.getUser()
	};
    //"room" array features
    $scope.chatRooms = {
        //accesses "room" array
        room: Room.allRooms,
        // adds item to the "room" array
        add: function(room){
            //adds this information to new "room" item in array
            $scope.chatRooms.room.$add({
                name: $scope.newRoomName,
                type: "Room"
            });
            //ng-model hold room name information
            $scope.newRoomName =[];  
        },
        // removes item from "room" array
        remove: function(room){
            $scope.chatRooms.room.$remove(room); 
        },
        //shows the selected room as current room
        set: function(room){
            //toggles between rooms in bodypanel
            $scope.currentRoom = !$scope.currentRoom;
            //ability to call selected room name information
            $scope.current = {
                name: room.name,
                roomId: room.$id
            };
        }
    };
    //"message" array features
    $scope.chatMessages = {
        //accesses "message" array
        messages: Room.allMessages,
        // adds item to the "Messages" array
        add: function() {
            // combines Cookie controller and Message factory to keep message information together in firebase array
            $scope.chatMessages.messages.$add({
                userName: Message.getUser(),
                content: $scope.msgText,
                sentAt: Date.now(),
                roomId: $scope.current.roomId
            });
            // temp holding array for new message information
            $scope.msgText =[];
        },
        // removes item from "Messages" array
        remove: function(msg){
            $scope.chatMessages.messages.$remove(msg); 
        }
    };
}]);

/**
 * controller comands the modal features and adds, cancels, and removes item in cookieStore array
 * @param  {array} cookieStore  - cookie array stores data
 */
binChat.controller("ModalInstanceCtrl", ["$scope", "$modalInstance", "$cookieStore", function($scope, $modalInstance, $cookieStore) { 
    $scope.userName = {
        // stores the username to the cookie array
        add: function(name) {
            $cookieStore.put("binChatCurrentUser", name);
            //closes modal after completeing function
            $modalInstance.close();
        },
        // removes item from the cookie array
        remove: function(name) {
            $cookieStore.remove("binChatCurrentUser", name);
            //closes modal after completeing function
            $modalInstance.close();
        },
        //closes modal
        cancel: function () {
            $modalInstance.dismiss("cancel");
        }
    };
}]);

/**
 * Ability to access the firebase database and the child arrays that contain messages and rooms from anywhere on site
 * @param  {database} firebase  - data storage site. https://binchat.firebaseio.com/
 */
binChat.factory("Room", ["$firebaseArray", function($firebaseArray) {
    // link to app's firebase database
    var firebaseRef = new Firebase("https://binchat.firebaseio.com/");
    // create a synchronized room array
    var rooms = $firebaseArray(firebaseRef.child("rooms"));
    // create a synchronized messages array
    var messages = $firebaseArray(firebaseRef.child("messages"));

    return {
        //accesses "room" array
        allRooms: rooms,
        //accesses "messages" array
        allMessages: messages
    };
}]);

/**
 * Ability to access the firebase database and the child arrays that contain the CookieStore information
 * @param  {database} firebase  - data storage site. https://binchat.firebaseio.com/
 */
binChat.factory("Message", ["$firebaseArray", "$cookieStore", function($firebaseArray, $cookieStore) {
    // link to app's firebase database
    var firebaseRef = new Firebase("https://binchat.firebaseio.com/");
    // create a synchronized messages array
    var messages = $firebaseArray(firebaseRef.child("messages"));

    return {
         //adds item to the "Messages" array
        getUser: function(){
            var userName = $cookieStore.get("binChatCurrentUser");
            //ternary operator
            return userName ? userName : "unknown user";
        }
    };
}]);