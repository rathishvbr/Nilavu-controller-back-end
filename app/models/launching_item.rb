require 'favour_item'

class LaunchingItem

    attr_accessor :email, :api_key, :org_id
    attr_accessor :mkp_name, :version, :cattype, :flavor, :os_name
    attr_accessor :assemblyname, :componentname, :domain
    attr_accessor :keypairname, :keypairoption
    attr_accessor :region
    attr_accessor :resource, :flavor_id, :storage_hddtype
    attr_accessor :oneclick, :options, :envs, :number_of_units
    attr_accessor :public_ipv4, :private_ipv4
    attr_accessor :public_ipv6, :private_ipv6
    attr_accessor :type, :source , :scm_name, :scmtoken, :scmowner #historical keys, not changing them. duh ! is it ?
    attr_accessor :scmbranch, :scmtag
    attr_accessor :bitnami_username, :bitnami_password, :app_username, :app_password
    attr_accessor :root_username, :backup_name,:backup_id, :backup, :quota_ids, :user_launch_patternname
    attr_accessor :vm_cpu_cost_per_hour, :vm_ram_cost_per_hour, :vm_disk_cost_per_hour, :container_cpu_cost_per_hour, :container_memory_cost_per_hour


    ONE           = 'one'.freeze

    def initialize(launching_params)
         convert_labels_as_readable(launching_params)
        [:email, :api_key, :org_id, :mkp_name, :os_name, :version, :cattype,
         :assemblyname, :domain, :keypairname, :keypairoption,
         :region, :resource, :flavor_id, :storage_hddtype, :oneclick,
         :quota_ids, :number_of_units, :bitnami_username, :bitnami_password,:root_username].each do |setting|
         raise Nilavu::InvalidParameters unless launching_params[setting]
           self.send("#{setting}=",launching_params[setting])
        end

        optionals(launching_params)

    end

    def  componentname
        @componentname ||= Haikunator.haikunate
    end

    def has_docker?
        ## this has to be based on cattype.
        cattype.downcase.include? Api::Assemblies::CONTAINER.singularize.downcase
    end

    alias name mkp_name

    # TO-DO: This can be shortened into 1 statement by  mapping as follows
    # %w(id, name, cattype, ...).map ...
    def to_h
        res =   {
            email: email,
            api_key: api_key,
            org_id: org_id,
            mkp_name: mkp_name,
            os_name: os_name,
            version: version,
            assemblyname: assemblyname,
            componentname: componentname,
            domain: domain,
            region: region,
            resource: resource,
            storage_hddtype: storage_hddtype,
            flavor_id: flavor_id,
            oneclick: oneclick,
            bitnami_username: bitnami_username,
            bitnami_password: bitnami_password,
            app_username: app_username,
            app_password: app_password,
            sshkey: keypairname,
            root_username: root_username,
            root_password: keypairname,
            keypairoption: keypairoption,
            number_of_units: number_of_units,
            cattype: cattype,
            options: options,
            envs: envs,
            provider: provider,
            backup: backup,
            backup_name: backup_name,
            backup_id: backup_id,
            public_ipv4: public_ipv4,
            private_ipv4: private_ipv4,
            public_ipv6: public_ipv6,
            private_ipv6: private_ipv6,
            quota_ids: quota_ids,
            user_launch_patternname: user_launch_patternname,
        }

        set_git(res)
        res
    end


    def filtered_for_ssh
        Hash[%w(email api_key org_id keypairname keypairoption).map {|x| [x.to_sym, self.send(x.to_sym)]}]
    end

    private

    def convert_labels_as_readable(launching_params)
      [:options, :envs].each do |setting|
          self.send("#{setting}=", JSON.parse(launching_params[setting])) if launching_params.has_key?(setting)
      end
    end

    def optionals(launching_params)
        [:type, :scm_name, :source, :scmtoken, :scmbranch, :scmtag, :scmowner, :user_launch_patternname, :backup, :backup_name, :backup_id, :app_username, :app_password].each do |setting|
            self.send("#{setting}=",launching_params[setting]) if launching_params.has_key?(setting)
        end

        [:public_ipv4, :private_ipv4, :public_ipv6, :private_ipv6].each do |ns|
           self.send("#{ns}=", network_selected?(launching_params[:networkSettings], ns) || false) if launching_params.has_key?(:networkSettings)
        end
    end

    def ensure_provider
        #DOCKER
        SiteSetting.docker_default
    end

    def provider
        return ONE unless has_docker?
        ensure_provider
    end

    def network_selected?(raw_data, nettype)
        JSON.parse(raw_data).collect  do |n|
           n['value'] if n['key'].to_sym == nettype
        end.join('')
    end

    # this is screwy, i don't why this is called in to_hash,
    # what is the purpose of setting optionals then ?
    def set_git(params)
        [:type, :source, :scm_name, :scmtoken, :scmowner,
        :scmbranch, :scmtag ].each do |repo_setting|
            params[repo_setting] = self.send("#{repo_setting}") if self.send("#{repo_setting}")
        end
        params
    end


end
