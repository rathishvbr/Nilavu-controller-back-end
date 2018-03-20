class Admin::AdminController < ApplicationController

  before_filter :ensure_logged_in
  before_filter :ensure_admin

  def index
    render nothing: true
  end

end
