import loadScript from 'nilavu/lib/load-script';

export default Ember.Component.extend({
  tagName: 'canvas',
  refreshChart(){
    const ctx = this.$()[0].getContext("2d");
    const model = this.get("model");
    const rawData = this.get("rowvalues");
    const empty_check = (rawData == undefined || this.get("rowvalues").length == 0) ;
    var data = {
      labels: empty_check ? [] : rawData.map(r => r.x),
      datasets: [{
        data: empty_check ? [] : rawData.map(r => r.y),
        // label: model.get('title'),
        label: model.title,
        backgroundColor: "#a3e1d4",
        borderColor: "#28b89a"
      }]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
       legend: {
          display: false,
             },
        responsive: true,
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0
            }
          }]
        }
      },
    };

    this._chart = new window.Chart(ctx, config);
  },

  didInsertElement(){
    loadScript("/javascripts/Chart.min.js").then(() => this.refreshChart.apply(this));
  }
});
