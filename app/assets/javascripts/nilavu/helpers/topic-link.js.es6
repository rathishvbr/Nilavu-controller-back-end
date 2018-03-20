import {registerUnbound} from 'nilavu-common/lib/helpers';

registerUnbound('topic-link', function(topic, params) {
    var name = topic.launchName(params);
    var url = topic.postDeployUrl(params);
    var string = "<a href='" + url + "' class='topic_title_link' title="+ topic.name +">" + name + "</a>";
    return new Handlebars.SafeString(string);
});
