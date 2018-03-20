import Ember from 'ember';
import layout from 'nilavu/components/country-select';

export default Ember.TextField.extend({
  layout: layout,
  tagName: 'input',
  attributeBindings: ['type'],
  type: 'tel',

  /**
   * Set the default country by it's country code. You can also set it to
   * `"auto"`, which will lookup the user's country based on their
   * IP address - requires the `geoIpLookup` option - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/default-country-ip.html).
   * Otherwise it will just be the first country in the list. **Note that if
   * you choose to do the auto lookup, and you also happen to use the
   * [jquery-cookie](https://github.com/carhartl/jquery-cookie) plugin, it
   * will store the loaded country code in a cookie for future use.**
   *
   * @property defaultCountry
   * @type String
   * @default ""
   */
  defaultCountry: '',

  /**
   * Display only the countries you specify - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/only-countries-europe.html).
   *
   * @property onlyCountries
   * @type Array
   * @default "MOBILE"
   */
  onlyCountries: undefined,

  /**
   * Specify the countries to appear at the top of the list.
   *
   * @property preferredCountries
   * @type Array
   * @default ["us", "gb"]
   */
  preferredCountries: ['us', 'gb'],

  /**
   * Get the country data for the currently selected flag.
   *
   * @property selectedCountryData
   * @type Object
   * @readOnly
   */
  selectedCountryData: Ember.computed('value', {
    get() {
      return this.$().countrySelect('getSelectedCountryData').iso2;
    },
    set() { /* no-op */ }
  }),

  /**
   * Initiate the intlTelInput instance.
   *
   * @method didInsertElement
   */
  didInsertElement() {
    let notifyPropertyChange = this.notifyPropertyChange.bind(this, 'value');

    // let Ember be aware of the changes
    this.$().change(notifyPropertyChange);

    this.$().countrySelect({
      defaultCountry: this.get('defaultCountry'),
      onlyCountries: this.get('onlyCountries'),
      preferredCountries: this.get('preferredCountries'),
    });
  },

  /**
   * Destroy the intlTelInput instance.
   *
   * @method willDestroyElement
   */
  willDestroyElement() {
    this.$().countrySelect('destroy');
  },
});
