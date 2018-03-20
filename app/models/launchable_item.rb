class LaunchableItem

    attr_accessor :versions,  :marketplace_item

    def initialize(marketplace_item)
        @marketplace_item = marketplace_item

        ensure_version_is_flattened
    end

    def provider
      @marketplace_item.provided_by
    end

    def id
        @marketplace_item.id
    end

    def name
        @marketplace_item.flavor
    end

    def cattype
        @marketplace_item.cattype
    end

    def category
        Nilavu.default_categories.select { |i| i == @marketplace_item.cattype.downcase }.first
    end

    def logo
        @marketplace_item.image
    end

    def selected_version
        @versions.first if versions
    end

    def description
        if plan = find_plan_for(selected_version)
            return plan[1]
        end
    end

    def options
        @marketplace_item.options
    end

    def envs
        @marketplace_item.envs
    end

    def inputs
        @marketplace_item.inputs
    end

    def oneclick
        @marketplace_item.options.collect { |k| k['value'] if k['key'] == PrepackagedScrubber::ONECLICK }
    end

    # from a bunch of plans, we match the plan for a version
    # eg: debian jessie 7, 8
    def find_plan_for(version)
        @marketplace_item.plans.select { |v| v['key'] == version }.reduce { :merge }
    end


    def has_docker?
        name.include? Api::Assemblies::DOCKERCONTAINER
    end

    def token
        session[:authentication][:token]
    end

    alias has_token? token

    # TO-DO: This can be shortened into 1 or statements by  mapping as follows
    # %w(id, name, cattype, ...)
    def to_h
        {
            id:   id,
            name: name,
            provider: provider,
            category: category,
            cattype: cattype,
            logo: logo,
            versions: @versions,
            options: options,
            envs: envs,
            inputs: inputs
        }
    end

    private

    def ensure_version_is_flattened
      @versions = @marketplace_item.plans.map { |v| v['key'] }.sort
    end

end
