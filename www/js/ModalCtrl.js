// Common Controller for the montage view
/* jshint -W041 */
/* jslint browser: true*/
/* global cordova,StatusBar,angular,console,ionic */


angular.module('zmApp.controllers').controller('ModalCtrl', ['$scope', '$rootScope', 'zm', 'ZMDataModel', '$ionicSideMenuDelegate', '$timeout', '$interval', '$ionicModal', '$ionicLoading', '$http', '$state', '$stateParams', '$ionicHistory', '$ionicScrollDelegate', function ($scope, $rootScope, zm, ZMDataModel, $ionicSideMenuDelegate, $timeout, $interval, $ionicModal, $ionicLoading, $http, $state, $stateParams, $ionicHistory, $ionicScrollDelegate) {


    console.log("**** INSIDE MODAL CTRL, recomputing rand *****");

    $scope.imageFit = false;
    // FIXME: This is a hack - for some reason
    // the custom slider view is messed up till the image loads
    // in modal view
    $scope.showModalRangeSider = false;
    $scope.isModalActive = true;

    $timeout(function () {
        $scope.showModalRangeSider = true;

    }, 2000);

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    $rootScope.authSession = "undefined";
    $ionicLoading.show({
        template: 'negotiating stream authentication...',
        animation: 'fade-in',
        showBackdrop: true,
        duration: zm.loadingTimeout,
        maxWidth: 300,
        showDelay: 0
    });
    var ld = ZMDataModel.getLogin();
    ZMDataModel.getAuthKey()
        .then(function (success) {
                $ionicLoading.hide();
                $rootScope.authSession = success;
                ZMDataModel.zmLog("Modal: Stream authentication construction: " + $rootScope.authSession);

            },
            function (error) {

                $ionicLoading.hide();
                ZMDataModel.zmDebug("ModalCtrl: Error details of stream auth:" + error);
                //$rootScope.authSession="";
                ZMDataModel.zmLog("Modal: Error returned Stream authentication construction. Retaining old value of: " + $rootScope.authSession);
            });


    
    

    $scope.radialMenuOptions = {
        content: '',

        background: '#2F4F4F',
        isOpen: true,
        toggleOnClick: false,
        button: {
            cssClass: "fa  fa-arrows-alt",
        },
        items: [
            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'Down');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'DownLeft');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,

                onclick: function () {
                    controlPTZ($scope.monitorId, 'Left');
                }
            },
            {
                content: 'D',
                empty: true,

                onclick: function () {
                    console.log('About');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'UpLeft');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'Up');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'UpRight');
                }
            },

            {
                content: 'H',
                empty: true,
                onclick: function () {
                    console.log('About');
                }
            },

            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'Right');
                }
            },


            {
                content: '',
                cssClass: 'fa fa-chevron-circle-up',
                empty: false,
                onclick: function () {
                    controlPTZ($scope.monitorId, 'DownRight');
                }
            },

            {
                content: 'K',
                empty: true,
                onclick: function () {
                    console.log('About');
                }
            },
    ]
    };


    $interval.cancel(intervalModalHandle);
    intervalModalHandle = $interval(function () {
        loadModalNotifications();
        //  console.log ("Refreshing Image...");
    }.bind(this), ld.refreshSec * 1000);

    loadModalNotifications();

    
    

    function onPause() {
        ZMDataModel.zmDebug("ModalCtrl: onpause called");
        $interval.cancel(intervalModalHandle);
        // $interval.cancel(modalIntervalHandle);

        // FIXME: Do I need to  setAwake(false) here?
    }


    function onResume() {
        ZMDataModel.zmDebug("ModalCtrl: Modal resume called");
        if ($scope.isModalActive) {
            ZMDataModel.zmLog("ModalCtrl: Restarting Modal timer on resume");

            $interval.cancel(intervalModalHandle);
            intervalModalHandle = $interval(function () {
                loadModalNotifications();
                //  console.log ("Refreshing Image...");
            }.bind(this), ld.refreshSec * 1000);


            $rootScope.modalRand = Math.floor((Math.random() * 100000) + 1);

        }



    }


    function loadModalNotifications() {

        //console.log ("Inside Modal timer...");
        $rootScope.modalRand = Math.floor((Math.random() * 100000) + 1);

    }

    var intervalModalHandle;



    //-------------------------------------------------------------
    // Send PTZ command to ZM
    // Note: PTZ fails on desktop, don't bother about it
    //-------------------------------------------------------------
    function controlPTZ(monitorId, cmd) {

        //curl -X POST "http://server.com/zm/index.php?view=request" -d
        //"request=control&user=admin&passwd=xx&id=4&control=moveConLeft"

        if (!$scope.ptzMoveCommand) {
            $ionicLoading.show({
                template: "Not Ready for PTZ",
                noBackdrop: true,
                duration: 2000,
            });
            return;
        }


        console.log("Command value " + cmd + " with MID=" + monitorId);
        $ionicLoading.hide();
        $ionicLoading.show({
            template: "please wait...",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });

        var loginData = ZMDataModel.getLogin();
        $ionicLoading.hide();
        $ionicLoading.show({
            template: "Sending PTZ..",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });


        var req = $http({
            method: 'POST',
            /*timeout: 15000,*/
            url: loginData.url + '/index.php',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" +
                        encodeURIComponent(obj[p]));
                var foo = str.join("&");
                console.log("****RETURNING " + foo);
                return foo;
            },
            // NOTE: Refer to
            // zoneminder/skins/mobile/includes/control_functions.php
            // for move commands
            // logic - /zm/api/monitors/X.json, read ControlId = Y
            // then zm/api/controls/Y.json

            data: {
                view: "request",
                request: "control",
                id: monitorId,
                control: $scope.ptzMoveCommand + cmd,
                xge: "30", //wtf
                yge: "30", //wtf
            }

        });

        req.success(function (resp) {
            $ionicLoading.hide();
            console.log("SUCCESS: " + JSON.stringify(resp));

            // $ionicLoading.hide();

        });

        req.error(function (resp) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(resp));
            ZMDataModel.zmLog("Error sending PTZ:" + JSON.stringify(resp), "error");
        });
    }

    $scope.finishedLoadingImage = function () {
        // console.log("***Monitor image FINISHED Loading***");
        $ionicLoading.hide();

    };

    $scope.onTapLeft = function (m,d)
    {
        
        var curstate =  $ionicHistory.currentStateName();
        var found=0;    
        var mid;
          mid = ZMDataModel.getNextMonitor(m, d);
        if (curstate != "monitors")
        {
            do
            {
                 mid = ZMDataModel.getNextMonitor(m, d);
                m = mid;
                found = 0;
                for (var i = 0 ; i< $scope.monitors.length; i++)
                {
                    if ($scope.monitors[i].Monitor.Id == mid && $scope.monitors[i].Monitor.listDisplay != 'noshow')
                    {
                        found = 1;
                        ZMDataModel.zmDebug("ModalCtrl: swipe detected, moving to " +   mid); 
                        break;
                    }
                }


            }
            while (found !=1);
        }
        
        $scope.monitorId = mid;
        $scope.monitorName = ZMDataModel.getMonitorName(mid);

        $ionicLoading.hide();
        $ionicLoading.show({
            template: "please wait...",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });
    };
    
    $scope.onSwipeLeft = function (m, d) {
        var ld = ZMDataModel.getLogin();
       if (!ld.canSwipeMonitors) return;
        
        var curstate =  $ionicHistory.currentStateName();
        var found=0;    
        var mid;
        mid = ZMDataModel.getNextMonitor(m, d);
        
        if (curstate != "monitors")
        {
        
            do
            {
                mid = ZMDataModel.getNextMonitor(m, d);
                m = mid;
                console.log ("Next Monitor is "+m);


                    found = 0;
                    for (var i = 0 ; i< $scope.monitors.length; i++)
                    {
                        if ($scope.monitors[i].Monitor.Id == mid  && $scope.monitors[i].Monitor.listDisplay != 'noshow')
                        {
                            found = 1;
                            console.log (mid + "is part of the monitor list");
                            ZMDataModel.zmDebug("ModalCtrl: swipe detected, moving to " +   mid); 
                            break;
                        }
                    }


            }
            while (found !=1);
        }
        
        $scope.monitorId = mid;
        $scope.monitorName = ZMDataModel.getMonitorName(mid);


        $ionicLoading.hide();
        $ionicLoading.show({
            template: "please wait...",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });
        
        

    };
    
    $scope.onTapRight = function (m,d)
    {
         //ZMDataModel.zmDebug("ModalCtrl:Right tap detected, moving to " + ZMDataModel.getNextMonitor(m, d));
      var found=0;    
        var mid;
        var curstate =  $ionicHistory.currentStateName();
        mid = ZMDataModel.getNextMonitor(m, d);
        if (curstate != "monitors")
        {
            do
            {

                 mid = ZMDataModel.getNextMonitor(m, d);
                m = mid;
                found = 0;
                for (var i = 0 ; i< $scope.monitors.length; i++)
                {
                    if ($scope.monitors[i].Monitor.Id == mid && $scope.monitors[i].Monitor.listDisplay != 'noshow' )
                    {
                        found = 1;
                        ZMDataModel.zmDebug("ModalCtrl: swipe detected, moving to " +   mid); 
                        break;
                    }
                }


            }
            while (found !=1);
        }
        
        $scope.monitorId = mid;
        $scope.monitorName = ZMDataModel.getMonitorName(mid);

        $ionicLoading.show({
            template: "please wait...",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });
    };
    $scope.onSwipeRight = function (m, d) {
        if (!ld.canSwipeMonitors) return;
        var found=0;    
        var mid;
        var curstate =  $ionicHistory.currentStateName();
        mid = ZMDataModel.getNextMonitor(m, d);
        if (curstate != "monitors")
        {
            do
            {
                 mid = ZMDataModel.getNextMonitor(m, d);
                m = mid;
                found = 0;
                for (var i = 0 ; i< $scope.monitors.length; i++)
                {
                    if ($scope.monitors[i].Monitor.Id == mid && $scope.monitors[i].Monitor.listDisplay != 'noshow')
                    {
                        found = 1;
                        ZMDataModel.zmDebug("ModalCtrl: swipe detected, moving to " +   mid); 
                        break;
                    }
                }


            }
            while (found !=1);
        }
        
        $scope.monitorId = mid;
        $scope.monitorName = ZMDataModel.getMonitorName(mid);
        $ionicLoading.show({
            template: "please wait...",
            noBackdrop: true,
            duration: zm.loadingTimeout,
        });
    };

    //-----------------------------------------------------------------------
    // Sucess/Error handlers for saving a snapshot of the
    // monitor image to phone storage
    //-----------------------------------------------------------------------

    function SaveSuccess() {
        $ionicLoading.show({
            template: "done!",
            noBackdrop: true,
            duration: 1000
        });
        ZMDataModel.zmDebug("ModalCtrl:Photo saved successfuly");
    }

    function SaveError(e) {
        $ionicLoading.show({
            template: "error - could not save",
            noBackdrop: true,
            duration: 2000
        });
        ZMDataModel.zmLog("Error saving image: " + e.message);
        console.log("***ERROR");
    }

    //-----------------------------------------------------------------------
    // Saves a snapshot of the monitor image to phone storage
    //-----------------------------------------------------------------------

    $scope.saveImageToPhone = function (mid) {
        $ionicLoading.show({
            template: "saving snapshot...",
            noBackdrop: true,
            duration: zm.httpTimeout
        });

        ZMDataModel.zmDebug("ModalCtrl: SaveImageToPhone called");
        var canvas, context, imageDataUrl, imageData;
        var loginData = ZMDataModel.getLogin();
        var url = loginData.streamingurl +
            '/cgi-bin/zms?mode=single&monitor=' + mid +
            '&user=' + loginData.username +
            '&pass=' + loginData.password;
        ZMDataModel.zmLog("SavetoPhone:Trying to save image from " + url);

        var img = new Image();
        img.onload = function () {
            canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            try {
                imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
                imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
                cordova.exec(
                    SaveSuccess,
                    SaveError,
                    'Canvas2ImagePlugin',
                    'saveImageDataToLibrary', [imageData]
                );
            } catch (e) {

                SaveError(e.message);
            }
        };
        try {
            img.src = url;
        } catch (e) {
            SaveError(e.message);

        }
    };

    $scope.reloadView = function () {
        ZMDataModel.zmLog("Reloading view for modal view, recomputing rand");
        $rootScope.modalRand = Math.floor((Math.random() * 100000) + 1);
        $scope.isModalActive = true;
    };

    $scope.scaleImage = function () {
        console.log("Switching image style");
        $scope.imageFit = !$scope.imageFit;
    };

    $scope.$on('$ionicView.enter', function () {



    });

    $scope.$on('$ionicView.leave', function () {
        console.log("**MODAL: Stopping modal timer");
        $scope.isModalActive = false;
        $interval.cancel(intervalModalHandle);
    });

    $scope.$on('$ionicView.unloaded', function () {
        $scope.isModalActive = false;
        console.log("**MODAL UNLOADED: Stopping modal timer");
        $interval.cancel(intervalModalHandle);

        //   console.log("Modal monitor left");
    });

    $scope.$on('modal.removed', function () {
        $scope.isModalActive = false;
        console.log("**MODAL REMOVED: Stopping modal timer");
        $interval.cancel(intervalModalHandle);

        // Execute action
    });


}]);


