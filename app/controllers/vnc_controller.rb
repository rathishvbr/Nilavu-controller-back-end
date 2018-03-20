class VncController < ApplicationController

    respond_to :html, :js

    skip_before_filter :check_xhr

    before_action :add_authkeys_for_api, only: [:prepare, :summarize]

    def vncshow
        render 'cockpits/entrance'
    end

    def shellshow
        render 'cockpits/entrance'
    end

end
