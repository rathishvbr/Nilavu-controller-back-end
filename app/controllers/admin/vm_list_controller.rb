class Admin::VmListController < Admin::AdminController

    respond_to :html, :json

    before_action :add_authkeys_for_api, only: [:list]

    def list
     response = Api::Assembly.new.list(params)
     render json: { success: true, message: response }
    end
end
