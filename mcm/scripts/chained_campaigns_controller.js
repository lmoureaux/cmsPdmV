angular.module('mcmApp').controller('chainedCampaignController',
  ['$scope', '$uibModal',
    function chainedCampaignController($scope, $uibModal) {

      $scope.columns = [
        { text: 'PrepId', select: true, db_name: 'prepid' },
        { text: 'Actions', select: true, db_name: '' },
        { text: 'Enabled', select: true, db_name: 'enabled' },
        { text: 'Campaigns', select: true, db_name: 'campaigns' }
      ];
      $scope.setDatabaseInfo('chained_campaigns', $scope.columns);

      $scope.toggleEnabled = function (prepid) {
        let prepids = prepid == 'selected' ? $scope.selectedItems : [prepid];
        let message = 'Are you sure you want to toggle enabled status of ' + $scope.promptPrepid(prepids) + '?';
        $scope.objectAction(message,
          prepids,
          {method: 'POST',
           url: 'restapi/' + $scope.database + '/toggle_enabled',
           data: {'prepid': prepids}});
      };

      $scope.openChainCreationModal = function () {
        const modal = $uibModal.open({
          templateUrl: "chainedCampaignCreateModal.html",
          controller: function ($scope, $uibModalInstance, $window, $http, errorModal) {
            $scope.pairs = [{ campaigns: [], flows: [], selectedCampaign: '', selectedFlow: { prepid: undefined } }]
            let promise = $http.get("search?db_name=campaigns&page=-1");
            promise.then(function (data) {
              $scope.pairs[0].campaigns = data.data.results.filter(campaign => campaign.root != 1).map(campaign => campaign.prepid);
            });
            $scope.updateFlow = function (index) {
              while ($scope.pairs.length > index + 1) {
                $scope.pairs.pop();
              }
              if ($scope.pairs[index].selectedFlow.prepid !== '') {
                $scope.pairs[index].campaigns = [$scope.pairs[index].selectedFlow.next];
                $scope.pairs[index].selectedCampaign = $scope.pairs[index].selectedFlow.next;
                $scope.updateCampaign(index);
              } else {
                $scope.pairs[index].selectedCampaign = '';
              }
            }
            $scope.updateCampaign = function (index) {
              while ($scope.pairs.length > index + 1) {
                $scope.pairs.pop()
              }
              let promise = $http.get("search?db_name=flows&page=-1&allowed_campaigns=" + $scope.pairs[index].selectedCampaign);
              promise.then(function (data) {
                let nextFlows = data.data.results.map(flow => { const x = { 'prepid': flow.prepid, 'next': flow.next_campaign }; return x });
                if (nextFlows.length > 0) {
                  nextFlows.unshift({ 'prepid': '', 'next': '' })
                  $scope.pairs.push({ campaigns: [], flows: [], selectedCampaign: '', selectedFlow: nextFlows[0] })
                  $scope.pairs[index + 1].flows = nextFlows;
                }
              });
            }
            $scope.save = function () {
              $scope.pairs = $scope.pairs.filter(pair => pair.selectedCampaign && pair.selectedCampaign !== '')
              let campaigns = $scope.pairs.map(pair => { const x = [pair.selectedCampaign, pair.selectedFlow.prepid]; return x; })
              $http({ method: 'PUT', url: 'restapi/chained_campaigns/save/', data: { 'campaigns': campaigns } }).then(function (data) {
                if (data.data.results) {
                  $window.location.href = 'chained_campaigns?prepid=' + data.data.prepid;
                } else {
                  errorModal(data.data.prepid, data.data.message);
                }
              }, function (data) {
                errorModal(data.data.prepid, data.data.message);
              });
            };
            $scope.close = function () {
              $uibModalInstance.dismiss();
            }
          },
          resolve: {
            errorModal: function () { return $scope.openErrorModal; },
          }
        });
      };
    }
  ]
);
