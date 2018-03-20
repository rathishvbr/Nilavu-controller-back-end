export function toscaTypeParse(tosca_type, order) {
   return tosca_type.split('.')[order];
}

export function filterInputs(key, inputs) {
    if (!inputs)
        return "";
    if (!inputs.filterBy('key', key)[0])
        return "";
    return inputs.filterBy('key', key)[0].value;
}
