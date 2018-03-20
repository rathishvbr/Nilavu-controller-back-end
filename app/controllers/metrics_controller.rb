require 'excon'

class MetricsController < ApplicationController

    respond_to :html, :js

    def get
        if params[:type] == "machine"
            render json: machine(params[:ip])
        elsif params[:type] == "containers"
            render json: container(params[:ip])
        else
            render json: docker(params[:ip], params[:containerId])
        end
    end

    private

    def container(ip)
        response = Excon.get("http://#{ip}:9999/api/v1.3/containers")
        # rescue status code of 404 as not found.
        return  response.body
    end


    def machine(ip)
        response = Excon.get("http://#{ip}:9999/api/v1.3/machine")
        return response.body
    end

    def docker(ip, containerId)
        response = Excon.get("http://#{ip}:9999/api/v1.3/containers/docker/#{containerId}")
        return response.body
    end

end
