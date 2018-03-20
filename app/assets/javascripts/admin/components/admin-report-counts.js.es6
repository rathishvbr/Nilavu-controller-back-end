export default Ember.Component.extend({
    tagName: 'tr',
    reverseColors: Ember.computed.match( 'report.type', /^(time_to_first_response|topics_with_no_response)$/ ),
    classNameBindings: ['reverseColors'],

    regionsCurrency: function( ) {
        const enabledRegions = this.get( 'regions' ).filter( function( c ) {
            if ( c.enabled ) {
                return c.currency;
            }
        });
        let regionCurrencies = enabledRegions.filterBy( 'currency' )[ 0 ];
        return regionCurrencies.currency;
    }.property( "regions" ),

    suffixCurrency:function() {
        return  ( this.get('report.type') === "sales" );
    }.property( 'report' )

});
