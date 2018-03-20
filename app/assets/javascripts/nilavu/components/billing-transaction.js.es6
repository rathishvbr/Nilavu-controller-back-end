import { longDate } from 'nilavu/lib/formatter';

export default Ember.Component.extend({
    tagName: 'tr',

    gateway: Ember.computed.alias('transaction.gateway'),

    accounts_id: Ember.computed.alias('transaction.account_id'),

    amountOut: Ember.computed.alias('transaction.amountin'),

    tranDate: longDate(Ember.computed.alias('transaction.trandate')),

    tranCurrency: Ember.computed.alias('transaction.currency_type')


});
