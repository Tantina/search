/**
* Advanced search module.
* Return module object literal for testing.
*
* @module advancedSearch
* @requires jquery
* @requires datepicker
* @exports advancedSearch
*/

/**
* requireJS define function
* @function define
* @param { jQuery } $ - jQuery function
*/
require('../../css/modules/_advanced-search.scss');

define( [ 'datepicker' ], function( datepicker ) {

	var module = {
		/**
		 * Default configurable settings.
		 *
		 * @property defaults
		 * @type Object
		 */
		defaults: {
			storageKey: {
				text: 'advancedSearchTextCriteria',
				date: 'advancedSearchDateCriteria'
			},
			className: {
				visible: 'visible',
				disabled: 'disabled',
				active: 'active',
				hidden: 'hidden',
				error: 'error',
				activate: 'activate'
			},
			action: {
				remove: '.js-advanced-search__criteria--remove',
				add: '.js-advanced-search__criteria--add',
				search: '.js-advanced-search__search-submit',
				close: '.js-advanced-search__panel-close'
			},
			list: {
				text: '.js-advanced-search__criteria-list--text',
				date: '.js-advanced-search__criteria-list--date'
			},
			textCriteria: {
				text: '.js-advanced-search__search-text',
				operator: '.js-advanced-search__logic-operator',
				field: '.js-advanced-search__search-field',
				error: '.js-advanced-search__error--text'
			},
			dateCriteria: {
				lastMonth: '.js-advanced-search__last-month',
				between: {
					start: '.js-advanced-search__date-input--start',
					end: '.js-advanced-search__date-input--end'
				},
				error: '.js-advanced-search__error--date',
				format: 'DD/MM/YYYY'
			},
			searchForm: {
				form: '.search__form',
				input: '.js-search__input-text',
				button: '.js__search-submit',
				link: '.js-advanced-search__link'
			},
			limitCharacters: 200
		},

		/**
		 * Constructor to set up module.
		 * - Set element to jQuery object
		 * - Set up events
		 * - Set up saved search data
		 *
		 * @method constructor
		 * @public
		 * @param { object } element - Required: wrapping search form element
		 * @param { object } options - Optional: pass in options to overwrite defaults
		 */
		constructor: function( element, options ) {
			this.element = $( element );
			this.options = $.extend({}, this.defaults, options );
			this.setElements();
			this.setDatepicker();
			this.setEvents();
			this.setCriteria();
		},

		/**
		 * Sets static references to DOM elements.
		 *
		 * @method setElements
		 * @public
		 */
		setElements: function() {
			this.simpleSearch = $( this.options.searchForm.form );
			this.searchLink = $( this.options.searchForm.link );
			this.advSrhFrm = document.forms.advSearchFrm;
			this.closePanel = $( this.options.action.close, this.element );
			this.addCriteria = $( this.options.action.add, this.element );
			this.dateSet = $( this.options.dateCriteria.lastMonth, this.element );
			this.searchBtn = $( this.options.action.search, this.element );
			this.errorText = $( this.options.textCriteria.error, this.element );
			this.errorDate = $( this.options.dateCriteria.error, this.element );
			this.listCriteriaText = $( this.options.list.text, this.element );
			this.listCriteriaDate = $( this.options.list.date, this.element );
		},

		/**
		 * Sets the search events
		 *
		 * @function setEvents
		 * @public
		 */
		setEvents: function() {
			var _this = this;

			this.showTextError( this.errorText, '* Please enter ' + this.options.limitCharacters + ' characters or less' );

			this.searchLink.on( 'click', function( e ) {
				e.preventDefault();
				_this.toggleSearchPanel();
			});

			this.closePanel.on( 'click', function() {
				_this.closeSearchPanel();
			});

			this.listCriteriaText.on( 'click', this.options.action.remove, function( e ) {
				var item = e.target;
				_this.removeCriteriaItem( item );
			});

			this.addCriteria.on( 'click', function() {
				_this.addCriteriaItem();
			});

			this.dateSet.on( 'change', function() {
				_this.listCriteriaDate.find( 'input[value=set]' ).prop( 'checked', true );
			});

			this.searchBtn.on( 'click', function( e ) {
				e.preventDefault();
				_this.saveCriteria();
				_this.submitAdvancedSearch();
			});

			this.listCriteriaText.on( 'keyup change input', this.options.textCriteria.text, function() {
				_this.setStatusSearchButton();
				_this.setTextLimitation( this );
			});

			this.listCriteriaDate.find( 'input[name=dateType]' ).on( 'change', function() {
				_this.setStatusSearchButton();
			});

			this.listCriteriaDate.find( 'input[type=text]' ).on( 'change', function() {
				_this.validateDateRange( this );
				_this.setStatusSearchButton();
			});

		},

		/**
		 * Sets a disabled status for the simple search
		 *
		 * @method disableSimpleSearch
		 * @public
		 */
		disableSimpleSearch: function() {
			this.simpleSearch.addClass( this.options.className.disabled );
			this.simpleSearch.find( 'input, select, button' ).attr( 'disabled', true );
		},

		/**
		 * Sets an enabled status for the simple search
		 *
		 * @method enableSimpleSearch
		 * @public
		 */
		enableSimpleSearch: function() {
			this.simpleSearch.removeClass( this.options.className.disabled );
			this.simpleSearch.find( 'input, select, button' ).attr( 'disabled', false );

			if ( !$( this.options.searchForm.input ).val() ) {
				this.simpleSearch.find( this.options.searchForm.button ).attr( 'disabled', true );
			}
		},

		/**
		 * Opens the advanced search form and activates the search link
		 *
		 * @method openSearchPanel
		 * @public
		 */
		openSearchPanel: function() {
			this.searchLink.addClass( this.options.className.active );
			this.element.parent().addClass( this.options.className.visible );
		},

		/**
		 * Closes the advanced search form and disactivates the search link
		 *
		 * @method closeSearchPanel
		 * @public
		 */
		closeSearchPanel: function() {
			this.searchLink.removeClass( this.options.className.active );
			this.element.parent().removeClass( this.options.className.visible );
			this.clearCriteria();
			this.enableSimpleSearch();
		},

		/**
		 * Toggles "open"/"close" status for the advanced search form
		 *
		 * @method toggleSearchPanel
		 * @public
		 */
		toggleSearchPanel: function() {
			var $panel = this.element;
			if ( $panel.parent().hasClass( this.options.className.visible ) ) {
				this.enableSimpleSearch();
				this.closeSearchPanel();
			} else {
				this.disableSimpleSearch();
				this.openSearchPanel();
			}
		},

		/**
		 * Removes a criteria item for the search
		 *
		 * @method removeCriteriaItem
		 * @public
		 * @param {Object} item The child of the removed criteria
		 */
		removeCriteriaItem: function( item ) {
			$( item ).parent().remove();

			if ( this.listCriteriaText.children().length < 5 ) {
				this.addCriteria.removeClass( this.options.className.hidden );
			}

			if ( !this.listCriteriaText.find( this.options.textCriteria.text ).hasClass( this.options.className.error ) ) {
				this.deactivateTextError( this.errorText );
			}

			this.setStatusSearchButton();
		},

		/**
		 * Adds a criteria item for the search
		 *
		 * @method addCriteriaItem
		 * @public
		 */
		addCriteriaItem: function() {
			var temp = this.listCriteriaText.children()[ 1 ], // use the second li as template since it contains operator dropdown
				item = $( temp ).clone(),
				newID = this.listCriteriaText.children().length + 1,
				input = $( item ).children( this.options.textCriteria.text ),
				_this = this;

			$( input ).val( '' ).removeClass( this.options.className.error ); // clean the input

			$( item ).children( this.options.action.remove ).removeClass( this.options.className.hidden );
			$( input ).attr( 'name', 'search' + newID ).attr( 'id', 'search' + newID );
			$( input ).prev( 'label' ).attr( 'for', 'search' + newID );
			$( item ).children( this.options.textCriteria.field ).attr( 'name', 'field' + newID ).attr( 'id', 'field' + newID );
			$( item ).children( this.options.textCriteria.field ).prev( 'label' ).attr( 'for', 'field' + newID );
			$( item ).children( this.options.textCriteria.operator ).attr( 'name', 'operator' + newID ).attr( 'id', 'operator' + newID );
			$( item ).children( this.options.textCriteria.operator ).prev( 'label' ).attr( 'for', 'operator' + newID );
			this.listCriteriaText.append( item );

			// to init placeholder for new inputs - IE only
			if ( !( 'placeholder' in document.createElement( 'input' ) ) ) {
				Placeholders.enable( input[0] );

				input.on( 'focus', function( ) {
					Placeholders.disable( this );

					//fix for IE8 - DU-4247
					setTimeout( function() {
						Placeholders.enable( $( temp ).children( _this.options.textCriteria.text )[0] );
					}, 0 );

				});
				input.on( 'blur', function() {
					Placeholders.enable( this );
				});
			}

			if ( this.listCriteriaText.children().length === 5 ) {
				this.addCriteria.addClass( this.options.className.hidden );
			}
		},

		/**
		 * Gets the text criteria data
		 *
		 * @method getTextCriteria
		 * @public
		 * @return {Object} criteria The entered text data
		 */
		getTextCriteria: function() {
			var text = this.listCriteriaText.find( this.options.textCriteria.text ),
				field = this.listCriteriaText.find( this.options.textCriteria.field ),
				operator = this.listCriteriaText.find( this.options.textCriteria.operator ),
				criteria = [],
				i;

			for ( i = 0; i < field.length; i++ ) {
				criteria.push({
					'text': $( text[ i ] ).val().trim(),
					'field': $( field[ i ] ).val().trim(),
					'operator': i == 0 ? '' : $( operator[ i - 1 ] ).val().trim()
				});
			}

			return criteria;
		},

		/**
		 * Saves the text criteria data to the storage
		 *
		 * @method saveTextCriteria
		 * @public
		 */
		saveTextCriteria: function() {
			var text = this.getTextCriteria();
			sessionStorage.setItem( this.options.storageKey.text, JSON.stringify( text ) );
		},

		/**
		 * Sets the text criteria data from the storage
		 *
		 * @method setTextCriteria
		 * @param {Object} criteria The criteria text data
		 * @public
		 */
		setTextCriteria: function( criteria ) {
			var text,
				field = this.listCriteriaText.find( this.options.textCriteria.field ),
				operator,
				i, j;

			if ( criteria.length !== field.length ) {
				for ( j = 0; j < criteria.length - field.length; j++ ) {
					this.addCriteriaItem();
				}
			}

			text = this.listCriteriaText.find( this.options.textCriteria.text );
			field = this.listCriteriaText.find( this.options.textCriteria.field );
			operator = this.listCriteriaText.find( this.options.textCriteria.operator );

			for ( i = 0; i < field.length; i++ ) {
				text[ i ].value = criteria[ i ].text;
				field[ i ].value = criteria[ i ].field;
				if ( i !== field.length - 1 ) {
					operator[ i ].value = criteria[ i + 1 ].operator;
				}
			}
		},

		/**
		 * Clear the text criteria fields
		 *
		 * @method clearTextCriteria
		 * @public
		 */
		clearTextCriteria: function() {
			var field = this.listCriteriaText.find( this.options.textCriteria.field ),
				i,
				criteria = [
					{text: '', field: 'all-fields', operator: ''},
					{text: '', field: 'all-fields', operator: 'and'},
					{text: '', field: 'all-fields', operator: 'and'}];

			for ( i = 3; i < field.length; i++ ) {
				this.removeCriteriaItem( field[i] );
			}

			this.setTextCriteria( criteria );

		},

		/**
		 * Gets the date criteria data
		 *
		 * @method getDateCriteria
		 * @public
		 * @return {Object} criteria The entered date data
		 */
		getDateCriteria: function() {
			var criteria = {};

			criteria.type = this.listCriteriaDate.find( 'input[name=dateType]:checked' ).val();

			switch ( criteria.type ) {
			case 'all':
				break;
			case 'set':
				criteria.lastMonth = this.listCriteriaDate.find( this.options.dateCriteria.lastMonth ).val();
				break;
			case 'between':
				criteria.dateStart = this.listCriteriaDate.find( this.options.dateCriteria.between.start ).val();
				criteria.dateEnd = this.listCriteriaDate.find( this.options.dateCriteria.between.end ).val();
				break;
			}

			return criteria;
		},

		/**
		 * Saves the date criteria data to the storage
		 *
		 * @method saveDateCriteria
		 * @public
		 */
		saveDateCriteria: function() {
			var date = this.getDateCriteria();
			sessionStorage.setItem( this.options.storageKey.date, JSON.stringify( date ) );
		},

		/**
		 * Sets the date criteria data from the storage
		 *
		 * @method setDateCriteria
		 * @param {Object} criteria The criteria date data
		 * @public
		 */
		setDateCriteria: function( criteria ) {
			this.listCriteriaDate.find( 'input[name=dateType][value=' + criteria.type + ']' ).prop( 'checked', true );

			switch ( criteria.type ) {
			case 'all':
				break;
			case 'set':
				this.listCriteriaDate.find( this.options.dateCriteria.lastMonth ).val( criteria.lastMonth );
				break;
			case 'between':
				this.listCriteriaDate.find( this.options.dateCriteria.between.start ).val( criteria.dateStart );
				this.listCriteriaDate.find( this.options.dateCriteria.between.end ).val( criteria.dateEnd );
				break;
			}
		},

		/**
		 * Clear the text criteria fields
		 *
		 * @method clearDateCriteria
		 * @public
		 */
		clearDateCriteria: function() {
			this.listCriteriaDate.find( 'input[name=dateType][value=all]' ).prop( 'checked', true );
			this.listCriteriaDate.find( this.options.dateCriteria.lastMonth ).val( 6 );
			this.listCriteriaDate.find( this.options.dateCriteria.between.start ).val( '' );
			this.listCriteriaDate.find( this.options.dateCriteria.between.end ).val( '' );
		},

		/**
		 * Sets all search criteria data from the storage
		 *
		 * @method setCriteria
		 * @public
		 */
		setCriteria: function() {
			var text = JSON.parse( sessionStorage.getItem( this.options.storageKey.text ) ),
				date = JSON.parse( sessionStorage.getItem( this.options.storageKey.date ) );

			if ( text ) {
				this.setTextCriteria( text );
			}

			if ( date ) {
				this.setDateCriteria( date );
			}

			if ( text || date ) {
				this.setStatusSearchButton();
			}
		},

		/**
		 * Saves all search criteria data to the storage
		 *
		 * @method saveCriteria
		 * @public
		 */
		saveCriteria: function() {
			this.saveTextCriteria();
			this.saveDateCriteria();
		},

		/**
		 * Removes all search criteria data from the storage
		 *
		 * @method removeCriteria
		 * @public
		 */
		removeCriteria: function() {
			sessionStorage.removeItem( this.options.storageKey.text );
			sessionStorage.removeItem( this.options.storageKey.date );
		},

		/**
		 * Clear all search fields and set the default values
		 *
		 * @method clearCriteria
		 * @public
		 */
		clearCriteria: function() {
			var text = JSON.parse( sessionStorage.getItem( this.options.storageKey.text ) ),
				date = JSON.parse( sessionStorage.getItem( this.options.storageKey.date ) );

			if ( !text ) {
				this.clearTextCriteria();
			}

			if ( !date ) {
				this.clearDateCriteria();
			}
		},

		/**
		 * Disables the search button
		 *
		 * @method disableSearchBtn
		 * @public
		 */
		disableSearchBtn: function() {
			this.searchBtn.attr( 'disabled', 'disabled' ).addClass( this.options.className.disabled );
		},

		/**
		 * Enables the search button
		 *
		 * @method enableSearchBtn
		 * @public
		 */
		enableSearchBtn: function() {
			this.searchBtn.removeAttr( 'disabled' ).removeClass( this.options.className.disabled );
		},

		/**
		 * Sets a disabled/enabled status for the search button
		 *
		 * @method setStatusSearchButton
		 * @public
		 */
		setStatusSearchButton: function() {
			var fields = this.listCriteriaText.find( this.options.textCriteria.text ),
				dateType = this.listCriteriaDate.find( 'input[name=dateType]:checked' ).val(),
				startDate = this.listCriteriaDate.find( this.options.dateCriteria.between.start ),
				endDate = this.listCriteriaDate.find( this.options.dateCriteria.between.end ),
				isHadValue,
				isDateMatched,
				isValidated = true,
				i,
				item;

			// Checking if there is search text
			for ( i = 0; i < fields.length; i++ ) {
				item = $( fields[ i ] ).val().trim();

				if ( item ) {
					isHadValue = true;

					if ( item.length > this.options.limitCharacters ) {
						isValidated = false;
						break;
					}
				}
			}

			if ( ( dateType == 'between' ) &&
				( ( !startDate.val() || startDate.hasClass( this.options.className.error ) ) ||
				( !endDate.val() || endDate.hasClass( this.options.className.error ) ) ) ) {
				isValidated = false;
			}

			// Checking if date parameters are set
			isDateMatched = dateType !== 'all';

			if ( ( isHadValue || isDateMatched ) && isValidated ) {
				this.enableSearchBtn();
			} else {
				this.disableSearchBtn();
			}
		},

		/**
		 * Shows the text error
		 *
		 * @method showTextError
		 * @public
		 * @param {Object} elem The element of the search error
		 * @param {String} text The error string
		 */
		showTextError: function( elem, text ) {
			$( elem ).text( text ).addClass( this.options.className.visible );
		},

		/**
		 * Activate error styling
		 *
		 * @method activateTextError
		 * @public
		 * @param {Object} elem The element of the search error
		 */
		activateTextError: function( elem ) {
			this.errorText.addClass( this.options.className.activate );
			$( elem ).addClass( this.options.className.error );
		},

		/**
		 * Hides the text error
		 *
		 * @method hideTextError
		 * @public
		 * @param {Object} elem The element of the search error
		 */
		hideTextError: function( elem ) {
			$( elem ).text( '' ).removeClass( this.options.className.visible );
		},

		/**
		 * Deactivate error styling
		 *
		 * @method deactivateTextError
		 * @public
		 * @param {Object} elem The element of the search error
		 */
		deactivateTextError: function( elem ) {
			$( elem ).removeClass( this.options.className.error );

			if ( !this.listCriteriaText.find( this.options.textCriteria.text ).hasClass( this.options.className.error ) ) {
				this.errorText.removeClass( this.options.className.activate );
			};
		},

		/**
		 * Shows the input error
		 *
		 * @method showInputError
		 * @public
		 * @param {Object} elem The input element
		 */
		showInputError: function( elem ) {
			var $elem = $( elem );

			if ( !$elem.hasClass( this.options.className.error ) ) {
				$elem.addClass( this.options.className.error );
			}
		},

		/**
		 * Hides the input error
		 *
		 * @method hideInputError
		 * @public
		 * @param {Object} elem The input element
		 */
		hideInputError: function( elem ) {
			var $elem = $( elem );

			if ( $elem.hasClass( this.options.className.error ) ) {
				$elem.removeClass( this.options.className.error );
			}
		},

		/**
		 * Sets a characters limit for the search text
		 *
		 * @method hideError
		 * @public
		 * @param {Object} element The text input
		 */
		setTextLimitation: function( element ) {
			var $el = $( element );

			if ( $el.val().length > this.options.limitCharacters ) {
				this.showInputError( element );
				this.activateTextError( element );
			} else {
				this.deactivateTextError( element );
			}
		},

		/**
		 * Sets settings for the datepicker
		 *
		 * @method setDatepickercler
		 * @public
		 */
		setDatepicker: function() {
			var _this = this,
				updateStartDate = function( sd, ed ) {
					datepicker.setStartRange( sd, $startDate );
					datepicker.setStartRange( ed, $startDate );
					datepicker.setMinDate( ed, $startDate );
					selectDateRange();
				},
				updateEndDate = function( sd, ed ) {
					datepicker.setEndRange( sd, $endDate );
					datepicker.setMaxDate( sd, $endDate );
					datepicker.setEndRange( ed, $endDate );
					selectDateRange();
				},
				selectDateRange = function() {
					var range = _this.listCriteriaDate.find( 'input[name=dateType][value=between]' );
					if ( !range.is( ':checked' ) ) {
						range.prop( 'checked', true );
					}
				},
				$startPicker = datepicker.datepickerInit( $( this.listCriteriaDate.find( this.options.dateCriteria.between.start ) ), {

					date: {
						format: _this.options.dateCriteria.format,
						max: new Date(),
						select: function() {
							var sd = $( _this.listCriteriaDate.find( _this.options.dateCriteria.between.start ) ),
								ed = $( _this.listCriteriaDate.find( _this.options.dateCriteria.between.end ) );

							$startDate = datepicker.getDate( sd );
							updateStartDate( sd, ed );
						}
					}

				}),

				$endPicker = datepicker.datepickerInit( $( this.listCriteriaDate.find( this.options.dateCriteria.between.end ) ), {

					date: {
						format: _this.options.dateCriteria.format,
						max: new Date(),
						select: function() {
							var sd = $( _this.listCriteriaDate.find( _this.options.dateCriteria.between.start ) ),
								ed = $( _this.listCriteriaDate.find( _this.options.dateCriteria.between.end ) );

							$endDate = datepicker.getDate( ed );
							updateEndDate( sd, ed );
						}
					}

				});
		},

		/**
		 * Validates the dates
		 *
		 * @method validateDateRange
		 * @public
		 * @param {Object} element The date input
		 */
		validateDateRange: function( element ) {
			var value = $( element ).val(),
				isValid = true;

			if ( value ) {
				isValid = datepicker.dateFormat( value, this.options.dateCriteria.format );
			}

			if ( !isValid ) {
				this.showInputError( element );
				this.showTextError( this.errorDate, '* Please enter a valid date' );
			} else {
				this.hideInputError( element );

				if ( !this.listCriteriaDate.find( 'input[type=text]' ).hasClass( this.options.className.error ) ) {
					this.hideTextError( this.errorDate );
				}
			}
		},

		/**
		 * Submit the search form.
		 *
		 * @method submitAdvancedSearch
		 * @public
		 */
		submitAdvancedSearch: function() {
			var _this = this;
			_this.closeSearchPanel();

		}

	};
	return {
		/**
		 * Module function wrapper
		 *
		 * @function init
		 * @param { object } element - Required: wrapping search form element
		 * @param { object } options - Optional: pass in options to overwrite defaults
		 */
		init: function( element, options ) {
			module.constructor( element, options );
		},
		module: module
	};
});
