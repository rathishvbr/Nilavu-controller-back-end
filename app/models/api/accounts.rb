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
  class Accounts < ApiDispatcher

    def login(params)
      result = api_request(ACCOUNT,LOGIN, params)
      result[:body] if result && result.is_a?(Hash)
    end

    def where(params)
      result = api_request(ACCOUNT,SHOW, params)
      result[:body] if result && result.is_a?(Hash)
    end

    def list(params)
      result = api_request(ACCOUNT,LIST, params)
      result[:body] if result && result.is_a?(Hash)
    end

    def save(params)
      api_request(ACCOUNT, CREATE, params)
    end

    def update(params)
      api_request(ACCOUNT, UPDATE, params)
    end

    def forgot(params)
      api_request(ACCOUNT, FORGOT, params, true)
    end

    def remove(params)
      api_request(ACCOUNT, REMOVE, params)
    end

    def password_reset(params)
      api_request(ACCOUNT, PASSWORD_RESET, params, true)
    end

  end
end
