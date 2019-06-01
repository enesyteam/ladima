(function() {
    'use strict';

    angular.module('mLadipage', []);

    angular.module('mLadipage')
        .service('LadiService', ["$http", "$timeout", function($http, $timeout) {

            var login = function (email, password) {
                return new Promise( (resolve, reject) => {
                    var getSourceReq = {
                        method: 'POST',
                        url: 'https://api.ladipage.vn/v1/auth/sign-in',
                        data: {
                            email: email,
                            password: password,
                        }
                    };

                    $http(getSourceReq)
                        .then( resp => {
                            console.log("resp", resp);
                            if (resp && resp.data && resp.data.code === 200) {
                                resolve(resp);
                            } else {
                                reject({
                                    error: true
                                });
                            }

                            // return resp;
                        } )
                        .catch( err => {
                            reject(err);
                        } );
                })
            };

            var getSource = function (id, token) {
                return new Promise( (resolve, reject) => {
                    var getSourceReq = {
                        method: 'GET',
                        url: 'https://api.ladipage.vn/v1/landingpage/source?id=' + id,
                        headers: {
                            'Authorization': token,
                        },
                    };

                    $http(getSourceReq)
                        .then( resp => {
                            if (resp && resp.data && resp.data.code === 200) {
                                resolve(resp);
                            }
                            // return resp;
                        } )
                        .catch( err => {
                            reject(err);
                        } );
                });
            };

            var updateSource = function (id, source, token) {
                return new Promise( (resolve, reject) => {
                    var updateSourceReq = {
                        method: 'PUT',
                        url: 'https://api.ladipage.vn/v1/landingpage/updateSource',
                        headers: {
                            'Authorization': token,
                        },
                        data: {
                            id: id,
                            source: JSON.stringify(source),
                        }
                    };

                    $http(updateSourceReq)
                        .then( resp => {
                            resolve(resp);
                        } )
                        .catch( err => {
                            reject(err);
                        } );
                })
            };

            var publishLanding = function (id, html, domain, token) {
                return new Promise( (resolve, reject) => {
                    var publishReq = {
                        method: 'PUT',
                        url: 'https://api.ladipage.vn/v1/Landingpage/publish',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        transformRequest: function(obj) {
                            var str = [];
                            for(var p in obj)
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                        data: {
                            id: id,
                            html: html,
                            domain: domain,
                        }
                    };

                    $http(publishReq)
                        .then( resp => {
                            resolve(resp);
                        } )
                        .catch( err => {
                            reject(err);
                        } );
                })
            };

            var getLandingHtml = function (domain) {
                return new Promise( (resolve, reject) => {
                    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('http://'+domain)}`)
                        .then(response => {
                            // console.log("response", response);
                            if (response.ok) {
                                resolve(response.json())
                            } else {
                                reject(true)
                            }
                        })
                } )
            };

            var editLandingHtml = function (oldHtml, newPixel) {

                if (!newPixel || newPixel.length === 0) {
                    var parser = new DOMParser();
                    var htmlDoc = parser.parseFromString(oldHtml, 'text/html');

                    // override css
                    var css = '.ladi-wraper-page { height: auto !important; }',
                        head = htmlDoc.head || htmlDoc.getElementsByTagName('head')[0],
                        style = htmlDoc.createElement('style');

                    head.appendChild(style);

                    style.type = 'text/css';
                    if (style.styleSheet){
                      // This is required for IE8 and below.
                      style.styleSheet.cssText = css;
                    } else {
                      style.appendChild(htmlDoc.createTextNode(css));
                    }

                    return new Promise( (resolve, reject) => {
                        resolve(htmlDoc.documentElement.innerHTML)
                    } )
                }

                var landingHtml = "";

                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(oldHtml, 'text/html');
                // remove all old pixel code
                var oldScripts = htmlDoc.scripts;
                var noscript = htmlDoc.getElementsByTagName('noscript');
                var head = htmlDoc.getElementsByTagName('head')[0];

                if (oldScripts && oldScripts.length > 0) {
                    for (var i = 0; i < oldScripts.length; i++) {
                        var html = oldScripts[i].innerHTML;
                        if (html.indexOf("fbq('init'") > -1) {
                            console.log("remove: ", i);
                            oldScripts[i].parentNode.removeChild(oldScripts[i]);
                        }
                    }
                }

                if (noscript && noscript.length > 0) {
                    for (var i = 0; i < noscript.length; i++) {
                        var xxx = noscript[i].innerHTML;
                        // console.log("noscript[i]", noscript[i]);
                        if (xxx.indexOf("facebook.com") > -1) {
                            console.log("need remove noscript");
                            head.removeChild(noscript[i]);
                        }
                    }
                }

                var images = htmlDoc.getElementsByTagName('img');
                for (var i = 0; i < images.length; i++) {
                    var img = images[i];
                    if (img.src.indexOf('www.facebook.com/tr?') > 0) {
                        console.log("img", img);
                        var link = img;
                        img.parentNode.removeChild(img);
                    }
                }

                var script = htmlDoc.createElement("script");
                script.innerHTML=
                    '!function(f,b,e,v,n,t,s)\n' +
                    '{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n' +
                    'n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n' +
                    'if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';\n' +
                    'n.queue=[];t=b.createElement(e);t.async=!0;\n' +
                    't.src=v;s=b.getElementsByTagName(e)[0];\n' +
                    's.parentNode.insertBefore(t,s)}(window,document,\'script\',\n' +
                    '\'https://connect.facebook.net/en_US/fbevents.js\');\n' +
                    ' fbq(\'init\', \'' + newPixel  + '\'); \n' +
                    'fbq(\'track\', \'PageView\');\n';

                htmlDoc.getElementsByTagName('head')[0].appendChild(script);

                var noScript = htmlDoc.createElement("noscript");
                noScript.innerHTML = '<img height="1" width="1"' +
                    'src="https://www.facebook.com/tr?id=' + newPixel + ' &ev=PageView &noscript=1"/>';

                htmlDoc.getElementsByTagName('head')[0].appendChild(noScript);

                // override css
                var css = '.ladi-wraper-page { height: auto !important; }',
                    head = htmlDoc.head || htmlDoc.getElementsByTagName('head')[0],
                    style = htmlDoc.createElement('style');

                head.appendChild(style);

                style.type = 'text/css';
                if (style.styleSheet){
                  // This is required for IE8 and below.
                  style.styleSheet.cssText = css;
                } else {
                  style.appendChild(htmlDoc.createTextNode(css));
                }

                landingHtml = htmlDoc;

                return new Promise( (resolve, reject) => {
                    resolve(landingHtml.documentElement.innerHTML)
                } )
            };

            return {
                login: login,
                publishLanding: publishLanding,
                getLandingHtml: getLandingHtml,
                getSource: getSource,
                updateSource: updateSource,
                editLandingHtml: editLandingHtml,
            }

        }]);
}());