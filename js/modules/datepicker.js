/**
* Datepicker facade
*
* @module datepicker
* @requires jquery
* @requires pikaday
* @requires pikadayJQ
* @requires moment
*/

define( [ 'moment', 'pikaday', 'pikadayJQ' ], function( moment, pikaday, pikadayJQ ) {

	return {

		/**
		 * Declare the config object to be passed into the plugin
		 *
		 * @property pluginMappedOptions
		 * @type Object
		 */
		pluginMappedOptions: {},

		/**
		* Map our facade config to the plugin.
		*
		* @function mapConfig
		* @description Takes a config value from the facade and maps it to the appropriate config item for the plugin
		* @param { object } config -  The facade config object
		*/
		mapConfig: function( config ) {

			this.pluginMappedOptions.format = config.date.format || this.pluginMappedOptions.format;
			this.pluginMappedOptions.maxDate = config.date.max || this.pluginMappedOptions.maxDate;
			this.pluginMappedOptions.onSelect = config.date.select || this.pluginMappedOptions.onSelect;

		},

		/**
		* Initialize Datepicker
		*
		* @function datepickerInit
		* @description Display datepicker
		* @param { jquery } elem -  element we want to initialize the datepicker on
		* @param { object } config - configuration options for this datepicker instance
		*/
		datepickerInit: function( elem, config ) {

			var settings = this.mapConfig( config );

			elem.pikaday( this.pluginMappedOptions );

		},

		/**
		* Set Range Start Date
		*
		* @function setStartRange
		* @description Sets the start date of a range
		* @param { jquery } elem -  element we want to update
		* @param { date } sDate -  the updated start date value
		*/
		setStartRange: function( elem, sDate ) {
			elem.data( 'pikaday' ).setStartRange( sDate );
		},

		/**
		* Set Range End Date
		*
		* @function setEndRange
		* @description Sets the end date of a range
		* @param { jquery } elem -  element we want to update
		* @param { date } eDate -  the updated end date value
		*/
		setEndRange: function( elem, eDate ) {
			elem.data( 'pikaday' ).setEndRange( eDate );
		},

		/**
		* Set Min Date
		*
		* @function setMinDate
		* @description Sets the minimun date value allowed for this field
		* @param { jquery } elem -  element we want to update
		* @param { date } sDate -  the updated date value
		*/
		setMinDate: function( elem, sDate ) {
			elem.data( 'pikaday' ).setMinDate( sDate );
		},

		/**
		* Set Max Date
		*
		* @function setMaxDate
		* @description Sets the maximum date value allowed for this field
		* @param { jquery } elem -  element we want to update
		* @param { date } eDate -  the updated date value
		*/
		setMaxDate: function( elem, eDate ) {
			elem.data( 'pikaday' ).setMaxDate( eDate );
		},

		/**
		* Get Date
		*
		* @function getDate
		* @description Returns a date object for current selection
		* @param { jquery } elem -  element we want to get the date object for
		* @returns { date } - returns the date associated with the element if one exists
		*/
		getDate: function( elem ) {
			return elem.data( 'pikaday' ).getDate();
		},

		/**
		* Check Date Format
		*
		* @function dateFormat
		* @description Checks to see if date format is valid; Resets if not
		* @param { date } dateCheck -  date to validate
		* @param { string } strFormat - format to validate against
		* @returns { boolean } - returns true if date is valid
		*/
		dateFormat: function( dateCheck, strFormat ) {
			return moment( dateCheck, strFormat ).isValid();
		}
	};

});
