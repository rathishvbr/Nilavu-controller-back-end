class Admin::ImpersonateController < Admin::AdminController
 before_action :add_authkeys_for_api, only: [:create]

  def create
   params[:email] = params[:user_email]
   params[:api_key] = params[:user_key]
   user = AdminUser.find_by_apikey(params)
   raise Nilavu::NotFound if user.blank?
    ##guardian.ensure_can_impersonate!(user)

    # log impersonate
    ##StaffActionLogger.new(current_user).log_impersonate(user)

    # Log on as the user
    log_on_user(user)

    render nothing: true
  end

end
