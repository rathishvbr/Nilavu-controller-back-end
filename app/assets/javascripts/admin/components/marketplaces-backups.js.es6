import {buildMarketplacesPanel} from 'admin/components/marketplaces-panel';
export default buildMarketplacesPanel('backups', {
  tagName: 'tr' ,

  _init: function() {
      this.getUserData();
  }.on('init'),

  getUserData: function() {
    var self=this;

    return Nilavu.ajax('/admin/backups', {
      type:'GET'
    }).then(function(result) {
      if(result.message){
        self.set("backupData",result.message.backups_all);
      }

      return result;
  });

  },

});
