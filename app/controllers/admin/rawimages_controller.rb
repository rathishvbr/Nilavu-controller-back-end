class Admin::RawimagesController < Admin::AdminController
    include LaunchableAssembler
    before_action :add_authkeys_for_api, only: [:create, :index, :show]

    def index
        data = Api::Rawimages.new.list(params)
        render json: {success: true, data: data, regions: regions}
    end

    def create
        params["inputs"] = JSON.parse(params["inputs"])
        response = Api::Rawimages.new.save(params)
        if response[:status] == 201
            render json: { success: true, message: response }
        else
            render json: { success: false}
        end
    end

    def show
        data = Api::Rawimages.new.show(params)
        render json: {success: true, data: data}
    end
end
