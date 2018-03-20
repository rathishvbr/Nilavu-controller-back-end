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

require 'current_user'
require 'current_cephuser'
require_dependency 'nilavu'
require_dependency 'global_path'
require_dependency 'global_exceptions'
require_dependency 'json_error'

class ApplicationController < ActionController::Base
    include ApplicationHelper
    include CurrentUser
    include CurrentCephUser
    include JsonError
    include GlobalPath
    include GlobalExceptions

    protect_from_forgery

    before_filter :set_locale
    before_filter :disable_customization
    before_filter :authorize_mini_profiler
    before_filter :preload_json
    before_filter :redirect_to_login_if_required
    before_filter :set_current_user_with_team
    before_filter :check_xhr
    after_filter  :add_readonly_header
    after_filter  :perform_refresh_session

    def add_readonly_header
        response.headers['Nilavu-Readonly'] = 'true' if readonly_mode?
    end


    ## we'll have to remove this, and turn on the other rescue
    around_action :catch_exceptions

    # Some exceptions
    class RenderEmpty < StandardError; end

    # Render nothing
    rescue_from RenderEmpty do
        render 'default/empty'
    end

    rescue_from Nilavu::InvalidParameters do |e|
        render json_error e.message, type: :invalid_params, status: 422
    end

    rescue_from Nilavu::NotFound do
        rescue_nilavu_actions(:not_found, 404)
    end

    rescue_from Nilavu::InvalidAccess do
        rescue_nilavu_actions(:invalid_access, 403, true)
    end

    rescue_from Nilavu::NotLoggedIn do |e|
        raise e if Rails.env.test?
        if (request.format && request.format.json?) || request.xhr? || !request.get?
            rescue_nilavu_actions(:not_logged_in, 403, true)
        else
            rescue_nilavu_actions(:not_found, 404)
        end
    end

    def perform_refresh_session
        refresh_session(current_user)
    end

    def rescue_nilavu_actions(type, status_code)
        if (request.format && request.format.json?) || request.xhr?
            render_json_error I18n.t(type), type: type, status: status_code
        else
            render text: build_not_found_page(status_code)
        end
    end

    def set_locale
        I18n.locale = if SiteSetting.allow_user_locale
            locale_from_header
        else
            SiteSetting.default_locale
        end
        I18n.ensure_all_loaded!
    end

    def store_preloaded(key, json)
        @preloaded ||= {}
        @preloaded[key] = json.gsub('</', '<\\/')
    end

    # If we are rendering HTML, preload the session data
    def preload_json
        # We don't preload JSON on xhr or JSON request
        return if request.xhr? || request.format.json?

        # if we are posting in makes no sense to preload
        return if request.method != 'GET'

        preload_anonymous_data

        preload_current_user_data if current_user
    end

    def disable_customization
        session[:disable_customization] = params[:customization] == '0' if params.key?(:customization)
    end

    def guardian
        @guardian ||= Guardian.new(current_user)
    end

    def serialize_data(obj, serializer, opts = nil)
        # If it's an array, apply the serializer as an each_serializer to the elements
        serializer_opts = opts || {}
        if obj.respond_to?(:to_ary)
            serializer_opts[:each_serializer] = serializer
            ActiveModel::ArraySerializer.new(obj.to_ary, serializer_opts).as_json
        else
            serializer.new(obj, serializer_opts).as_json
        end
    end

    # This is odd, but it seems that in Rails `render json: obj` is about
    # 20% slower than calling MultiJSON.dump ourselves. Rails doesn't call
    # MultiJson.dump when you pass it json: obj but it seems we don't need
    # whatever Rails is doing.
    def render_serialized(obj, serializer, opts = nil)
        render_json_dump(serialize_data(obj, serializer, opts), opts)
    end

    def render_json_dump(obj, opts = nil)
        opts ||= {}
        if opts[:rest_serializer]
            obj['__rest_serializer'] = '1'
            opts.each do |k, v|
                obj[k] = v if k.to_s.start_with?('refresh_')
            end

            obj['extras'] = opts[:extras] if opts[:extras]
        end

        render json: MultiJson.dump(obj), status: opts[:status] || 200
    end

    def can_cache_content?
        current_user.blank? && flash[:authentication_data].blank?
    end

    def no_cookies
        # do your best to ensure response has no cookies
        headers.delete 'Set-Cookie'
        request.session_options[:skip] = true
    end

    private

    def locale_from_header
        # Rails I18n uses underscores between the locale and the region; the request
        # headers use hyphens.
        require 'http_accept_language' unless defined? HttpAcceptLanguage
        available_locales = I18n.available_locales.map { |locale| locale.to_s.tr('_', '-') }
        parser = HttpAcceptLanguage::Parser.new(request.env['HTTP_ACCEPT_LANGUAGE'])
        parser.language_region_compatible_from(available_locales).tr('-', '_')
    rescue
        # If Accept-Language headers are not set.
        I18n.default_locale
    end

    def preload_anonymous_data
        store_preloaded('site', { filters: Nilavu.default_categories.map(&:to_s), categories_muted:  Nilavu.default_categories_muted.map(&:to_s) }.to_json)
        store_preloaded('siteSettings', SiteSetting.client_settings_json)
        store_preloaded('customHTML', custom_html_json)
    end

    def preload_current_user_data
        store_preloaded('currentUser', MultiJson.dump(current_user))
    end

    def custom_html_json
        target = view_context.mobile_view? ? :mobile : :desktop
        data = {
            top: render_customized_header_or_not,
            footer: render_customized_footer_or_not
        }

        MultiJson.dump(data)
    end

    # Render action for a JSON error.
    #
    # obj      - a translated string, an ActiveRecord model, or an array of translated strings
    # opts:
    #   type   - a machine-readable description of the error
    #   status - HTTP status code to return
    def render_json_error(obj, opts = {})
        opts = { status: opts } if opts.is_a?(Fixnum)
        render json: MultiJson.dump(create_errors_json(obj, opts[:type])), status: opts[:status] || 422
    end

    def success_json
        { success: 'OK' }
    end

    def failed_json
        { failed: 'FAILED' }
    end

    def json_result(obj, opts = {})
        if yield(obj)
            json = success_json

            # If we were given a serializer, add the class to the json that comes back
            if opts[:serializer].present?
                json[obj.class.name.underscore] = opts[:serializer].new(obj, scope: guardian).serializable_hash
            end

            render json: MultiJson.dump(json)
        else
            error_obj = nil
            if opts[:additional_errors]
                error_target = opts[:additional_errors].find do |o|
                    target = obj.send(o)
                    target && target.errors.present?
                end
                error_obj = obj.send(error_target) if error_target
            end
            render_json_error(error_obj || obj)
        end
    end

    def mini_profiler_enabled?
        defined?(Rack::MiniProfiler) && guardian.is_developer?
    end

    def authorize_mini_profiler
        return unless mini_profiler_enabled?
        Rack::MiniProfiler.authorize_request
    end

    def check_xhr
        # bypass xhr check on PUT / POST / DELETE provided api key is there, otherwise calling api is annoying
        return if !request.get? && api_key_valid?
        raise RenderEmpty unless (request.format && request.format.json?) || request.xhr?
    end

    def destination_url
        request.original_url unless request.original_url =~ /uploads/
    end

    def ensure_logged_in
        raise Nilavu::NotLoggedIn unless current_user.present?
    end

    def ensure_staff
        raise Nilavu::InvalidAccess unless current_user && current_user.staff?
    end

    def ensure_admin
        raise Nilavu::InvalidAccess unless current_user && current_user.admin?
    end

    def ensure_wizard_enabled
        raise Nilavu::InvalidAccess unless SiteSetting.wizard_enabled?
    end

    def redirect_to_login_if_required
        return if current_user
        session[:destination_url] = destination_url
    end

    def redirect_to_subscription_if_required
        if current_user
            if SiteSetting.allow_billings
                user_activator = UserActivationChecker.new(current_user)
                if user_activator.active_completed?
                    unless user_activator.approved_completed?
                        redirect_to '/billers/bill/activation'
                    end
                else
                    redirect_to '/subscriptions/account/activation'
                end
            end
        end
    end

    def check_billings
        if current_user
            if SiteSetting.allow_billings
                user_activator = UserActivationChecker.new(current_user)
                if user_activator.active_completed? && !user_activator.approved_completed?
                    redirect_to '/billings'
                end
            end
        end
    end

    def set_current_user_with_team
        if current_user && !current_user.team
            Teams.new.tap do |teams|
                teams.find_all(AuthBag.vertice(current_user))
                current_user.team = teams.last_used if teams
            end
        end
    end

    def redirect_to_cephlogin_if_required
        return if current_cephuser
        session[:destination_url] = destination_url
        redirect_to path('/cephsignin')
    end

    def add_authkeys_for_api
        logger.debug '> STICKM'
        params.merge!(AuthBag.vertice(current_user))
    end

    def donot_allow_if_user_suspended
        return unless current_user
        if current_user.suspended.nil? ?  false : current_user.suspended.include?("true")
        render json: { error: I18n.t('dashboard.suspended_error') }
       end
    end

    def add_cephauthkeys_for_api
        logger.debug '> STICKC'
        params.merge!(AuthBag.ceph(current_cephuser))

    end

    def build_not_found_page(status = 404, layout = false)
        render_to_string status: status, layout: layout, formats: [:html], template: '/errors/not_found'
    end

    protected

    def api_key_valid?
        current_user
    end

    # returns an array of integers given a param key
    # returns nil if key is not found
    def param_to_integer_list(key, delimiter = ',')
        params[key].split(delimiter).map(&:to_i) if params[key]
    end

    def api_env_is_down
        render json: { error: I18n.t('dashboard.api_env_error', api: GlobalSetting.http_api) }
    end

    def render_with_error(key)
        render js: "toastr.error('#{I18n.t(key)}');"
    end

    #CLUGGY if and else, rewrite it.
    def readonly_mode?
        return false if current_user && current_user.admin?

        if (SiteSetting.allow_billings && current_user &&  (current_user.approved || current_user.active))
            false
        else
            true
        end
    end
end
