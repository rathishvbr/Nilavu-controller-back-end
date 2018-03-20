import ModalFunctionality from 'nilavu/mixins/modal-functionality';
import {observes} from 'ember-addons/ember-computed-decorators';
import {extractError} from 'nilavu/lib/ajax-error';

export default Ember.Controller.extend(ModalFunctionality, {
    selectedTab: null,
    saving: false,
    panels: null,
    loading: false,
    editLaunching: false,
    isVirtualMachine: false,
    gotoSummarize: false,
    summarizeButtonVisible: true,
    summarizeVisible: true,
    cooking: false,
    canStepThree: false,
    canStepTwo: false,
    stepTwo: null,
    stepTwoStyle: "step-disable",
    stepThreeStyle: "step-disable",
    _initPanels: function() {
        this.set('panels', []);
    }.on('init'),

    marketplaceItemSelected: function() {
        return Em.isEmpty(this.get("selectedItem"));
    }.property('selectedItem'),

    generalSelected: function() {
        return this.selectedTab === 'general';
    }.property('selectedTab'),

    //hidden nextSummarize button~
    selectionSelected: function() {
        return this.selectedTab === 'selection';
    }.property('selectedTab'),

    @observes('summarizeVisible')setSummarizeButtonValue: function() {
        this.set('selectionSelected', this.get('summarizeVisible'));
    },

    summarySelected: function() {
        return this.selectedTab === 'summary';
    }.property('selectedTab'),

    category: Ember.computed.alias('model.metaData'),
    selectedItem: Ember.computed.alias('marketplaceItem'),

    onShow() {
        this.changeSize();
        this.titleChanged();
    },

    hidemeClass: function() {
        if (Em.isEmpty(this.get("selectedItem"))) {
            return "hideme steps";
        } else {
            return "steps";
        }
    }.property(),

    changeSize: function() {
        if (this.get('selectionSelected') && (!this.get('isVirtualMachine'))) {
            this.set('controllers.modal.modalClass', 'edit-category-modal full');
        } else if (this.get('selectionSelected')) {
            this.set('controllers.modal.modalClass', 'edit-category-modal full');
        } else if (this.get('generalSelected')) {
            //$('.firstStep').slideToggle('fast');
            this.set('controllers.modal.modalClass', 'edit-category-modal full');
        } else {
            this.set('controllers.modal.modalClass', 'edit-category-modal full');
        }
    }.observes('isVirtualMachine', 'generalSelected', 'selectionSelected', 'summarySelected'),

    titleChanged: function() {
        this.set('controllers.modal.title', this.get('title'));
    }.observes('title'),

    resetForm() {
        if (this.get('category')) {}
    },

    title: function() {
        const option = this.get('category.launchoption');
        if (this.get('generalSelected') && (this.get('isVirtualMachine'))) {
            return I18n.t("launcher.title");
        } else if (this.get('selectionSelected')) {
            if (option === 'virtualmachines') {
                return I18n.t("launcher.selection_machine_title");
            } else {
                return I18n.t("launcher.selection_application_title");
            }
        } else if (this.get('summarySelected')) {
            return I18n.t("launcher.summary_title");
        }
        return I18n.t("launcher.title");
    }.property('selectionSelected', 'summarySelected', 'category.launchoption'),

    launchOption: function() {
        const option = this.get('category.launchOption') || "";
        return option.trim().length > 0
            ? option
            : I18n.t("launchoption.default");
    }.property('category.launchOption'),

    launchableChanged: function() {
        if ((this.get('launchOption') == "virtualmachines")) {
            this.set("stepTwoStyle", "step-disable");
            this.set("stepThreeStyle", "step-disable");

        }
        this.set('category.launchoption', this.get('launchOption'));
        if (this.get('launchOption').trim().length > 0) {
            const isVM = Ember.isEqual(this.get('launchOption').trim(), I18n.t('launcher.virtualmachines'));
            this.set('isVirtualMachine', isVM);
        }
        this.set('selectedTab', 'general');
        if (!this.editLaunching) {
            $(".hideme").slideToggle(250);
            this.toggleProperty('editLaunching');
        }
    }.observes('launchOption'),

    setLaunchable: function() {
        this.set('launchOption', this.get('selectedItemOption'));
    }.observes('selectedItemOption'),

    cookingChanged: function() {
        const launchable = this.get('launchOption') || "";
        this.set('category.launchoption', launchable);
        if (launchable.trim().length > 0) {
            this.set('selectedTab', 'selection');
            this.set('selecting', true);
            // $('.firstStep').slideToggle('fast');
        }
    }.observes('cooking'),

    summarizingChanged: function() {
        this.set('selectedTab', 'summary');
        this.set('selecting', false);
    }.observes('summarizing'),

    versionChanged: function() {
        const versionable = this.get('category.versionoption') || "";
        let versionEntered = (versionable.trim().length > 0);

        if (Ember.isEmpty(versionable)) {
            this.set('stepTwo', true);
            this.set('selecting', false);
        }
        if (this.get('selecting') || versionEntered) {
            this.set('stepTwo', false);
            this.set('selecting', false);
        }
    }.observes('category.versionoption'),

    summarizingChanging: function() {
        if (this.get('summarizing')) {
            if (this.get('category.keypairoption') && this.get('category.keypairnameoption') && !this.get('stepTwo')) {
                this.set('selecting', false);
            } else if (this.get('category.keypairoption') && !(this.get('category.keypairnameoption'))) {

                this.set('selecting', true);

            } else if (!this.get('category.bitnamiPassword')) {
                this.set('selecting', true);
            } else if (!this.get('category.network')) {
                this.set('selecting', true);
            } else {
                //  this.notificationMessages.info(I18n.t('launcher.required_sshkey_missing'));
            }
        }
    }.observes('category.keypairoption', 'category.keypairnameoption', 'stepTwo', 'checkingActivate', 'category.bitnamiPassword', 'category.network'),


    disabled: function() {

        if (this.get('saving') || this.get('selecting')) {
            return true;
        }
        if (!this.get('category.unitoption')) {
            return true;
        }
        if (!this.get('category.bitnamiPassword')) {
            return true;
        }
        if (!this.get('category.validation')) {
            return true;
        }
        if (!this.get('category.versionoption') && this.get('category.launchoption') == "virtualmachines") {
            return true;
        }
        if (!this.get('category.rootpasswordValidation')) {
            return true;
        }
        if (!this.get('category.networks')) {
            return true;
        }

        return false;
    }.property('saving', 'selecting', 'category.unitoption', 'category.keypairoption', 'category.bitnamiPassword', 'category.validation', 'category.versionoption', 'category.rootpasswordValidation', 'category.networks'),

    categoryName: function() {
        const name = this.get('name') || "";
        return name.trim().length > 0
            ? name
            : I18n.t("preview");
    }.property('name'),

    stepStyleForStepTwo: function() {
        this.set("stepTwoStyle", " ");
    }.observes('canStepTwo'),

    stepStyleForStepThree: function() {
        this.set("stepThreeStyle", " ");
    }.observes('canStepThree'),

    saveLabel: function() {
        if (this.get('saving'))
            return I18n.t("launcher.saving");

        if (this.get('summarySelected'))
            return I18n.t("launcher.launch");

        if (this.get('generalSelected') || this.get('selectionSelected'))
            return I18n.t("launcher.selecting");

        return I18n.t("launcher.launch");
    }.property('saving', 'generalSelected', 'selectionSelected', 'summarySelected'),

    shrink() {
        this.close();
    },

    close() {
        this.setProperties({model: null});
    },

    @observes('gotoSummarize')gotoSummarizePage: function() {
        this.set('stepTwo', false);
        this.send('nextSummarize');
    },

    actions: {
        nextCategory() {
            this.set('loading', true);
            const model = this.get('model');
            return Nilavu.ajax("/launchables/pools/" + this.get('category.launchoption') + ".json").then(result => {
                model.metaData.setProperties({cooking: result});
                this.setProperties({selecting: false, stepTwo: true, loading: false});
                this.toggleProperty('cooking');
                this.toggleProperty('canStepTwo');
            });
        },

        nextSummarize() {
            this.set('loading', true);
            this.set('summarizing', false);
            const model = this.get('model');
            const step_two = this.get('stepTwo');
            return Nilavu.ajax("/launchables/summary.json").then(result => {
                model.metaData.setProperties({summarizing: result});
                this.setProperties({summarizing: true, stepTwo: step_two, selecting: true, loading: false});
                this.toggleProperty('canStepThree');
            });
        },

        saveCategory() {
            const self = this;

            self.set('saving', true);

            this.get('model').save().then(function(result) {
                self.set('saving', false);
                self.send('closeModal');

                //1.During a single launch we will have an id like ASM0001, so we split it up to see ASM001
                //2.During 1+ launch we will have an id like ASM0001|ASM0002, so we split it up [ASM001, ASM002]
                //In both cases we create topic models and show the last topic as predepolying.
                if (result.id) {
                    const slugId = result.id.split('|');
                    const slugsId = result.asms_id.split('|');

                    const slugs = slugId.map(function(item, idx) {
                        return self.store.createRecord('topic', {
                            id: item,
                            asms_id: slugsId[idx]
                        });
                    });

                    const slug = slugs.get('firstObject');
                    const id = slugId.get('firstObject');

                    slug.reload().then(function() {
                        self.replaceWith('/t/' + slug.asms_id + '/' + id, slug);
                        slugId.forEach((id) => self.notificationMessages.success(I18n.t('launcher.launched') + " " + id));
                    }).catch(function() {
                        slugId.forEach((id) => self.notificationMessages.warning(I18n.t('vm_management.topic_load_error') + " " + id));
                    });
                } else {
                    if (result.error) {
                        self.notificationMessages.error(result.error);
                    } else {
                        self.notificationMessages.error(I18n.t('launcher.not_launched'));
                    }
                    window.location.reload();
                }

            }).catch(function(error) {
                self.flash(extractError(error), 'error');
                self.set('saving', false);
                self.send('closeModal');
                window.location.reload();
                self.notificationMessages.error(I18n.t('launcher.not_launched'));
            }). finally(function() {
                self.shrink();
            });

        }
    }

});
