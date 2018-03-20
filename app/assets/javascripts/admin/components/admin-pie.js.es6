import loadScript from 'nilavu/lib/load-script';

export default Ember.Component.extend({
  tagName: 'canvas',
  refreshChart(){
    const ctx = this.$()[0].getContext("2d");
    const rawData = this.get("popularapps");

    var data = {
        labels: rawData.map(r => r.x.split(".")[2]),
        datasets: [
            {
                data: rawData.map(r => r.y),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#2ecc71",
                    "#ebe0ff"

                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#2ecc71",
                    "#ebe0ff"



                ]
            }]
    };

    const config = {
     type: 'pie',
      data: data,
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            display: false,
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
