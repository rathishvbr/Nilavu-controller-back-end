module LaunchableAssembler

    def reload_cached_item!
        SettingsPot.cached_regions
    end

    def regions
      reload_cached_item!
    end

    def generate_random_name
        random_name = Haikunator.haikunate
    end

    def domain
        current_user.team.last_used_domain.name
    end

    def quotas(params)
        Api::Quota.new.list(params)
    end

    def flavors(params)
        Api::Flavors.new.list(params)
    end

    #default currency is dollar, used as the last resort.
    # 1. currency for the region from regions.yml file
    # 2. currency from site_settings
    # 3. default currency ($)
    def currency_denoted
        '&#36;'
    end

    def assembled(params)
        {
            regions: regions,
            random_name: generate_random_name,
            domain: domain,
            currency_denoted: currency_denoted,
            quotas: quotas(params),
            flavors: flavors(params),
        }
    end
end
