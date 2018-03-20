require 'current_user'
class SubscriptionsController < ApplicationController
    include CurrentBilly
    respond_to :html, :json
    skip_before_filter :check_xhr

    before_action :add_authkeys_for_api, only: [:checker, :create, :onboard, :skip_billing]

    SUBSCRIBER_PROCESSE = 'Subscriber'.freeze
    ONBOARDER_PROCESSE  = 'Onboarder'.freeze

    def entrance
    end

    def checker
        user_activator = UserActivationChecker.new(current_user)
        if user_activator.completed?
            redirect_to '/'
        else
            addon = lookup_external_id_in_addons(params)
            mob = user_activator.verify_mobavatar(params)
            render json: {
                subscriber: subscriber(addon[:external_id]) || {},
                mobavatar_activation: mob,
                addon: addon
            }
        end
    end

    # subcriber to update the billing address
    def create
        addon = lookup_external_id_in_addons(params)
        if addon[:result] == 'success'
            render json: { subscriber: update_subscriber(addon[:external_id].merge(params)) || {} }
        else
            render json: { subscriber: addon.to_json }
        end
    end

    def onboard
        onboardsuccess = onboarder(params)
        if onboardsuccess[:result] == 'success'
            addonsuccess = UsersubscriptionActivator.new.start(params.merge(to_hash(onboardsuccess[:clientid])))
            external_id = external_id_get(addonsuccess)
            user = fetch_user_from_params
            updater = UserUpdater.new(user)
            external_id[:result] == 'success' ? active = updater.update(permit_data) : something_wrong
            onboard_snapshot_quota(params)
            if !active.nil?
                activation = UserActivator.new(user, request, session, cookies)
                activation.start
                activation.finish
                render json: {
                    addon: addonsuccess
                }
            else
                something_wrong
            end
        else
            render json: { result: 'error', error: onboardsuccess[:message], swallow_404: false }
        end
    end

    def skip_billing
        user = fetch_user_from_params
        updater = UserUpdater.new(user)
        active = updater.update(permit_data.merge(approved: 'true'))
        if !active.nil?
            activation = UserActivator.new(user, request, session, cookies)
            activation.start
            activation.finish
            render json: { update: active }
        else
            render json: { result: 'error', error: onboardsuccess[:message], swallow_404: false }
        end
    end

    private

    def to_hash(id)
        {
            'id' => id,
            'provider_id' => id,
            'account_id' => current_user.email,
            'provider_name' => SiteSetting.enabled_biller,
            'options' => [],
            'created_at' => Time.now
        }
    end

    def permit_data
        {
            email: params[:email],
            api_key: params[:api_key],
            active: "true",
            first_name: current_user.first_name,
            last_name: current_user.last_name,
            authority: current_user.authority,
            phone: current_user.phone,
            staged: current_user.staged
        }

    end

    def fetch_user_from_params
        User.new
    end

    def onboarder(addon)
        if bdr = bildr_processe_is_ready(ONBOARDER_PROCESSE)
            bdr.new.onboard(addon || {})
        else
            something_wrong
        end
    end

    def subscriber(addon)
        if bdr = bildr_processe_is_ready(SUBSCRIBER_PROCESSE)
            b = bdr.new.subscribe(addon || {})
            bdr.new.after_subscribe(b)
        else
            something_wrong
        end
    end

    def update_subscriber(addon)
        if bildr = bildr_processe_is_ready(SUBSCRIBER_PROCESSE)
            b = bildr.new.update(addon || {})
            bildr.new.after_update(b)
        else
            something_wrong
        end
    end

    def bildr_processe_is_ready(processe)
        bildr = Biller::Builder.new(processe)
        return unless bildr.implementation
        bildr.implementation
    end

    def something_wrong
        { result: 'error', error: 'user.activation.unknown', swallow_404: false }
    end

    def external_id_get(_addonsuccess)
        lookup_external_id_in_addons(params)
    end

    def onboard_snapshot_quota(params)
        if SiteSetting.allowed_snapshot_quota
            Api::Quota.new.create(params)
        end
    end
end
