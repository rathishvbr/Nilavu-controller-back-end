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

# -*- encoding : utf-8 -*-
require_dependency 'enum'

class OmniauthCallbacksController < ApplicationController

    BUILTIN_AUTH = [
        Auth::FacebookAuthenticator.new,
        Auth::GoogleOAuth2Authenticator.new,
        Auth::GithubAuthenticator.new,
    ]

    skip_before_filter :redirect_to_login_if_required
    # need to be able to call this
    skip_before_filter :check_xhr


    layout false

    def self.types
        @types ||= Enum.new(:facebook, :google, :github)
    end

    def complete
        auth = request.env["omniauth.auth"]
        auth[:session] = session
        authenticator = self.class.find_authenticator(params[:provider])
        provider = Nilavu.auth_providers && Nilavu.auth_providers.find{|p| p.name == params[:provider]}
        @auth_result = authenticator.after_authenticate(auth)

        origin = request.env['omniauth.origin']
        if origin.present?
            parsed = URI.parse(origin) rescue nil
            if parsed
                @origin = origin
            end
        end

        @auth_result.redirect = @origin

        if @auth_result.failed?
            flash[:error] = @auth_result.failed_reason.html_safe
            return failure
          else
              @auth_result.authenticator_name = authenticator.name
              complete_response_data

              if provider && provider.full_screen_login
                  cookies['_bypass_cache'] = true
                  flash[:authentication_data] = @auth_result.to_client_hash.to_json
                  redirect_to @origin
              else

                  @auth_result.authenticated = true

                  create_account_if_from_login

                  respond_to do |format|
                      format.html
                      format.json { render json: @auth_result.to_client_hash }
                  end
              end
          end
    end

    def failure
        flash[:error] = I18n.t("login.omniauth_error")
        render layout: 'failure'
    end

    def self.find_authenticator(name)
        BUILTIN_AUTH.each do |authenticator|
            if authenticator.name == name
                raise Nilavu::InvalidAccess.new("provider is not enabled") unless SiteSetting.send("enable_#{name}_logins?")
                return authenticator
            end
        end

        Nilavu.auth_providers.each do |provider|
            return provider.authenticator if provider.name == name
        end

        raise Nilavu::InvalidAccess.new("provider is not found")
    end

    protected

    def complete_response_data
        session[:authentication] = @auth_result.session_data
    end

    #this code is redundant, make it a new class
    #(Onboard and use in both user#create and here)
    def after_create_account(result)
        user = User.new_from_params(result)
        user.password = SiteSetting.oauth_stub_password
        user.api_key = SecureRandom.hex(20) if user.api_key.blank?

        activation = UserActivator.new(user, request, session, cookies)
        activation.start

        if user.save
            activation.finish
            session["signup.created_account"] = activation.message
        else
            session["signup.create_failure"] = activation.message
        end
        user
    end


    private

    def create_account_if_from_login
        if  is_login_url
            after_create_account(@auth_result.to_client_hash)
        end
    end

    def is_login_url
        return (@origin.include? 'login')
    end
end
