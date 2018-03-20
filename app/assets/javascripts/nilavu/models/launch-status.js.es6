import computed from 'ember-addons/ember-computed-decorators';
import RestModel from 'nilavu/models/rest';

const LaunchStatusTypes = {
    LAUNCHING: 'LAUNCHING',
    LAUNCHED: 'LAUNCHED',
    BOOTSTRAPPING: 'BOOTSTRAPPING',
    BOOTSTRAPPED: 'BOOTSTRAPPED',
    STATEUPSTARTING: 'STATEUPSTARTING',
    CHEFRUNNING: 'CHEFRUNNING',
    COOKBOOKSUCCESS: 'COOKBOOKSUCCESS',
    AUTHKEYSADDED: 'AUTHKEYSADDED',
    ROUTEADDED: 'ROUTEADDED',
    CHEFCONFIGSETUPSTARTING: 'CHEFCONFIGSETUPSTARTING',
    CHEFCONFIGSETUPSTARTED: 'CHEFCONFIGSETUPSTARTED',
    GITCLONED: 'GITCLONED',
    GITCLONING: 'GITCLONING',
    STATEUPSTARTED: 'STATEUPSTARTED',
    UPDATING: 'UPDATING',
    UPDATED: 'UPDATED',
    DOWNLOADED: 'DOWNLOADED',
    DOWNLOADING: 'DOWNLOADING',
    VNCHOSTUPDATING: 'VNCHOSTUPDATING',
    VNCHOSTUPDATED: 'VNCHOSTUPDATED',
    DNSNAMESKIPPED: 'DNSNAMESKIPPED',
    COOKBOOK_DOWNLOADING: 'COOKBOOK_DOWNLOADING',
    COOKBOOK_DOWNLOADED: 'COOKBOOK_DOWNLOADED',
    AUTHKEYSUPDATING: 'AUTHKEYSUPDATING',
    AUTHKEYSUPDATED: 'AUTHKEYSUPDATED',
    IP_UPDATING: 'IP_UPDATING',
    IP_UPDATED: 'IP_UPDATED',
    IP_ALLOCATE_SUCCESS: 'IP_ALLOCATE_SUCCESS',
    BOOTING: 'BOOTING',
    APPDEPLOYING: 'APPDEPLOYING',
    INSUFFICIENT_FUND: 'INSUFFICIENT_FUND',
    WAITUNTILL: 'WAITUNTILL',
    PENDING: 'PENDING',
    ACTIVE_PROLOG: 'ACTIVE_PROLOG',
    ACTIVE: 'ACTIVE',
    HOLD: 'HOLD',
    ACTIVE_BOOT: 'ACTIVE_BOOT',
    ACTIVE_RUNNING: 'ACTIVE_RUNNING',
    ACTIVE_LCM_INIT: 'ACTIVE_LCM_INIT',
    NETWORK_UNAVAIL: 'NETWORK_UNAVAIL'
};

const LaunchActionTypes = {
    STARTING: 'STARTING',
    STARTED: 'STARTED',
    STOPPING: 'STOPPING',
    STOPPED: 'STOPPED',
    RESTARTING: 'RESTARTING',
    RESTARTED: 'RESTARTED',
    REBOOTING: 'REBOOTING',
    REBOOTTED: 'REBOOTTED',
    DELETING: 'DELETING',
    DELETED: 'DELETED',
    SNAPSHOTTING: 'SNAPSHOTTING',
    SNAPSHOTTED: 'SNAPSHOTTED',
    RUNNING: 'RUNNING',
    DESTROY: 'DESTROYED',
    SUSPEND: 'SUSPENDED',
    PREERROR: 'PREERROR'
};

/** there could be more status that are considered successful */
const LaunchTypes = {
    BOOTSTRAPPED: 'BOOTSTRAPPED',
    INITIALIZING: 'INITIALIZING',
    INITIALIZED: 'INITIALIZED',
    PARKED: 'PARKED'
};

const LaunchErrorTypes = {
    ERROR: 'ERROR',
    POSTERROR: 'POSTERROR'
};

const LaunchStatus = RestModel.extend({

    @computed("event_type")launchKey(action) {
        if (action != null) {
            var successArray = [];

            _.each(LaunchTypes, (k) => {
                successArray.push(k);
            });
            return successArray.indexOf(action.toUpperCase()) >= 0;
        }
        return false;
    },

    @computed("event_type")errorKey(action) {
        if (action != null) {
            var errorsArray = [];

            _.each(LaunchErrorTypes, (k) => {
                errorsArray.push(k);
            });

            return errorsArray.indexOf(action.toUpperCase()) >= 0;
        }

        return false;
    },

    @computed("event_type")statusKey(action) {
        if (action != null) {
            var statusArray = [];

            _.each(LaunchStatusTypes, (k) => {
                statusArray.push(k);
            });

            return statusArray.indexOf(action) >= 0;
        }

        return false;
    }
});

LaunchStatus.reopenClass({TYPES: LaunchStatusTypes, TYPES_ACTION: LaunchActionTypes, TYPES_LAUNCH: LaunchTypes, TYPES_ERROR: LaunchErrorTypes});

export default LaunchStatus;
