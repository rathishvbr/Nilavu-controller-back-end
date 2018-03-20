require_dependency 'report'

module LaunchedBiller

    def usage(params)
        10
    end

    def paid(params)
        value = Api::Balances.new.show(params).balance
        return value.all_balance.first
    end

    def transacted(params)
        response = Api::Billingtransactions.new.list(params).transactions
    end

    def quotas(params)
        Api::Quota.new.list(params)
    end

    def flavors(params)
        Api::Flavors.new.list(params)
    end

    def reports(params)
      report_type = 'launches_by'

      raise Nilavu::NotFound unless report_type =~ /^[a-z0-9\_]+$/

      start_date = Time.zone.at(Time.parse(params[:start_date]).utc.to_f)   if params[:start_date].present?

      end_date =  Time.zone.at(Time.parse(params[:end_date]).utc.to_f) if params[:end_date].present?

      if params.has_key?(:category) && params[:category].to_i > 0
        category = params[:category].to_i
      else
        category = nil
      end

      params["start_date"] = start_date if start_date
      params["end_date"] = end_date if end_date
      params["category"] = category if category

      # params["group"] = group if group
      report = Report.find(report_type, params)

      raise Nilavu::NotFound if report.blank?
      return report
    end

    def bill(params)
        {
            usage: usage(params),
            paid: paid(params),
            transactions: transacted(params),
            quotas: quotas(params),
            reports: reports(params),
            flavors: flavors(params),
        }
    end

end
