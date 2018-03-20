class BillingsController < ApplicationController
    include CurrentBilly
    include LaunchableAssembler
    include LaunchedBiller
    respond_to :html, :json
    before_action :add_authkeys_for_api, only: [:index, :show]
    INVOICES_PROCESSE = 'Invoices'.freeze
    def index
        render json: {regions: regions}.merge(bill(params))
    end

    def show
        render json: { success: true, whmcsurl: link(params[:email])}
    end

    private

    def link(email)
        if bildr = bildr_processe_is_ready(INVOICES_PROCESSE)
            bildr.new.invoice_url(email)
        else
            something_wrong
        end
    end

    def bildr_processe_is_ready(processe)
        bildr = Biller::Builder.new(processe)
        return unless bildr.implementation
        bildr.implementation
    end

    def something_wrong
        { result: 'error', error: 'user.activation.unknown', swallow_404: 'false' }
    end

end
