import {createWidget} from 'nilavu/widgets/widget';
import {h} from 'virtual-dom';
import {dateNode} from 'nilavu/helpers/node';

createWidget('post-article', {
    buildKey: attrs => `post-article-${attrs.id}`,

    defaultState() {
        return {repliesAbove: []};
    },

    buildId(attrs) {
        return `post_${attrs.id}`;
    },

    buildClasses(attrs) {
        let classNames = [];
        if (attrs.via_email) {
            classNames.push('via-email');
        }
        if (attrs.isAutoGenerated) {
            classNames.push('is-auto-generated');
        }
        return classNames;
    },

    buildAttributes(attrs) {
        return {'data-post-id': attrs.id, 'data-user-id': attrs.user_id};
    },

    html(attrs) {
        const desc = attrs.data.filter((f) => f.key === 'description');
        const status = attrs.data.filter((f) => f.key === 'status');
        const rows = [];
        rows.push(h('div.col-sm-3.c_h4',status.get('firstObject').value));
        rows.push(h('div.col-sm-8.c_h4', desc.get('firstObject').value));
        rows.push(h('i', {
            className: 'circle-' + status.get('firstObject').value + " " + 'pull-right'
        }));

        const createdAt = moment(attrs.created_at).format("YYYY-MM-DDThh:mm:ssz");
        if (createdAt) {
         //this has to fix after we successfully find out the timestamp stuff
            rows.push(h('h5.post-date.hide_t', {}, "."));
            rows.push(h('div.col-sm-12', {className: ''}, dateNode(createdAt)));

        }

        return rows;
    }
});

export default createWidget('post', {
    tagName: 'li',
    buildKey: attrs => `post-${attrs.id}`,
    shadowTree: true,

    buildAttributes(attrs) {
        return attrs.cloaked
            ? {
                style: `height: ${attrs.height}px`
            }
            : undefined;
    },

    buildId(attrs) {
        return attrs.cloaked
            ? `post_${attrs.post_number}`
            : undefined;
    },

    buildClasses(attrs) {
        if (attrs.cloaked) {
            return 'cloaked-post';
        }
        const classNames = [];

        if (attrs.isWhisper) {
            classNames.push('whisper');
        } //for milestone events change color

        return classNames;
    },

    html(attrs) {
        if (attrs.cloaked) {
            return '';
        }

        return this.attach('post-article', attrs);
    },

    toggleLike() {
        const post = this.model;
        const likeAction = post.get('likeAction');

        if (likeAction && likeAction.get('canToggle')) {
            return likeAction.togglePromise(post).then(result => this._warnIfClose(result));
        }
    },

    _warnIfClose(result) {
        if (!result || !result.acted) {
            return;
        }

        const kvs = this.keyValueStore;
        const lastWarnedLikes = kvs.get('lastWarnedLikes');

        // only warn once per day
        const yesterday = new Date().getTime() - 1000 * 60 * 60 * 24;
        if (lastWarnedLikes && parseInt(lastWarnedLikes) > yesterday) {
            return;
        }

        const {remaining, max} = result;
        const threshold = Math.ceil(max * 0.1);
        if (remaining === threshold) {
            bootbox.alert(I18n.t('post.few_likes_left'));
            kvs.set({key: 'lastWarnedLikes', value: new Date().getTime()});
        }
    },

    undoPostAction(typeId) {
        const post = this.model;
        return post.get('actions_summary').findProperty('id', typeId).undo(post);
    },

    deferPostActionFlags(typeId) {
        const post = this.model;
        return post.get('actions_summary').findProperty('id', typeId).deferFlags(post);
    }
});
