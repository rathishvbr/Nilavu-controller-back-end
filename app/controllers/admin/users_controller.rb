require_dependency 'user_destroyer'
require_dependency 'admin_user_index_query'
require 'user_updater'

class Admin::UsersController < Admin::AdminController
    include CurrentBilly
    include LaunchableAssembler
    include LaunchedBiller
    respond_to :html, :js, :json

    skip_before_filter :check_xhr, only: [:block]

    before_action :add_authkeys_for_api, only: [:index, :credit, :delete, :delete_instance]

    before_filter :fetch_user, only: [:index]

    def entrance
        render 'cockpits/entrance'
    end

    def index
        respond_to do |format|
            format.json {
                render json: {   success: true,   message: @users }
            }
        end
    end


    def show
        users = ::AdminUserIndexQuery.new(params).find_user

        render json: { success: true, message: users }
    end

    def suspend
        update_now
    end

    def unsuspend
        update_now
    end

    def block
        update_now
    end

    def unblock
        update_now
    end


    def log_out
        if @user
            @user.auth_token = nil
            @user.save!
            @user.logged_out
            render json: success_json
        else
            render json: {error: I18n.t('admin_js.admin.users.id_not_found')}, status: 404
        end
    end

    def refresh_browsers
        refresh_browser @user
        render nothing: true
    end

    def approve
        guardian.ensure_can_approve!(@user)
        @user.approve(current_user)
        render nothing: true
    end

    def activate
        guardian.ensure_can_activate!(@user)
        @user.activate
        render json: success_json
    end

    def deactivate
        guardian.ensure_can_deactivate!(@user)
        @user.deactivate
        refresh_browser @user
        render nothing: true
    end

    def delete
   response = Api::Accounts.new.remove(params)
   if response
       render json: { success: true, message: response }
   else
       render json: { success: false}
   end


    end
    def delete_instance
     response = Api::Assembly.new.remove(params)
     if response
      render json: { success: true, message: response }
     else
      render json: { success: false}
     end
    end

    def credit
        adm_email = params[:email]
        adm_api = params[:api_key]
        addonDetails = params
        addonDetails[:email] = params[:account_id]
        addonDetails[:api_key] = params[:api_key_details]
        addon = lookup_external_id_in_addons(addonDetails).merge(params)
        bildr = bildr_processe_is_ready("Credit")
        b = bildr.new.add_credit(addon)
        params[:email] = adm_email
        params[:api_key] = adm_api
        if b[:result] == 'success'
            balanceUpdate = Api::Balances.new.update(params)
            creditUpdate = Api::Credits.new.create(params)
            if creditUpdate[:status] == 201 && balanceUpdate[:status] == 201
                render json: { success: true , message:creditUpdate }
            else
                render json: { success: false, message: I18n.t('admin_js.admin.user.credits_not_added')}
            end

        else
            render json: { success: false, message: I18n.t('admin_js.admin.user.user_doesnot_exit')}
        end
    end


    private

    def user_from_params
        User.new
    end

    def bildr_processe_is_ready(processe)
        bildr = Biller::Builder.new(processe)
        return unless bildr.implementation
        bildr.implementation
    end

    def update_now
        user = user_from_params
        updater = UserUpdater.new(user)
        response = updater.update(params)
        if response
            render json: { success: true, message: response }
        else
            render json: { success: false}
        end
    end

    def fetch_user
        @users = ::AdminUserIndexQuery.new(params).find_users_query
    end

end
