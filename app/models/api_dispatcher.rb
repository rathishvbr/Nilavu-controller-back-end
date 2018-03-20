
class ApiDispatcher
    include VerticeResource

    class ApiDispatcher::NotReached < StandardError
        def initialize(message)
            super(message)
        end

    end

    class ApiDispatcher::Flunked  < StandardError
        include HttpErrors

        def initialize(response)
            @response = response
        end

        def h401?
            return is_http_401?(@response)
        end

        def h403?
            return is_http_403?(@response)
        end

        def h404?
            return is_http_404?(@response)
        end
    end

    attr_accessor :megfunc, :megact, :parms, :passthru, :swallow_404, :verify

    JLAZ_PREFIX          = 'Megam::'.freeze

    ACCOUNT              = 'Account'.freeze
    ASSEMBLIES           = 'Assemblies'.freeze
    ASSEMBLY             = 'Assembly'.freeze
    BALANCES             = 'Balances'.freeze
    CREDITS              = 'Credits'.freeze
    BILLINGTRANSACTIONS  = 'Billingtransactions'.freeze
    COMPONENTS           = 'Components'.freeze
    ORGANIZATION         = 'Organizations'.freeze
    DOMAIN               = 'Domains'.freeze
    SNAPSHOTS            = 'Snapshots'.freeze
    BACKUPS              = 'Backups'.freeze
    DISKS                = 'Disks'.freeze
    PROMOS               = 'Promos'.freeze
    QUOTAS               = 'Quotas'.freeze
    RAWIMAGES            = 'Rawimages'.freeze

    MARKETPLACES         = 'MarketPlace'.freeze
    REQUESTS             = 'Request'.freeze
    SSHKEYS              = 'SshKey'.freeze
    ADDONS               = 'Addons'.freeze
    SUBSCRIPTIONS        = 'Subscriptions'.freeze
    EVENTS               = 'Events'.freeze
    LICENSE              = 'License'.freeze
    REPORTS              = 'Reports'.freeze
    FLAVORS              = 'Flavors'.freeze

    ENDPOINTS_AS_JSON = [JLAZ_PREFIX + ASSEMBLIES,  JLAZ_PREFIX + ASSEMBLY,    JLAZ_PREFIX + COMPONENTS]

    LOGIN             = 'login'.freeze
    SHOW              = 'show'.freeze
    CREATE            = 'create'.freeze
    LIST              = 'list'.freeze
    REMOVE            = 'remove'.freeze
    UPDATE            = 'update'.freeze
    LISTALL           = 'listall'.freeze

    FORGOT            = 'forgot'.freeze
    PASSWORD_RESET    = 'password_reset'.freeze
    UPGRADE           = 'upgrade'.freeze

    def initialize(ignore_404 = false)
        @swallow_404 = ignore_404
    end

    def api_request(jlaz, jmethod, jparams, passthru=false )
                  set_attributes(jlaz, jmethod, jparams, passthru)
        begin
            Rails.logger.debug "\033[01;35mFASCADE #{megfunc}::#{megact} \33[0;34m"

            raise Nilavu::InvalidParameters if !satisfied_args?(passthru, jparams)
            invoke_submit
        rescue Megam::API::Errors::ErrorWithResponse => m
                      raise_api_errors(ApiDispatcher::Flunked.new(m))
        rescue StandardError => se

            raise ApiDispatcher::NotReached.new(se.message)
        end
    end



    def meg_function(arg=nil)
        if arg != nil
            @megfunc = JLAZ_PREFIX + arg
        else
            @megfunc
        end
    end

    def meg_action(arg=nil)
        if arg != nil
            @megact = arg
        else
            @megact
        end
    end

    def parameters(arg=nil)
        if arg != nil
            @parms = arg
            @parms = @parms.merge({:host => endpoint })
        else
            @parms
        end
    end

    def passthru?(arg=false)
        if arg != nil
            @passthru = arg
        else
            @passthru
        end
    end

    private

    def set_attributes(jlaz, jmethod, parms, passthru)
        meg_function(jlaz)
        meg_action(jmethod)
        parameters(parms)
        prepare_ottai_endpoints
        passthru?(passthru)
    end

    def satisfied_args?(passthru, params={})
        unless passthru
            return params[:email] && (params[:api_key].present? || params[:password_hash].present?)
        end
        return true
    end

    def prepare_ottai_endpoints
        if @parms && has_ottai
            @parms[:headers]  =  {Megam::API::X_Megam_OTTAI => true}
        end
    end

    def has_ottai
        #  ENDPOINTS_AS_JSON.include?(meg_function)
        false
    end

    def endpoint
        GlobalSetting.http_api
    end

    def debug_print(jparams)
        jparams.each do |name, value|
            Rails.logger.debug("> #{name}: #{value}")
        end
    end

    def raise_api_errors(e)
        return if (e.h404? && swallow_404)
        raise e
    end
end
