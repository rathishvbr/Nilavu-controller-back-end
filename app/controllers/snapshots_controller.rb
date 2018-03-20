class SnapshotsController < ApplicationController
    include LaunchableAssembler
    respond_to :html, :json

    before_action :add_authkeys_for_api, only: [:create, :list]

    def create
        response = Api::Snapshots.new.create(params)

        if response[:status] == 201
            render json: { success: true, message: response }
        else
            render json: { success: false}
        end
    end

    def list
        response = Api::Snapshots.new.show(params)
        render json: { success: true, message: response ,quotas: quotas(params)}
    end
end
