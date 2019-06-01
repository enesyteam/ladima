goSua.controller('PublishSingleCtrl', ['$q', '$http',  '$timeout', '$scope', '$filter', 'landing', 'token', 'LadiService',
    function ($q, $http, $timeout, $scope, $filter, landing, token, LadiService) {
        vm = this;

        $scope.domain = {
            text: ""
        };

        $scope.pixel = {
            text: ""
        };

        if (landing) {
            $scope.domain.text = landing.domain;
        }


        async function getLandingPageHtml() {
            $scope.isLoadingLandingData = true;

            LadiService.getLandingHtml(landing.domain)
                .then( data => {
                    // console.log("data", data);
                    if ( data && data.contents ) {
                        $timeout( () => {
                            $scope.$apply(function(){
                                $scope.isLoadingLandingData = false;
                                $scope.landingData = data.contents;
                                $scope.loadHtmlError = null;
                            })
                        } );
                    } else {
                        $timeout( () => {
                            $scope.$apply(function(){
                                $scope.isLoadingLandingData = false;
                                $scope.landingData = null;
                                $scope.loadHtmlError = true;
                            })
                        } )
                    }
                } )
                .catch()
        }

        //
        if (landing && landing.domain) {
            getLandingPageHtml();
        }

        // publish landing page;
        function publishLanding() {

            if ( !$scope.landingData || !$scope.domain.text || $scope.domain.text.length === 0 ) {
                alert("Không thể xuất bản Landing page.");
                return;
            }

            var landingHtml = "";

            if ($scope.pixel.text) {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString($scope.landingData, 'text/html');
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
                    ' fbq(\'init\', \'' + $scope.pixel.text  + '\'); \n' +
                    'fbq(\'track\', \'PageView\');\n';

                htmlDoc.getElementsByTagName('head')[0].appendChild(script);

                var noScript = htmlDoc.createElement("noscript");
                noScript.innerHTML = '<img height="1" width="1"' +
                'src="https://www.facebook.com/tr?id=' + $scope.pixel.text + ' &ev=PageView &noscript=1"/>';

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
            } else {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString($scope.landingData, 'text/html');

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
            }

            $scope.source.domain = $scope.domain.text;
            $scope.source.idpixel = $scope.pixel.text;

            // update source before publish
            // updateSource();
            LadiService.updateSource(landing.id, $scope.source, token);

            return LadiService.publishLanding(landing.id, landingHtml.documentElement.innerHTML, $scope.domain.text, token);
        }

        function getSource() {
            return LadiService.getSource(landing.id, token)
                .then(resp => {
                    var s = JSON.parse(resp.data.data.source);
                    if (s) {
                        $timeout( () => {
                            $scope.$apply(function(){
                                $scope.source = s;
                                $scope.pixel.text = s.idpixel;
                            })
                        } )
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }

        if (landing) {
            getSource();
        }

        // function updateSource() {
        //     if (!landing) return;
        //
        //     var publishReq = {
        //         method: 'PUT',
        //         url: 'https://api.ladipage.vn/v1/landingpage/updateSource',
        //         headers: {
        //             'Authorization': token,
        //         },
        //         data: {
        //             id: landing.id,
        //             source: JSON.stringify($scope.source),
        //         }
        //     };
        //
        //     return $http(publishReq)
        //         .then( resp => {
        //             console.log(resp);
        //             return resp;
        //         } )
        //         .catch( err => {
        //             console.log(err);
        //         } );
        // };

        vm.preConfirm = function(){
            return new Promise(function(resolve, reject){
                publishLanding()
                    .then(resp => {
                        console.log("complete: ", resp);
                        resolve(resp)
                    })
                    .catch(err => {
                        console.log("publish error: ", err);
                        reject(err)
                    });

            })
        };

        // function getFacebookPixelCode(idpixel) {
        //     var a = "";
        //     if (idpixel && idpixel.length > 0) {
        //         var b = [];
        //         if (b = idpixel.split(","), b && b.length > 0) {
        //             a += "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');";
        //             for (var c = 0; c < b.length; c++) b[c].length > 0 && (b[c] = $.trim(b[c]), a += "fbq('init','" + $.trim(b[c]) + "');");
        //             a += "fbq('track','PageView');", a += "fbq('track','ViewContent');", a += '</script> <noscript><img height="1" width="1" style="display:none"src="https://www.facebook.com/tr?id=' + $.trim(b[0]) + '&ev=PageView&noscript=1" /></noscript>';
        //         }
        //     }
        //     return a;
        // }

    }]);