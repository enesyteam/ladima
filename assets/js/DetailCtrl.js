goSua.controller('DetailCtrl', function( $rootScope, $scope, $http, $window, $document, $filter, $stateParams,
	$timeout,toastr, toastrConfig, $interval, $location, $uibModal, $uibModalStack, sweetAlert, LadiService ) {

    $scope.landings = [];

    if ( $stateParams.colId ) {
        $rootScope.currenCollectionId = $stateParams.colId;
        // get all collections
        var getCollectionReq = {
            method: 'POST',
            url: 'https://api.ladipage.vn/v1/Landingpage/FindByCollection',
            headers: {
                'Authorization': $scope.token,
            },
            data: {
                coid: $stateParams.colId,
                is_publish: "",
                limit: 100,
                name: "",
            }
        };

        $scope.landings = [];
        $scope.isLoadingLandings = true;

        $http(getCollectionReq)
            .then( resp => {
                if ( resp && resp.data && resp.data.data && resp.data.code === 200 ) {
                    $timeout( () => {
                        $scope.$apply(function(){
                            $scope.isLoadingLandings = false;
                            $scope.landings = resp.data.data;
                            $scope.error = null;
                        })
                    } )
                } else {
                    $timeout( () => {
                        $scope.$apply(function(){
                            $scope.isLoadingLandings = false;
                            $scope.error = resp.data.messager;
                        })
                    } )
                }
            } )
            .catch( err => {
                console.log(err);
            } );
    }

    $scope.getCollectionById = function(id){
        return $filter("filter")($scope.collections, {
            id: id
        })[0];
    }

    $scope.publishLanding = function (landing) {
        if ( landing.is_publish !== "1" ) {
            alert("Truy cập Ladipage.vn và xuất bản trang với domain: demo.pagedemo.me/... trước khi sử dụng");
            return;
        }

        sweetAlert.open({
            title: landing.name || "Untitled",
            htmlTemplate: "/pages/dialogs/publish-landing.html",
            confirmButtonText: 'Xuất bản',
            showCancelButton: true,
            showCloseButton: true,
            allowOutsideClick: false,
            preConfirm: 'preConfirm',
            showLoaderOnConfirm: true,
            controller: 'PublishSingleCtrl',
            controllerAs: 'vm',
            resolve: {
                landing: function() {
                    return landing;
                },
                token: function () {
                    return $scope.token;
                }
            }
        })
            .then(function(response){
                // console.log(response);
                if(response && !response.dismiss && response.value){
                    // console.log("publish success: ", response.value)
                    if (response.value.data && response.value.data.data) {
                        // console.log("new domain: ", response.value.data.data);
                        angular.forEach($scope.landings, function(item) {
                            if (item.id === landing.id) {
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        item.domain = response.value.data.data;
                                    })
                                }, 100);
                                sweetAlert.success('Xuất bản thành công!')
                            }
                        });
                    } else {
                        sweetAlert.alert("Đã có lỗi xảy ra khi xuất bản landing page", {title: 'Lỗi!'})
                    }
                }
            })
            .catch(function(err){
                console.log("publish error: ", err);
            });
    };

    $scope.publishMulti = function () {
        if (!$scope.selected || $scope.selected.length === 0) {
            return;
        }

        sweetAlert.open({
            title: "Xuất bản Landingpages",
            htmlTemplate: "/pages/dialogs/publish-landings.html",
            confirmButtonText: 'Xuất bản',
            showCancelButton: true,
            showCloseButton: true,
            allowOutsideClick: false,
            preConfirm: 'preConfirm',
            showLoaderOnConfirm: true,
            controller: 'PublishMultiCtrl',
            controllerAs: 'vm',
            resolve: {
                landings: function() {
                    return $scope.selected;
                },
            }
        })
            .then(function(response){
                if (response && response.value && response.value.domains) {
                    if ( response.value.domains.length === $scope.selected.length ) {

                        var i = 0;

                        angular.forEach ($scope.selected, ll => {
                            angular.forEach($scope.landings, la => {
                                if ( la.id === ll.id ) {
                                    la.publishing = true;
                                }
                            });

                            // update source i
                            LadiService.getSource(ll.id, $scope.token)
                                .then( source => {
                                    // console.log(source);
                                    var s = JSON.parse(source.data.data.source);
                                    console.log("s", s);
                                    // get landing html
                                    LadiService.getLandingHtml(ll.domain)
                                        .then( data => {
                                            // console.log("data", data);
                                            if ( data && data.contents ) {
                                                LadiService.editLandingHtml(data.contents, response.value.pixel)
                                                    .then( newHtml => {
                                                        // console.log("newHtml", newHtml);

                                                        // update source
                                                        if (response.value.pixel && response.value.pixel.length > 0) {
                                                            s.idpixel = response.value.pixel;
                                                        }
                                                        s.domain = response.value.domains[$scope.selected.indexOf(ll)]; // response.value.domains[i];
                                                        console.log("source.domain", s.domain);

                                                        LadiService.updateSource(ll.id, s, $scope.token)
                                                            .then( res => {
                                                                // publish this landing
                                                                LadiService.publishLanding(ll.id, newHtml, s.domain, $scope.token)
                                                                    .then( finalRes => {
                                                                        $timeout(function() {
                                                                            angular.forEach($scope.landings, la => {
                                                                                if ( la.id === ll.id ) {
                                                                                    la.publishing = false;
                                                                                    la.domain = s.domain;
                                                                                }
                                                                            });
                                                                        }, 100);
                                                                    } )
                                                                    .catch()
                                                            } )
                                                            .catch()
                                                    } )
                                                    .catch()
                                            } else {

                                            }
                                        } )
                                        .catch()
                                } )
                                .catch()

                        })

                        i++;
                    }
                }
            })
            .catch(function(err){
                console.log("publish error: ", err);
            });
    };

    $scope.isAllSelected = false;

    $scope.toggleAll = function() {
        $scope.isAllSelected = !$scope.isAllSelected;
        angular.forEach($scope.landings, function(itm){
            if ( itm.is_publish === "1" ) {
                itm.selected = $scope.isAllSelected;
            }
        });

        $scope.selected = getSelectedLandings();
    };

    $scope.toggledSelection = function(){
        $scope.isAllSelected = angular.forEach($scope.landings, function(itm){
            if ( itm.is_publish === "1" ) {
                if (itm.selected !== true) {
                    return false;
                }
            }
            return true;
        });

        $scope.selected = getSelectedLandings();
    };

    function getSelectedLandings() {
        return $scope.landings.filter( m => m.selected === true )
    }

} );