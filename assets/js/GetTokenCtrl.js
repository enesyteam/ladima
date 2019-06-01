goSua.controller('GetTokenCtrl', ['$scope', '$filter', 'LadiService',
    function ($scope, $filter, LadiService) {
        vm = this;

        $scope.loginData = {
            email: "",
            password: ""
        };

        vm.preConfirm = function(){
            // console.log('$scope.loginData', $scope.loginData);
            return new Promise(function(resolve, reject){
                if ( !$scope.loginData.email || !$scope.loginData.password || $scope.loginData.email.length === 0 || $scope.loginData.password.length === 0) {
                    reject({error: "Không thể lấy token"});
                    return;
                }
                return LadiService.login($scope.loginData.email, $scope.loginData.password)
                    .then(resp => {
                        resolve(resp);
                    })
                    .catch(err => {
                        console.log(err);
                        reject({error: "Không thể lấy token"});
                    })
            })
        };

    }]);