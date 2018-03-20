export default Ember.Component.extend({

    hddStyle: "float: left",
    ssdStyle: "float: right",

    diskDisableHDD: function() {
        let HDD = 'HDD';
        this.set("ssdStyle", "float: right");
        this.set("hddStyle", "float: left");
        if (this.get('disableDisk') === HDD) {
         this.set('ssdStyle', 'float:center');
            return true;
        }
        return false;
    }.property("disableDisk"),

    diskDisableSSD: function() {
        let SSD = 'SSD';
        if (this.get('disableDisk') === SSD) {
         this.set('hddStyle', 'float:center');

            return true;
        }
        return false;
    }.property("disableDisk")
});
