class Admin::LicenseController < ApplicationController
    # before_action :license, only: [:create, :show, :download, :destroy]
    # before_action :require_license, only: [:show, :download, :destroy]
    before_action :add_authkeys_for_api, only: [:show, :create]

    respond_to :html

    def entrance
        render 'cockpits/entrance' # unless current_user && hasVeto
    end

    def show
        @previous_licenses = License.previous(params)
        if @previous_licenses
            render json: { license: @previous_licenses }
        else
            render json: { error: 'Error' }
      end
    end

    def download
        send_data @license.data, filename: @license.data_filename, disposition: 'attachment'
    end

    def new
        @license = License.new
    end

    def create
        if params[:data]
          if License.save(params)
              render json: { success: 'The license was successfully uploaded and is now active. You can see the details below.' }
          else
              render json: { error: 'The license you entered was invalid' }
         end
        else
            render json: { error: 'No license was selected.' }
        end
    end

    def destroy
        license.destroy

        if License.current
            flash[:notice] = 'The license was removed. GitLab has fallen back on the previous license.'
        else
            flash[:alert] = 'The license was removed. GitLab now no longer has a valid license.'
        end

        redirect_to admin_license_path
    end

    private

    def license
        @license ||= begin
            License.reset_current
            License.current
        end
    end

    def require_license
        return if license

        flash.keep
        redirect_to new_admin_license_path
    end

    def license_params
        license_params = params.permit(:data_file, :data)
        license_params.delete(:data) if license_params[:data_file]
        license_params
    end
end
