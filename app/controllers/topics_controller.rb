require 'snapshots_finder'
class TopicsController < ApplicationController
    include LaunchableAssembler

    respond_to :html, :json

    before_action :add_authkeys_for_api, only: [:show, :snapshots, :update]

    def show
        @deployed = DeployedRunner.perform_run(params)

        respond_to do |format|
            if @deployed
                format.html { render 'cockpits/entrance' }
                format.json { render json: @deployed.to_h.merge({regions: regions})} #TO-DO: remove revisit durnig settings fix
            else
                format.json { render json: failed_json }
            end
        end
    end

    def snapshots
        @foundsnapshots ||= SnapshotsFinder.new(params).foundsnapshots
        respond_to do |format|
            if @foundsnapshots
                format.json { render json: {
                    success: true,
                    message: @foundsnapshots,
                } }
            else
                format.json { render json: {
                    success: false,
                    message: I18n.t('vm_management.snapshots.list_error')
                } }
            end
        end
    end

    def update
        params["policies"] = JSON.parse(params["policies"])
        params[:inputs] = params[:inputs].values
        params[:outputs] = params[:outputs].values if params[:outputs] !=nil
        request = Api::Assembly.new.update(params)
        if request
            Api::Requests.new.reqs(permit_params)
            render json: {
                success: true,
                message: request,
            }

        else
            render json: {
                success: false
            }
        end
    end

    def predeploy
        render 'cockpits/entrance'
    end

    private
    def permit_params
        params[:action] = params[:req_action]
        params.permit(:email,:api_key,:account_id,:id,:cat_id,:category,:name, :cattype, :action)
    end

end
