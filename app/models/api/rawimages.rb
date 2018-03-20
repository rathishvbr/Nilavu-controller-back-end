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
    class Rawimages < ApiDispatcher
        attr_reader :rawimages_data

        def initialize
            @rawimages_data = []
            super(true) # swallow 404 errors for assemblies.
        end

        def list(params)
            result = api_request(RAWIMAGES, LIST, params)
            @rawimages_data = result[:body] unless result == nil
            yield self  if block_given?
            self
        end

        def show(params)
            result = api_request(RAWIMAGES, SHOW, params)
            @rawimages_data = result[:body] unless result == nil
            yield self  if block_given?
            self
        end

        def save(params)
            api_request(RAWIMAGES, CREATE, params)
        end

    end
end
