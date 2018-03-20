require_dependency 'report'

class Admin::ReportsController < Admin::AdminController
 # respond_to :html, :json
 before_action :add_authkeys_for_api, only: [:show]

  def show

    report_type = params[:type]

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

    render json: { success: true , report: report}


  end

end
