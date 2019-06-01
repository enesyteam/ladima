(function () {
    'use strict';

    angular.module('mFirebase', ['firebase']);

    angular.module('mFirebase')
        .service('MFirebaseService', ["$http", '$q', "$timeout", 'firebase',
            function ($http, $q, $timeout, firebase) {
				var addOrder = function( orderData ) {
					return new Promise(function (resolve, reject) {
                        firebase.database().ref().child('orders').push(orderData)
                            .then(function (response) {
                                resolve('Đặt hàng thành công');
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                    })
				}

				return {
					addOrder: addOrder,

				}
            }
        ]);
}());
