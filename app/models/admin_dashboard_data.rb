class AdminDashboardData

    GLOBAL_REPORTS ||= ['sales', 'launches','backups', 'snapshots']

    COUNT_REPORTS ||= ['userdot', 'launchdot', 'popularappsdot','recentlaunches','recentsignups','populardot']

    def self.fetch_stats(options)
        AdminDashboardData.new.as_json(options)
    end

    def self.stats_cache_key
        'nilavu-dash-stats'
    end

    #def self.fetch_problems
    #  AdminDashboardData.new.problems
    #end

    def as_json(options = nil)
        @json ||= {
            global_reports: AdminDashboardData.reports(GLOBAL_REPORTS, options),
            count_reports: AdminDashboardData.reports(COUNT_REPORTS,options),
            updated_at: Time.zone.now.as_json
        }
    end

    def self.reports(source, options)
      source.map { |type| Report.find(type, options).as_json }
    end

    def rails_env_check
        I18n.t("dashboard.rails_env_warning", env: Rails.env) unless Rails.env.production?
    end

    def host_names_check
        I18n.t("dashboard.host_names_warning") if ['localhost', 'production.localhost'].include?(Nilavu.current_hostname)
    end

end
