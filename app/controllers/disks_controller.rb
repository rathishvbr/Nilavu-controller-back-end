class DisksController < ApplicationController
    respond_to :html, :json

    before_action :add_authkeys_for_api, only: [:create, :show, :remove]

    def create
        response = Api::Disks.new.create(params)
        if response[:status] == 201
            render json: { success: true, message: response }
        else
            render json: { success: false}
        end
    end

    def remove
        response = Api::Disks.new.remove(params)
        render json: { success: true, message: response }
    end

    def show
        response = Api::Disks.new.show(params)
        render json: { success: true, message: response }
    end
end
