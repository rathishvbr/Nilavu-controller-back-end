module Api
   class Reportdata < ApiDispatcher

       attr_reader :data

       def initialize
           @data = []
           super(true) # swallow 404 errors for assemblies.
       end

       def listable_count_per_day(params)
           result = api_request(REPORTS, CREATE, params)
           result[:body] if result && result.is_a?(Hash)
       end

       def listable_count_per_user_day(params)
           result = api_request(REPORTS, SHOW, params)
           result[:body] if result && result.is_a?(Hash)
       end
   end
end
