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

module Api
    class Snapshots < ApiDispatcher

        attr_reader :snapshots_all, :snapshots_per, :snapshots_create

        def initialize
            @snapshots_all = []
            @snapshots_per = []
            @snapshots_create = []
            super(true) # swallow 404 errors for assemblies.
        end

        def show(params, &_block)
            @snapshots_per = api_request(SNAPSHOTS, SHOW, params)
            yield self  if block_given?
            self
        end

        def list(params, &_block)
            @snapshots_all = api_request(SNAPSHOTS, LIST, params)
            yield self  if block_given?
            self
        end

        def create(params)
            bld_data = build_data(params)
            api_request(SNAPSHOTS, CREATE, params.merge(bld_data))
        end

        def build_data(params)
            {
                inputs: [inputs_for_snaps(params)]
            }
        end

        private
        def inputs_for_snaps(params)
            { key: "quota_id", value: params[:quota_id] }
        end

    end
end
