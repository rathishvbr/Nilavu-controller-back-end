##
## Copyright [2013-2016] [Megam Systems]
##
## Licensed under the Apache License, Version 2.0 (the "License");
## you may not use this file except in compliance with the License.
## You may obtain a copy of the License at
##
## http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.
##
class MarketplacesController < ApplicationController
    respond_to :js
    before_action :check_billings, only: [:index]
    before_action :add_authkeys_for_api, only: [:index, :show, :list, :create]

    def index
        respond_to do |format|
            format.html { render 'cockpits/entrance' }
            format.json { render json: { results: aggregate(HoneyPot.cached_marketplace_groups(params))}}
        end
    end

    def create
        params["inputs"] = JSON.parse(params["inputs"])
        params["plans"] = JSON.parse(params["plans"])
        res = Api::Marketplaces.instance.save(params)
        render json: res
    end

    def show
      data = Api::Marketplaces.instance.show(params)
      render json: data
    end

    def list
        data = Api::Rawimages.new.list(params)
        render json: {success: true, data: data}
    end

    def predeploy
       render 'cockpits/entrance'
    end

    private

    def aggregate(grups)
        aggregated ||= {}
        grups.map{|k,v| aggregated[k] = v}
        aggregated
    end
end
