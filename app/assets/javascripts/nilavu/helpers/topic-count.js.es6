Ember.Handlebars.registerBoundHelper('topic-count', function(topics, category) {
    var count = 0;
    if (topics === undefined || topics.length > 0) {
        for (var i = 0; i < topics.length; i++) {
            if (topics[i].components && topics[i].components.length > 0) {
                if (topics[i].components[0][0].tosca_type.split(".")[1].replace('analytics', 'app').replace('collaboration', 'app').replace('other', 'app') === category)
                    count++;
                }
            else {
                if (topics[i].tosca_type.split(".")[1] === category)
                    count++;
                }
        }
    }
    return count;
});
