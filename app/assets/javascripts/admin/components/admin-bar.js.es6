import loadScript from 'nilavu/lib/load-script';

export default Ember.Component.extend({
  tagName: 'canvas',
  refreshChart(){
    const ctx = this.$()[0].getContext("2d");
    const rawData = this.get("popular_vitual_machine");
    var data = {
        labels: rawData.map(r => r.x.split(".")[2]),
        datasets: [
            {
                label: "Platforms",
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                data: rawData.map(r => r.y),
            }
        ]
    };

    const config = {
     type: 'bar',
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
