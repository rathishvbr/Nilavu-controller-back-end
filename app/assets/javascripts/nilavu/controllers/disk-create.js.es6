import ModalFunctionality from 'nilavu/mixins/modal-functionality';
import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Controller.extend(ModalFunctionality, {

    format: /^[0-9]+$/,
    addDiskSpinner: false,
    storage: null,

    init: function() {
        this.set('diskMaxSize', parseInt(Nilavu.SiteSettings.max_disk_size));
    },

    diskCostChanged: function() {
        const storagePrice = (this.get('storage_hddtype') === "SSD")
            ? FilterProperties.byKey(this.get('model.price'), "ssd_cost_hour")
            : FilterProperties.byKey(this.get('model.price'), "hdd_cost_hour");
        this.set('storage', storagePrice  * this.get('size'));
    }.observes('size'),

    storage_hddtype: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "storage_hddtype");
    }.property('storage'),

    storageHourlyCost: function() {
        if (this.get('storage')) {
            return this.get('storage').toFixed(3);
        }
        return;
    }.property('storage'),

    allowedSize: function() {
        if (parseInt(this.get('size')) <= this.get('diskMaxSize')) {
            return true;
        }
        return false;
    }.property('size'),

    storageMonthCost: function() {
        if (this.get('storage')) {
            this.set('storageCost', this.get('storage') * 24 * 30 );
            this.set('storageCost', this.get('storage') * 24 * 30);
            return this.get('storageCost').toFixed(3);
        }
        return;
    }.property('storage'),

    submitDisabled: function() {
        if (this.get('sizeValidation.failed'))
            return true;

        return false;
    }.property('sizeValidation.failed'),

    getData() {
        return {
            id: " ",
            asm_id: this.get('model').id,
            account_id: this.get("account_id"),
            size: this.get("size") + " GB",
            status: "inprogress"
        };
    },

    sizeValidation: function() {
        if (Ember.isEmpty(this.get('size'))) {
            return Nilavu.InputValidation.create({failed: true});
        }

        if (!this.get('size').match(this.get('format'))) {
            return Nilavu.InputValidation.create({failed: true, reason: I18n.t('vm_management.disks.validate_error')});
        }

        if (parseInt(this.get('size')) > this.get('diskMaxSize')) {
            return Nilavu.InputValidation.create({
                failed: true,
                reason: I18n.t('vm_management.disks.validate_error_size') + this.get('diskMaxSize') + " GB"
            });
        }

    }.property('size', 'format'),

    actions: {
        submit: function() {
            var self = this;
            this.set('addDiskSpinner', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/disk/volume/create", {
                data: this.getData(),
                type: 'POST'
            }).then(function(result) {

                self.set('addDiskSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.disks.add_disk_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
                self.send("closeModal");
                window.location.reload();

            }).catch(function() {
                self.set('addDiskSpinner', false);
                // self.notificationMessages.error(I18n.t("vm_management.error"));
                self.send("closeModal");
            });
        }
    }

});
