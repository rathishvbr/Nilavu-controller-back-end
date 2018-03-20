class FlavorsController < ApplicationController
    respond_to :html, :json

    before_action :add_authkeys_for_api, only: [:show]

    def show
         response = Api::Flavors.new.show(params)
        render json: {success: true, message: response}
    end

end
