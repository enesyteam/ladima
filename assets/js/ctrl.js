goSua.controller('MainCtrl', function(
		$rootScope, $scope, $location, $window, $filter, $http,
	$timeout, toastr, toastrConfig, $interval, $location, $state, $stateParams, sweetAlert ) {

    $scope.content = $stateParams.content;
    // $scope.detailPage = "detail-1.html";

    // switch($stateParams.content) {
    //     case "amulet1":
    //         console.log('will display page 1');
    //         break;
    //     default:
    // }
        //$rootScope.currentURL = $location.absUrl();
        $rootScope.title = 'Quản lý landing page';
        $rootScope.description = 'Quản lý Landing page hiệu quả nhất';
        $rootScope.ogImage = 'https://vietnammoi.vn/stores/news_dataimages/seovietnews/042018/27/10/3303_tu-vi-thu-hai-tu-vi-tuoi-ty-tu-vi-tuoi-dau-tu-vi-tuoi-suu-1-1.jpg';

	var configToastr = function() {
        toastrConfig.closeButton = false;
        toastrConfig.timeOut = 3000;
        toastrConfig.toastClass = 'notice';
        toastrConfig.containerId = 'global-notices';
        toastrConfig.iconClasses = {
            error: 'is-error',
            info: 'is-info',
            success: 'is-success',
            warning: 'is-warning'
          };
        // toastrConfig.positionClass = 'toast-top-right';
        toastrConfig.positionClass = "toast-bottom-right";
    };

    configToastr();

    function AlertError(c, d) {
        toastr.error(c, d)
    };

    function AlertSuccessful(c, d) {
        toastr.success(c, d)
    };

    $scope.getLandings = async function() {

        // get all collections
        var getCollectionsReq = {
            method: 'GET',
            url: 'https://api.ladipage.vn/v1/Collection/FindAllCol',
            headers: {
               'Authorization': $scope.token,
            }
        };

        $scope.collections = [];
        $scope.isLoadingCollections = true;

        await $http(getCollectionsReq)
            .then( resp => {
                // console.log(resp);
                if ( resp && resp.data && resp.data.data && resp.data.code === 200 ) {
                    $timeout( () => {
                        $scope.$apply(function(){
                            $scope.isLoadingCollections = false;
                            $scope.collections = resp.data.data;
                            $scope.error = null;
                        })
                    } )
                } else {
                    $timeout( () => {
                        $scope.$apply(function(){
                            $scope.isLoadingCollections = false;
                            $scope.error = resp.data.messager;
                        })
                    } )
                }
            } )
            .catch( err => {
                console.log(err);
            } );
    };

    // try to get token from url query

    if ( $location.search() && $location.search().token ) {
        $scope.token = $location.search().token;
        // load landing
        $scope.getLandings();
    }

    $rootScope.onTokenChange = function() {
        $location.search('token', $scope.token);
    };

    $rootScope.getToken = function () {
        sweetAlert.open({
            title: "Get token",
            htmlTemplate: "/pages/dialogs/get-token.html",
            confirmButtonText: 'Get token',
            showCancelButton: true,
            showCloseButton: true,
            allowOutsideClick: false,
            preConfirm: 'preConfirm',
            showLoaderOnConfirm: true,
            controller: 'GetTokenCtrl',
            controllerAs: 'vm',
        })
            .then(function(response){
                // console.log(response);
                if(response && !response.dismiss && response.value){

                    // console.log("publish success: ", response.value)
                    // if ( response.value && response.value. ) {
                    //
                    // }
                    if (response.value) {

                        if (response.value.data && response.value.data.data && response.value.data.data.token) {
                            $location.search('token', response.value.data.data.token);
                            $timeout( () => {
                                $scope.$apply(function(){
                                    $scope.token = response.value.data.data.token;
                                })
                            } )
                        }
                    } else {
                        sweetAlert.alert("Không thể lấy token.", {title: 'Lỗi!'})
                    }
                }
            })
            .catch(function(err){
                sweetAlert.alert("Không thể lấy token.", {title: 'Lỗi!'})
            });
    }


   });

