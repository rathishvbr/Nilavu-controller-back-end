/**
  Handles routes for admin reports

  @class AdminReportsRoute
  @extends Nilavu.Route
  @namespace Nilavu
  @module Nilavu
**/
export default Nilavu.Route.extend({
  model: function(params) {
    const Report = require('admin/models/report').default;
    return Report.find(params.type);
  },

  setupController: function(controller, model) {
   let d = new Date();
   controller.setProperties({
      model: model,
      categoryId: 'all',
      startDate: moment(d.setMonth(d.getMonth() - 1)).format('YYYY-MM-DD'),
      endDate: moment(model.get('end_date')).format('YYYY-MM-DD')
    });
  }
});
