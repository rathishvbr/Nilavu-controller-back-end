module Api
    class Quota < ApiDispatcher

      SNAPSHOT_QUOTA_TYPE = 'snapshot'.freeze

        attr_reader :quota

        def initialize
            @quota = []
            super(true) # swallow 404 errors for assemblies.
        end


        def list(params, &_block)
            raw = api_request(QUOTAS, LIST, params)
            @quota = raw[:body] unless raw == nil
            yield self  if block_given?
            self
        end

        def create(params)
            bld_data = quota_params(params)
            api_request(QUOTAS, CREATE, params.merge(bld_data))
        end

        private

        def quota_params(params)
            {
                'account_id' => params[:email],
                'allowed' => [{key: 'no_of_units',value: SiteSetting.allowed_snapshot_quota}],
                'quota_type'=> SNAPSHOT_QUOTA_TYPE,
                'status' => 'active',
                'allocated_to' => "",
                'inputs' => [],
                'name' => "",
            }
        end
    end
end
