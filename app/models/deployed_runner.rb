require 'deployed'

class DeployedRunner

    def self.perform_run(params)

        @type = params[:type]
        @params = params
        assembly_item = find_by(params)
        if assembly_item
            flavoursFinder(assembly_item, params)
            # f = []
            return  Deployed.new(assembly_item)
        end

        raise Nilavu::NotFound
    end

    def self.flavoursFinder(assembly_item, params)
        single_assembly = Deployed.new(assembly_item)
        flav_id = flavor_id_filter(single_assembly)
        if flav_id
            params[:id] = flav_id
            flavor_resource =  flavor_value_geter(params)
            single_assembly.assembly.inputs.push(push_flavor_value(flavor_resource, "ram"), push_flavor_value(flavor_resource, "cpu"), push_flavor_value(flavor_resource, "disk"))
        end
    end

    private

    def self.find_by(params)
        @id = params[:id]

        return Nilavu::InvalidParameters unless @id

        run_assembly_fold_by_type
    end

    def self.run_assembly_fold_by_type
        got_assembly = run_assembly
        return Nilavu::NotFound unless got_assembly

        got_assembly.baked.first
    end

    def self.run_assembly
        Api::Assembly.new.show(@params)
    end

    def self.select_from(where, key)
        where.select { |i|  i['key'].to_sym == key.to_sym }
    end

    def self.push_flavor_value(where, key)
        {"key"=>key, "value"=>where.first[key]}
    end

    def self.flavor_id_filter(single_assembly)
        single_assembly_json = JSON.parse(single_assembly.to_json)
        if id_pair = select_from(single_assembly_json["assembly"]['inputs'], 'flavor_id')
            id_pair.first['value'] if id_pair.first
        end
    end

    def self.flavor_value_geter(params)
        response = Api::Flavors.new.show(params)
        response_json = JSON.parse(response.to_json)
        return  response_json["flavors_data"]
    end

end
