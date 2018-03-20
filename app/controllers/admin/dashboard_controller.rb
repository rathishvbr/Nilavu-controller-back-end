class Admin::DashboardController < Admin::AdminController

 include LaunchableAssembler
 before_action :add_authkeys_for_api, only: [:index]


  def index
    dashboard_data = AdminDashboardData.fetch_stats(params)
    render json: {dashboard: dashboard_data || {} , regions: regions}
  end

  def problems
    # render_json_dump({problems: AdminDashboardData.fetch_problems})
    render json: success_json
  end
end
