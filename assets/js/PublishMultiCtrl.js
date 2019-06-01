goSua.controller('PublishMultiCtrl', ['$scope', '$filter', 'landings', 'LadiService',
    function ($scope, $filter, landings, LadiService) {

        vm = this;

        $scope.domains = [];

        $scope.landings = landings;

        $scope.pixel = {
            text: ""
        };

        if (landings && landings.length > 0) {
            angular.forEach(landings, l=> {
                // console.log(l.domain);
                $scope.domains.push((l.domain));
            })
        }

        vm.preConfirm = function(){
            return new Promise(function(resolve, reject){
                resolve({
                    domains: $scope.domains,
                    pixel: $scope.pixel.text,
                });
                // publishLanding()
                //     .then(resp => {
                //         console.log("complete: ", resp);
                //         resolve(resp)
                //     })
                //     .catch(err => {
                //         console.log("publish error: ", err);
                //         reject(err)
                //     });
            })
        };

    }]);