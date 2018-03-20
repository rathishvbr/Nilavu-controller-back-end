module LaunchableScrubber
   include MarketplaceGroups

    def virtualmachines(params)
        MarketplaceGroups.find_by_group(params,:virtualmachines)
    end

    def prepackaged(params)
        MarketplaceGroups.find_by_group(params,:prepackaged)
    end

    def containers(params)
        MarketplaceGroups.find_by_group(params,:containers)
    end

    def customapps(params)
        MarketplaceGroups.find_by_group(params, :customapps)
    end

    def backups(params)
         Api::Backups.new.listall(params).backups_all
    end

    def scrub(params)
        {
            virtualmachines: virtualmachines(params),
            prepackaged: prepackaged(params),
            customapps: customapps(params),
            containers: containers(params),
            backups: backups(params)
        }
    end

end
