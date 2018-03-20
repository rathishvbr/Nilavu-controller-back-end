
module Api
  class Flavors < ApiDispatcher
   attr_reader :flavors_data

   def initialize
       @flavors_data = []
       super(true) # swallow 404 errors.
   end

    def show(api_params)
            result = api_request(FLAVORS, SHOW,api_params)
      @flavors_data = result[:body] unless result == nil
      yield self  if block_given?
      self
    end

    def save(api_params)
      result = api_request(FLAVORS, CREATE,api_params)
      result[:body].some_msg[:code] if result && result.is_a?(Hash)
    end

    def update(api_params)
            result = api_request(FLAVORS, UPDATE,api_params)
      result[:body].some_msg[:code] if result && result.is_a?(Hash)
  end


    def remove(api_params)
    #   api_request(FLAVORS, REMOVE, api_params)
    #   yield self if block_given?
    #   self
    # end
    
    result = api_request(FLAVORS, REMOVE,api_params)
      result[:body].some_msg[:code] if result && result.is_a?(Hash)
    end

    def list(api_params)
      result = api_request(FLAVORS, LIST,api_params)
      # result[:body] if result && result.is_a?(Hash)
      @flavors_data = result[:body] unless result == nil
      yield self  if block_given?
      self

    end

  end
end
