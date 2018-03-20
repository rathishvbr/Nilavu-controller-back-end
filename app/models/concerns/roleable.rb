module Roleable

  # any user that is either a moderator or an admin
  def staff?
    admin?
  end

  def regular?
    !staff?
  end


  def grant_admin!
    set_permission(User::ADMIN)
  end

  def revoke_admin!
    set_permission(User::REGULAR)
  end

  def save_and_refresh!
      self.update
  end

  def set_permission(value)
    self.send("authority=", value)
    save_and_refresh!
  end

end
