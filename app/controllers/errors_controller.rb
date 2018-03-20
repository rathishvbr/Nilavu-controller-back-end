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
class ErrorsController < ApplicationController
  def not_found
    raise Nilavu::NotFound
  end

  # Give us an endpoint to use for 404 content in the ember app
  def not_found_body
    render text: build_not_found_page(200, false)
  end

  #def internal_error
  #  render_500
  #end
end
