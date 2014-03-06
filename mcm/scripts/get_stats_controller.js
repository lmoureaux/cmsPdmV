function resultsCtrl($scope, $http, $location, $window){
    $scope.allRequestData=[];
    $scope.requests = {};

    $scope.requests.selections=['prepid', 'priority', 'pwg'];
    $scope.requests.options={grouping:['member_of_campaign'], value:"total_events", stacking:[], coloring:"status" };
    $scope.requests.settings={duration:1000, legend:true, sort:true};
    $scope.requests.radio={'scale':["linear","log"], 'operation':["sum", "count"]};

    var prepid = $location.search()["prepid"];

    $scope.get_stats = function(){
        var promise;
        if(prepid != undefined){
            promise = $http.get("restapi/dashboard/get_stats_new/"+prepid);
        }else{
            promise = $http.get("restapi/dashboard/get_stats_new/all");
        }

        promise.then(function(data){
            $scope.allRequestData = data.data.results;
        }, function(){
            alert("Error getting requests");
        });
    };
    $scope.get_stats();
};