require 'json'
module Api
    class Backups < ApiDispatcher

        attr_reader :backups_all, :backups_per, :backups_create

        def initialize
            @backups_all = []
            @backups_per = []
            @backups_create = []
            super(true) # swallow 404 errors for assemblies.
        end

        def show(params, &_block)
          raw = api_request(BACKUPS, SHOW, params)
           @backups_per = raw[:body] unless raw == nil
           yield self  if block_given?
          self
       end


        def update(params)
          raw = api_request(BACKUPS, UPDATE,params)
          raw[:body].some_msg[:code] if raw && raw.is_a?(Hash)

        end

        def list(params, &_block)

            raw = api_request(BACKUPS, LIST, params)
            dig_backup_assembly(raw[:body], params) unless raw.nil?
            yield self  if block_given?
            self
        end

        def listall(params, &_block)
            raw = api_request(BACKUPS, LISTALL, params)
             dig_backup_assembly(raw[:body], params) unless raw == nil
            yield self  if block_given?
            self
            end


        def create(params)
            api_request(BACKUPS, CREATE, params)
        end

        private

        def dig_backup_assembly(tmp_assemblies_collection, api_params)

            @backups_all = tmp_assemblies_collection.map do |one_backup|
                al = JSON.parse(one_backup.to_json)
                unless al["asm_id"].empty?
                    al["assembly"] = JSON.parse(Api::Assembly.new.show(api_params.merge(id: one_backup.asm_id)).baked.to_json)
                end
                al
            end

            Rails.logger.debug "\033[36m>-- ASB'S: #{@backups_all.class} START\33[0m"
            Rails.logger.debug "\033[1m#{@backups_all.to_yaml}\33[22m"
            Rails.logger.debug "\033[36m> ASB'S: END\033[0m"
        end

    end
end
