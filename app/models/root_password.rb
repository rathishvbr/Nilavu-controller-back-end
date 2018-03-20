## TO-DO need to think harder and rewrite ssh/pwd support
## in 2.0 catering to vms/containers/others
require 'base64'
class RootPassword

    attr_reader :root_password #this is :keypairname (assembly needs this key)
    attr_reader :keypairoption, :params

    def initialize(params)
        @params = params
        @keypairoption = params[:keypairoption]
    end


    def save
        return  :keypairoption unless @keypairoption
        return autoset_root_password
    end

    private

    def keypairname
        @params[:keypairname]
    end

    def autoset_root_password
     @params[:root_password] = Base64.strict_encode64(keypairname)
    end

end
