
class Report

    attr_accessor :type, :data, :total, :prev30Days, :start_date, :end_date, :category, :group, :params

    def self.default_days
        30
    end

    def initialize(type)
        @type = type
        @start_date ||= 1.month.ago.beginning_of_day
        @end_date ||= Time.zone.now.end_of_day
    end

    def as_json(options=nil)
        {
            type: type,
            title: I18n.t("admin_js.admin.dashboard.#{type}.title"),
            xaxis: I18n.t("admin_js.admin.dashboard.#{type}.xaxis"),
            yaxis: I18n.t("admin_js.admin.dashboard.#{type}.yaxis"),
            data: data,
            total: total,
            start_date: start_date,
            end_date: end_date,
            category: category,
            prev30Days: self.prev30Days
        }
    end

    def to_hash
        {
            type_of: type,
            start_date: start_date,
            end_date: end_date,
            category: category || "",
            group: group || ""
        }.merge(params)
    end

    def self.report_sales(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'sales.created_at'

    end

    def self.report_backups(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'backups.created_at'

    end

    def self.report_snapshots(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'snapshots.created_at'

    end

    def self.report_launches(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'launches.created_at'

    end

    def self.report_launches_by(report)
        report.type = 'sales'
        basic_report_about report, Api::Reportdata.new, :listable_count_per_user_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'launches.created_at'

    end


    def self.report_userdot(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'userdot.created_at'

    end

    def self.report_launchdot(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'launchdot.created_at'

    end

    def self.report_popularappsdot(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'popularappsdot.created_at'

    end

    def self.report_recentlaunches(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'recentlaunches.created_at'

    end
    def self.report_recentsignups(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'recentsignups.created_at'

    end

    def self.report_populardot(report)
        basic_report_about report, Api::Reportdata.new, :listable_count_per_day, report.to_hash

        countable = report.data if report.data

        add_counts report, countable, 'populardot.created_at'

    end

    def self.basic_report_about(report, subject_class, report_method, *args)
        report.data = []
        subject_class.send(report_method, *args).each do |report_result|
            report.data = report_result.data
        end
    end



    def Report.add_report(name, &block)
        singleton_class.instance_eval { define_method("report_#{name}", &block) }
    end

    def self.find(type, opts=nil)

        opts ||= {}
        opts = opts.symbolize_keys
        # Load the report
        report = Report.new(type)
        report.start_date = opts[:start_date] if opts[:start_date]
        report.end_date = opts[:end_date] if opts[:end_date]

        report.category = opts[:category] if opts[:category]
        report.group = opts[:group] if opts[:group]

        report_method = :"report_#{type}"

        report.params = opts.reject {|k,v| [:start_date, :end_date, :category, :group].include?(k)}

        if respond_to?(report_method)
            send(report_method, report)
        elsif type =~ /_reqs$/
            req_report(report, type.split(/_reqs$/)[0].to_sym)
        else
            return nil
        end

        report
    end

    def self.add_counts(report, subject_class, query_column = 'updated_at')
        report.total      = subject_class.size
    end

end
