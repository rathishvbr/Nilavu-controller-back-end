class CephsController < ApplicationController

  skip_before_filter :redirect_to_cephlogin_if_required

  def create
    params.require(:email)
    user = CephUser.new
    user_params.each { |k, v| user.send("#{k}=", v) }

    unless user = user.find_by_email
      return not_signedup
    end

    user.email_confirmed? ? login(user) : not_activated(user)
  end

  def destroy
    log_off_cephuser
  end

  private

  def user_params
    params.permit(:email, :access_key, :secret_key)
  end


  def login(user)
    log_on_cephuser(user)
    redirect_to '/buckets'
  end

  def invalid_credentials
    render_with_error('cephlogin.incorrect_email_or_password')
  end

  def not_activated(user)
    render_with_error('cephlogin.not_activated')
  end

  def not_signedup
    redirect_to path('/cephsignup') and return
  end

end
