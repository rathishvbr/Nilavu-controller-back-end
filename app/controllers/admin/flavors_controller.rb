class Admin::FlavorsController < Admin::AdminController
include LaunchableAssembler
    before_action :add_authkeys_for_api, only: [:show, :create, :list, :remove, :update]


    def show
         response = Api::Flavors.new.show(params)
        render json: {success: true, message: response}
    end

    def create
        params["price"] = JSON.parse(params["price"])
        response = Api::Flavors.new.save(params)
        render json: { success: true, message: response}
    end

    def update
      params["price"] = JSON.parse(params["price"])
      response = Api::Flavors.new.update(params)
      render json: { success: true, message: response}
  end


    def list
     response = Api::Flavors.new.list(params)
     render json: { success: true, response: response, regions: regions }
    end

    def remove
      response = Api::Flavors.new.remove(params)
       render json: { success: true, message: response }
      end

end
