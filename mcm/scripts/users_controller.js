angular.module('testApp').controller('resultsCtrl',
  ['$scope','$http', '$location', '$window',
  function resultsCtrl($scope, $http, $location, $window){
    $scope.dataColumns = [
      {text:'UserName', select:true, db_name:'username'},
      {text:'Full name', select:true, db_name:'fullname'},
      {text:'Actions', select:false, db_name:''},
      {text:'Email', select:false, db_name:'email'},
      {text:'Role', select:true, db_name:'role'},
      {text:'Pwg', select:true, db_name:'pwg'}
    ];

    $scope.update = [];
    $scope.all_pwgs = [];

    if ($location.search()["db_name"] === undefined){
      $scope.dbName = "users";
    }else{
      $scope.dbName = $location.search()["db_name"];
    }

    $scope.sort = {
      column: 'value.username',
      descending: false
    };

    $scope.selectedCls = function(column) {
      return column == $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    $scope.changeSorting = function(column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      }else{
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.$watch(function() {
      var loc_dict = $location.search();
      return "page" + loc_dict["page"] + "limit" +  loc_dict["limit"];
    },
    function(){
      $scope.getData($scope);
      $scope.selected_prepids = [];
    });

    $scope.askrole = function(pwg){
      var promise = $http.get("restapi/users/ask_role/"+pwg);
      promise.then(function(data, status){
        $scope.update["success"] = true;
        $scope.update["fail"] = false;
        $scope.update["status_code"] = data.status;
        $scope.update["results"] = data.data.results;
        $scope.getData($scope);
      },function(data, status){
        $scope.update["success"] = false;
        $scope.update["fail"] = true;
        $scope.update["status_code"] = data.status;
      });
    };

    $scope.changeRole = function(username,step){
      var promise = $http.get("restapi/users/change_role/"+username+"/"+step);
      promise.then(function(data, status){
        $scope.update["success"] = true;
        $scope.update["fail"] = false;
        $scope.update["status_code"] = data.status;
        $scope.update["results"] = data.data.results;
        $scope.getData($scope);
      },function(data, status){
        $scope.update["success"] = false;
        $scope.update["fail"] = true;
        $scope.update["status_code"] = data.status;
      });
    };

    $scope.addMe = function(){
      var promise = $http.get("restapi/users/add_role");
      promise.then(function(data, status){
        $scope.update["success"] = true;
        $scope.update["fail"] = false;
        $scope.update["status_code"] = data.status;
        $scope.getData($scope);
      },function(data, status){
        $scope.update["success"] = false;
        $scope.update["fail"] = true;
        $scope.update["status_code"] = data.status;
      });
    };
  }
  ]);
angular.module('testApp').controller('ModalDemoCtrl',
  ['$scope', '$modal', '$http',
  function ModalDemoCtrl($scope, $modal, $http) {
    $scope.openPwgNotify = function (pwg) {
      $modal.open( {
        templateUrl: 'pwgNotifyModal.html',
          controller: ModalPwgNotifyInstanceCtrl,
          resolve: {
            pwg: function() {
              return pwg;
            }
          }
        }
      );
    };

    function createPwgModal() {
      var pwgModalInst = $modal.open({
        templateUrl: 'pwgModalSelect.html',
        controller: ModalPwgSelectInstanceCtrl,
        resolve: {
          all_pwgs: function(){
            return $scope.all_pwgs;
          },
          newPWG: function(){
            return $scope.newPWG;
          }
        }
      });
      pwgModalInst.result.then(function (newPWG) {
        if(newPWG != "------") {
          $scope.askrole(newPWG);
        }
      });
    }

    $scope.openPwgModal = function(curr_pwgs)
    {
      $scope.newPWG = "------";
      if ($scope.all_pwgs.length == 0)
      {
        var promise = $http.get("restapi/users/get_pwg")
        promise.then(function(data){
          $scope.all_pwgs = _.difference(data.data.results, curr_pwgs);
          $scope.all_pwgs.splice(0,0,"------");
          $scope.newPWG = $scope.all_pwgs[0];
            createPwgModal()
        });
      }
      else
      {
        $scope.newPWG = $scope.all_pwgs[0];
          createPwgModal();
      }
    };

    var ModalPwgNotifyInstanceCtrl = function($scope, $modalInstance, $http, pwg) {
      $scope.pwg = pwg;
      $scope.mail = {
              mailContent: "",
              mailSubject: ""
          };
      $scope.notify = function () {
          if(!$scope.mail.mailContent.length && !$scope.mail.mailSubject.length) {
              alert("Cannot send empty message with empty subject");
              return;
          }
          $http({method: 'PUT', url:'restapi/users/notify_pwg', data:{pwg: $scope.pwg, subject:$scope.mailSubject, content: $scope.mailContent}})
              .success(function(data, status){
                  alert("Notification sent");
              }).error(function(data,status){
                  alert("Error:"+ status);
              });
          $modalInstance.close();
    };

      $scope.close = function() {
          $modalInstance.dismiss();
      }
    };

    var ModalPwgSelectInstanceCtrl = function($scope, $modalInstance, $http, all_pwgs, newPWG) {
      $scope.all_pwgs = all_pwgs;
      $scope.selected = {newPWG: newPWG};

      $scope.select = function () {
        $modalInstance.close($scope.selected.newPWG);
      };

      $scope.close = function() {
        $modalInstance.dismiss();
      };
    }
}
]);
