##
## Copyright [2013-2016] [Megam Systems]
##
## Licensed under the Apache License, Version 2.0 (the "License");
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
## http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##

class UsersController < ApplicationController
    respond_to :html, :js, :json

    skip_before_filter :check_xhr, only: [:show, :password_reset, :update, :account_created, :account_not_approved , :refresh_browsers]

    # we need to allow account creation with bad CSRF tokens, if people are caching, the CSRF token on the
    #  page is going to be empty, this means that server will see an invalid CSRF and blow the session
    #  once that happens you can't log in with social
    # skip_before_filter :verify_authenticity_token, only: [:create]
    skip_before_filter :redirect_to_login_if_required, only: [:check_email,
        :create,
        :account_created,
        :password_reset,
    :confirm_email_token]

    before_action :add_authkeys_for_api, only: [:edit, :update]

    def create
        unless SiteSetting.allow_new_registrations
            return fail_with('login.new_registrations_disabled')
        end
        if params[:password] && params[:password].length > User.max_password_length
            return fail_with('login.password_too_long')
        end
        if params[:email] && params[:email].length > 254 + 1 + 253
            return fail_with('login.email_too_long')
        end

        if SiteSetting.reserved_emails.split('|').include? params[:email].downcase
            return fail_with('login.reserved_email')
        end
        user = User.new


        user_params.each { |k, v| user.send("#{k}=", v) }
        user.api_key = SecureRandom.hex(20) if user.api_key.blank?
        if current_user
            if current_user.authority.eql?"admin"
                user.save
                render json: {
                    success: true,
                    user_id: user.id
                }
            end
        else
            authentication = UserAuthenticator.new(user, session)

            if !authentication.has_authenticator? && !SiteSetting.enable_local_logins
                return render nothing: true, status: 500
            end

            authentication.start

            activation = UserActivator.new(user, request, session, cookies)
            activation.start

            # just assign a password if we have an authenticator and no password, this is the case for oauth maybe
            user.password = SecureRandom.hex if user.password.blank? && authentication.has_authenticator?

            if user.save
                authentication.finish
                activation.finish

                # save user email in session, to show on account-created page
                session['user_created_message'] = activation.message

                render json: {
                    success: true,
                    staged: login_approved_for?(user),
                    message: activation.message,
                    user_id: user.id
                }
            else
                render json: {
                    success: false,
                    message: I18n.t(
                        'login.errors',
                        errors: user.errors.full_messages.join("\n")
                    ),
                    errors: user.errors.to_hash,
                    values: user.to_hash.slice('name', 'email')
                }
            end
        end

    rescue ApiDispatcher::NotReached
        render json: {
            success: false,
            message: I18n.t('login.something_already_taken')
        }
    end

    # redirect_to_ready_if_required
    def account_created
        @message = session['user_created_message'] || I18n.t('activation.missing_session')
        expires_now
        redirect_to '/'
    end

    def account_not_approved
        @message = session['user_created_message'] || I18n.t('activation.missing_session')
        expires_now
        render layout: 'no_ember'
    end

    def approve_account
        render 'cockpits/entrance'
    end

    def refresh_browsers
        if current_user.present?
            params["email"] = current_user.email
            params["api_key"] = current_user.api_key
        else
            redirect_to '/login'
        end

        user = User.new
        user_redirect_params.each { |k, v| user.send("#{k}=", v) }

        unless user = user.find_by_apikey
            redirect_to '/login'
        end
        user.email_confirmed? ? login(user) : not_activated(user)
    rescue ApiDispatcher::Flunked
        redirect_to '/login'
    rescue ApiDispatcher::NotReached
        redirect_to '/login'
    end

    ## Need a json serializer
    def edit
        @orgs = Teams.new.tap do |teams|
            teams.find_all(params)
        end
        if @orgs
            render json: { details: @orgs.to_hash }
        else
            render_json_error(I18n.t('organizations.none'))
        end
    end

    def update
        user = fetch_user_from_params

        unless check_password(user, params)
            return render_json_error(I18n.t('login.incorrect_password'))
        end

        updater = UserUpdater.new(user)

        if updater.update(params)
            activation = UserActivator.new(user, request, session, cookies)
            activation.start
            activation.finish

            render json: {
                success: true
            }
        else
            render json: {
                success: false
            }
        end
    rescue ApiDispatcher::NotReached
        render json: {
            success: false,
            message: I18n.t('login.something_already_taken')
        }
    end

    def password_reset
        begin
            if request.put?
                user = User.new
                user.email = params[:email]
                user.password_reset_key = params[:token]
                user.password = params[:password]

                if user.password_reset
                    logon_after_password_reset
                else
                    @error = I18n.t('password_reset.no_token')
                end
            end
        rescue ApiDispatcher::Flunked
            @error = I18n.t('password_reset.no_token')
        end
        render layout: 'no_ember'
    end

    def logon_after_password_reset
        user = fetch_user_from_params
        user_params.each { |k, v| user.send("#{k}=", v) }

        if user = user.find_by_email_password
            log_on_user(user)
            @success = I18n.t('password_reset.success')
        end
    end


    # A hack for accounts.show but a fancy name., called from ember
    def check_email
        params.require(:email)
        lower_email = Email.downcase(params[:email]).strip
        checker = EmailCheckerService.new
        render json: checker.check_email(lower_email)
    end

    def fail_with(key)
        render json: { success: false, message: I18n.t(key) }
    end

    def fail_with_flash(key)
        redirect_with_failure(login_path, key)
    end

    def user_params
        params.permit(:email, :password, :first_name, :last_name, :phone, :status, :authority, :staged, :active, :approved)
    end

    private

    def fetch_user_from_params
        User.new
    end

    def user_redirect_params
        params.permit(:email, :api_key)
    end

    def login(user)
        log_on_user(user)
        redirect_to '/'
    end

    def not_activated(user)
        redirect_to '/login'
    end

    def login_approved_for?(user)
        return true if (!SiteSetting.must_approve_users || user.admin?)

        SiteSetting.must_approve_users? && user.staged?
    end

    ## we will have to refactor this later.
    def check_password(user, params)
        params.require(:email)
        user_params.each { |k, v| user.send("#{k}=", v) }

        return true if params[:without_password] == 'true'

        if params.has_key?(:current_password)
            user.password = params[:current_password]
            if user = user.find_by_email_password
                return true
            else
                return false
            end
        end
    end
end
