module Api
  class Credits < ApiDispatcher
   attr_reader :credit

   def initialize()
     @credit = ""
   end

    def show(api_params, &block)
      raw = api_request(CREDITS, SHOW,api_params)
      @credit = raw[:body] unless raw == nil
      yield self if block_given?
      return self
    end

    def list(params, &_block)
        @credit_all = api_request(CREDITS, LIST, params)
        yield self  if block_given?
        self
    end

    def create(params)
        api_request(CREDITS, CREATE, params)
    end

  end
end
