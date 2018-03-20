class User
    include Roleable
    attr_accessor :id
    attr_accessor :email
    attr_accessor :email_verified
    attr_accessor :password  #this is the stored encrypted password_hash
    attr_accessor :password_hash #this is the client encrypted password_hash
    attr_accessor :password_reset_key
    attr_accessor :password_reset_sent_at
    attr_accessor :api_key
    attr_accessor :first_name
    attr_accessor :last_name
    attr_accessor :phone
    attr_accessor :phone_verified
    attr_accessor :team
    attr_accessor :authority
    attr_accessor :auth_providers
    attr_accessor :authenticated
    attr_accessor :awaiting_activation
    attr_accessor :awaiting_approval
    attr_accessor :token
    attr_accessor :authenticator_name
    attr_accessor :email_valid
    attr_accessor :extra_data
    attr_accessor :origin
    attr_accessor :staged
    attr_accessor :active
    attr_accessor :approved
    attr_accessor :approved_by_id
    attr_accessor :approved_at
    attr_accessor :suspended
    attr_accessor :suspended_at
    attr_accessor :suspended_till
    attr_accessor :blocked
    attr_accessor :last_posted_at
    attr_accessor :last_emailed_at
    attr_accessor :previous_visit_at
    attr_accessor :first_seen_at
    attr_accessor :registration_ip_address
    attr_accessor :created_at
    attr_accessor :errors
    ADMIN   = 'admin'.freeze
    REGULAR = 'regular'.freeze
    def self.max_password_length
        200
    end
    def self.new_from_params(params)
        user = User.new
        params.symbolize_keys!
        params.each { |k, v| user.send("#{k}=", v) }
        user
    end
    ### TO-DO: Move the stuff specific to api_key to ApiKey model
    def find_by_apikey
        user = Api::Accounts.new.where(parms_using_apikey)
        if user
            return User.new_from_params(user.expanded)
        end
    end
    def find_by_email
        if to_hash[:email].include?('@')
            find_by_password
        end
    end
    def find_by_email_password
        ensure_password_is_hashed
        user = Api::Accounts.new.login(to_hash)
        if user
            return User.new_from_params(user.expanded)
        end
    end
    def save
        ensure_password_is_hashed
        Api::Accounts.new.save(to_hash)
    end
    def update
        ensure_password_is_hashed
        Api::Accounts.new.update(to_hash)
    end
    ## when user presses forgot password, we generate a password token.
    def forgot
        Api::Accounts.new.forgot(to_hash)
    end
    ## when user clicks on the  password reset token link
    def password_reset
        ensure_password_is_hashed
        Api::Accounts.new.password_reset(to_hash)
    end
    def email_available?
        find_by_email
    rescue Nilavu::NotFound => e
        false
    end
    # we have the user entered text raw_password.
    def password=(password)
        unless password.blank?
            @raw_password = password
        end
    end
    # Indicate that this is NOT a passwordless account for the purposes of validation
    def password_required!
        @password_required = true
    end
    def password_required?
        !!@password_required
    end
    def has_password?
        password_hash.present?
    end
    # I don't think we need this, as its handled by gateway.
    def confirm_password?(raw_password)
        return !raw_password.nil?
    end
    def blocked?
        return self.blocked.nil? ? false : self.blocked.include?("true")
    end
    def ensure_password_is_hashed
        if @raw_password
            self.password_hash = hash_password(@raw_password)
        end
    end
    def hash_password(password)
        raise "password is too long" if password.size > User.max_password_length
        Base64.strict_encode64(password)
    end

    def admin?
        if authority
          authority.eql?("admin")
            return authority.eql?("admin")
        end
        false
    end
    def staged?
        return staged.nil? ?  false : staged.include?("true")
    end
    def staff
        admin? && Rails.env.development?
    end
    # Approve this user
    def approve(approved_by, send_mail=true)
        self.approved = true
        if approved_by.is_a?(Fixnum)
            self.approved_by_id = approved_by
        else
            self.approved_by = approved_by
        end
        self.approved_at = Time.now
        save
    end
    def activate
        self.active = true
        save
    end
    def deactivate
        self.active = false
        save
    end

    def email_confirmed?
        true
    end

    def suspended?
        return suspended.nil? ?  false : suspended.include?("true")
    end
    # def suspended?
    #     suspended_till && suspended_till > DateTime.now
    # end
    ## Looks like we need a table to store user_history to record
    ##    def suspend_record
    ##        UserHistory.for(self, :suspend_user).order('id DESC').first
    ##    end
    ##
    ##    def suspend_reason
    ##        suspend_record.try(:details) if suspended?
    ##    end
    ##
    def update_ip_address!(new_ip_address)
        unless @registration_ip_address == new_ip_address || new_ip_address.blank?
            @registration_ip_address =  new_ip_address
          #  update
        end
    end
    def update_last_seen!(now=Time.zone.now)
        now_date = now.to_date
        update_previous_visit(now)
        update(:last_seen_at, now)
        update(:first_seen_at, now) unless self.first_seen_at
    end
    def new_user?
        created_at >= 24.hours.ago && !staff?
    end
    def seen_before?
        last_seen_at.present?
    end
    def org_id
        team.id if team
    end
    def to_hash
        {email: @email,
            api_key: @api_key,
            password_hash: @password_hash,
            password_reset_key: @password_reset_key,
            password_reset_sent_at: @password_reset_sent_at,
            first_name: @first_name,
            last_name: @last_name,
            phone: @phone,
            created_at: @created_at,
            phone_verified: @phone_verified,
            email_verified: @email_verified,
            staged: @staged,
            active: @active,
            authority: @authority,
            approved: @approved,
            approved_by_id: @approved_by_id,
            approved_at: @approved_at,
            suspended: @suspended,
            suspended_at: @suspended_at,
            suspended_till: @suspended_till,
            blocked: @blocked,
            last_posted_at: @last_posted_at,
            last_emailed_at: @last_emailed_at,
            previous_visit_at: @previous_visit_at,
            first_seen_at: @first_seen_at,
            registration_ip_address: @registration_ip_address
        }
    end
    private
    def parms_using_password
        { email: @email, password_hash: self.password_hash, first_name: "" }
    end
    def parms_using_apikey
        {email: @email, api_key: @api_key}
    end
    def find_by_password
        ensure_password_is_hashed
        user = Api::Accounts.new.where(parms_using_password)
        if user
            return User.new_from_params(user.expanded)
        end
    end
    def previous_visit_at_update_required?(timestamp)
        seen_before? && (last_seen_at < (timestamp - SiteSetting.previous_visit_timeout_hours.hours))
    end
    def update_previous_visit(timestamp)
        if previous_visit_at_update_required?(timestamp)
            update(:previous_visit_at, last_seen_at)
        end
    end
end
