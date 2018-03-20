class Admin::BackupsController < Admin::AdminController
  include LaunchableAssembler
    respond_to :html, :json


    before_action :add_authkeys_for_api, only: [:create, :list, :show, :listall, :update]

    def create
      if params[:asm_id].include?('null')
        params["asm_id"] =  SecureRandom.hex
        params["inputs"] = JSON.parse(params["inputs"])
      end
          response = Api::Backups.new.create(params)

        if response[:status] == 201
            render json: { success: true, message: response }
        else
            render json: { success: false}
        end
    end

    def list
        response = Api::Backups.new.list(params)
        render json: { success: true, message: response }
    end

    def listall
        response = Api::Backups.new.listall(params)
        response.backups_all.map do |object|
             outputs = object["outputs"]
             outputs.map do |pair|
                backup_path_check =  pair["key"] == "backup_stored_path"
                if backup_path_check
                    key =  pair["value"].split('/')[-1]
                    value = bucketObject.presigned_url(storageDetails[:storage_bucket], key)
                    outputs.push({"key":"downloadUrl","value":value})
                end
            end
        end
        render json: { success: true, message: response ,regions: regions, storageDetails: storageDetails}
    end


    def show
        # params[:email] = params[:account_id]
        response = Api::Backups.new.show(params)
        outputs = response.backups_per[0].outputs
        outputs.map do |pair|
           backup_path_check =  pair["key"] == "backup_stored_path"
           if backup_path_check
               key =  pair["value"].split('/')[-1]
               value = bucketObject.presigned_url(storageDetails[:storage_bucket], key)
               outputs.push({"key":"downloadUrl","value":value})
           end
       end
        render json: { success: true, message: response }
    end

    def update
      params["labels"] = JSON.parse(params["labels"])
      params["inputs"] = JSON.parse(params["inputs"])
      response = Api::Backups.new.update(params)
      render json: { success: true, message: response}
    end

    def createFile
        url = bucketObject.presigned_url(params[:bucket], params[:key])
        render json: { success: true, message: url}
    end

    private

    def bucketObject
        @lister = BucketfilesLister.new(params)
    end

    def storageDetails
        bucketObject.details
    end

end
