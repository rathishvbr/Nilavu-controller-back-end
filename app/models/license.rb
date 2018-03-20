class License < ApiDispatcher
        attr_writer :data
        attr_writer :created_at
        attr_writer :created_at

        class << self

            def current
                # TO-DO: cache upon load
                # if RequestStore.active?
                #    RequestStore.fetch(:current_license) { load_license }
                # else
                load_license
                # end
            end

            def reset_current
                # TO-DO: remove from cache
                # RequestStore.delete(:current_license)
            end

            def save(params)
              Api::License.new.create(params)  if valid_license?                
            end

            def destroy
                reset_current
                ## VINOV, call api and save it.
            end

            def block_changes?
                !current || current.block_changes?
            end

            def load_license
                license = last

                return unless license && license.valid?
                license
            end

            def previous(params)
                ## VINOV, call api and get the last saved one.
                {   name: 'vino',
                    email: 'vino.v@megam.io',
                    company: 'megamsystem',
                    uploaded: '2016-10-06 06:56:39 UTC',
                    started: '2016-10-06',
                    expires: '2016-11-05' }
                      # Api::License.new.show(params)
            end
        end

        def data_filename
            company_name = licensee['Company'] || licensee.values.first
            clean_company_name = company_name.gsub(/[^A-Za-z0-9]/, '')
            "#{clean_company_name}.vertice-license"
        end

        def data_file=(file)
            self.data = file.read
        end

        def license
            return nil unless data

            @license ||=
                begin
                    Gitlab::License.import(data)
                rescue Gitlab::License::ImportError
                    nil
                end
        end

        def license?
            license && license.valid?
        end

        private

        def reset_current
            self.class.reset_current
        end

        def reset_license
            @license = nil
        end

        def valid_license
            return if license?
        end

        def not_expired
            return unless license? && expired?
        end
      end
