class UsersubscriptionActivator
  def initialize()
  end

    def start(params)
        Api::Addons.new.create(params)
    end

end
