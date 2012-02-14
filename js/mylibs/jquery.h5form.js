/*
 * jQuery.h5form v0.1.1
 * http://www.robsecord.com/
 *
 * Requires:
 * - jquery 1.3.x
 * - jquery-ui 1.7.x
 *
 * Copyright (c) 2011 Robert J. Secord, B.Sc.
 *
 * Features:

 * - autofocus      !!DONE!!
 * - placeholder    !!DONE!!

 * - data-equals    uses data-msg-equals with @ for localization
 * - minlength      uses data-msg-min with @ for localization
 * - maxlength      uses data-msg-max with @ for localization
 * - required       uses data-msg-required with @ for localization
 * - pattern        uses data-msg-pattern with @ for localization

 * - type email
 * - type tel
 * - type url
 * - type color
 * - type search    uses ajax auto-complete
 * - type range     uses min, max, step         should also output value to associated <output /> tag
 * - type number    uses min, max
 * - type date
 * - type month
 * - type week
 * - type time
 * - type datetime
 * - type datetime-local
 * -
 * - type text-multi    uses min, max
 * -
 * - type select
 * - type select-multi
 * -
 *
 * Notes / Todo:
 * - Add Custom Patterns:  .addPattern('patternName', /pattern/, 'errorMsg')       ===       <input ... pattern="patternName" />
 *

<output onforminput="this.value = rangeEl.value">-</output>
<input type="range"  name="rangeEl" value="" min="0" max="150" step="1" />


 *
 */


if(typeof String.prototype.trim != 'function' ) {
    String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };
}


(function($, undefined) {
    
    "use strict";
    
    // Configuration properties
    var defaults = {
        // Optional Settings:
        // CSS Base Class Name for Forms
        classname: 'h5form',

        // Individual Settings for Controls:
        controls: {
            
            autofocus: {
                // Enhance: upgrades element to Custom HTML5 functionality only if no Native Browser Support
                // Override: forces upgrade to Custom HTML5 functionality over Native Browser Support only if Enhance is enabled
                enhance: true,
                override: true //(Browser.chrome || Browser.safari)
            },

            placeholder: {
                // Enhance: upgrades element to Custom HTML5 functionality only if no Native Browser Support
                // Override: forces upgrade to Custom HTML5 functionality over Native Browser Support only if Enhance is enabled
                enhance: true,
                override: true, //(Browser.chrome || Browser.safari),

                // Classname for Elements with Placeholder text applied (class removed when text removed)
                classname: 'placeholder',

                // Hook Form Reset Event to Reset Placeholder to Initial Value
                hookReset: true,

                // Hook Form Submit Event to Clear Placeholder Value (Placeholder text should not be sent to server)
                hookSubmit: true
            },

            textmulti: {
                // Enhance: upgrades element to Custom HTML5 functionality only if no Native Browser Support
                // Override: forces upgrade to Custom HTML5 functionality over Native Browser Support only if Enhance is enabled
                enhance: true,
                override: false,

                // Classname for Elements with TextMulti functionality applied
                classname: 'text-multi',

                // To populate more than 1 value, split your values by the string provided here.
                // You can also use min & max to limit the number of values allowed by user input (min > 0 = required)
                //    Note the value attribute does not need to initially reflect the min/max attributes, they are used primarily for validation
                //  ex: <input type="text-multi" value="First Value||Second Value||Etc.." min="0" max="5" />
                valueSplit: '||',

                // Should we prompt user to confirm on delete?
                //   If you would like a confirm box on delete, put the confirmation text here, otherwise use false
                //      %s will be replaced with field value attribute
                confirmDelete: false, // 'Are you sure you would like to delete %s?',

                // Hook Form Reset Event to Reset TextMulti Control to Initial Value
                hookReset: true,
                
                // Rendering routines for customizing the Control
                render:      null,  // function(fieldEl) { }
                renderMulti: null   // function(fieldEl, multiEls) { }
            }
        },

        // Individual Settings for Validation:
        validation: {
            output: {
                // Error Output Options for Form Submission Validation
                submit: {
                    // Display Form Errors after Form Submission
                    enabled: true,

                    // Type can be one or more of: console, alert, list, tooltip (comma separated list) or just 'none'
                    // none:    no submission output (field icon may still be enabled)
                    // console: logs all errors messages to console in one single message
                    // alert:   logs all errors messages to alertbox in one single message
                    // list:    logs all errors messages to a specified container element on the page in html list format
                    //            - MUST specify listContainerId option
                    // tooltip: logs each message to a custom tooltip
                    //            - MUST specify tooltip show/hide callbacks
                    type: 'console',

                    // If 'type' above is 'list' you MUST provide the element ID for the list container (usually a UL tag)
                    //  - Sample list container (in your HTML): <ul id="formErrors"></ul>
                    //  - Or if you prefer DIV and P;
                    //       list container (in your HTML): <div id="formErrors"></div>
                    //       addListItem: function(message){ return '<p>' + message + '<\/p>'; },
                    listContainerId: '',
                    addListItem: function(message){ return '<li>' + message + '<\/li>'; },

                    // Should the Window Focus on the Error List Container?
                    listFocusOnContainer: true
                },

                // Error Output Options for Inline (As-You-Type) Validation
                inline: {
                    // Display Form Errors As-You-Type
                    enabled: true,

                    // Type can be one or more of: console, tooltip (comma separated list) or just 'none'
                    // none:    no inline output (field icon may still be enabled)
                    // console: logs all errors messages to console in one single message
                    // tooltip: logs each message to an absolutely positioned DIV/SPAN container that is positioned next to the error field
                    //            - OPTION to specify position of tooltip relative to error field (if boundaries permit)
                    //            - OPTION to specify custom build callbacks for modifying the HTML of the tooltip
                    type: 'console'
                },

                // If 'type' above (for submit and/or inline) is 'tooltip' you MUST provide the tooltip function callbacks for hide/show
                // The functions will be passed the form & field reference elements to which the tooltip is associated
                //   The function is also passed a reference to the fieldTooltip element if it has been previously created (otherwise it is null and you must create it)
                //   You MUST return the fieldTooltip element back in order for h5form to store it (for hiding later)
                //   On tooltip show, the function is also passed the error message
                tooltipShow: function(formEl, fieldEl, fieldTooltip, errorMsg){},
                tooltipHide: function(formEl, fieldEl, fieldTooltip){},

                // Displays an Icon next to the Field as a visual queue to the Fields Validity
                // The functions will be passed the form & field reference elements to which the icon is associated
                //   On icon show, the function is also passed the error message and validity state
                //   These functions are implemented internally, but you may override! :)
                useIcon: true,
                iconToggle: null    // function(fieldEl, errorMsg, isValid) { }
            },

            // Enable Validation on Fields that are Hidden from View
            // - Where style or class is dislay:none, visibility:hidden, class=hidden, class=visuallyhidden, class=invisible
            validateHidden: false,

            // Hook Form Reset Event to Reset Fields to Initial Value
            hookReset: true,

            // Class applied to Elements when Valid/Invalid
            classname: {
                valid:       'valid',
                invalid:     'invalid',
                validIcon:   'valid-icon',
                invalidIcon: 'invalid-icon'
            },

            // The text to use for Default Error Messages
            defaultErrorMessage: {
                required:    'This field is required!',
                pattern:     'This field is invalid!',
                iconValid:   'Valid!',
                iconInvalid: 'Invalid!'
            },

            // Array of Custom Validator Patterns
            //   - Syntax:
            //      [
            //          {
            //              name: 'wholeNum',
            //              pattern: /^\d+$/,
            //              message: 'Whole numbers only!'
            //          },
            //          ...
            //      ]
            //  - Usage:
            //      <input ... pattern="#wholeNum" />
            //
            //  - Without custom pattern definition:
            //      <input ... pattern="^\d+$" data-msg-pattern="Whole numbers only!" />
            customPatterns: []
        },
        
        events: {  // todo: revisit these events to ensure they are firing correctly
            // Fired when all fields of a form a Valid
            'onValid':   $.noop(),
            
            // Fired when at least one field of a form is invalid
            'onInvalid': $.noop()
        }
    };

    /**
     * The Menu-Selctor object.
     *
     * @constructor
     * @class menuSelector
     * @scope public
     * @param {HTMLElement} The element to create the control for.
     * @param {Object} A set of key/value pairs to set as configuration properties.
     * @return {Object} A menuSelector object
     */
    $.h5form = function(element, options) {
        this.options = $.extend(true, {}, defaults, options || {});

        // Get Form Element and Reference Data
        this.formEl = $(element);
        var data = this.formEl.data('h5form');
        
        this.fieldDataTypes = {container: null, multiCount: 0, isvalid: true, fieldTooltip: null, fieldIcon: null, initialValue: ''};

        // For generating Unique IDs
        this.lastUID = 0;

        // Check if Form has already been initialized
        if( data ) return;
        
        // Form needs to be initialized; set defaults
        this.formEl.data('h5form', {ready: true, listContainer: null, errors: []});

        // Setup Form Elements
        this.setupForm();

        // Upgrade Form Validation
        this.upgradeValidation();

        // Upgrade HTML5 Placeholder Input-Attribute
        if( this.options.controls.placeholder.enhance && (!Modernizr.input.placeholder || this.options.controls.placeholder.override) ) {
            this.upgradePlaceholder();
        }

        // Upgrade HTML5 Autofocus Input-Attribute
        if( this.options.controls.autofocus.enhance && (!Modernizr.input.autofocus || this.options.controls.autofocus.override) ) {
            this.upgradeAutofocus();
        }

        // Upgrade Custom HTML5 Text-Multi Input-Type
        if( this.options.controls.textmulti.enhance && (!Modernizr.input.textmulti || this.options.controls.textmulti.override) ) {
            this.upgradeTextMulti();
        }
    };

    // Create shortcut for internal use
    var $h5f = $.h5form;
    $h5f.fn = $h5f.prototype = {h5form: '0.1.2'};
    $h5f.fn.extend = $h5f.extend = $.extend;

    $h5f.fn.extend({
        
        /**
         * Sets up the HTML5 Form Elements.
         *
         * @method setupForm
         * @scope private
         * @return undefined
         */
        setupForm: function() {
            var data = this.formEl.data('h5form');

            // Ensure Form has a Valid ID
            var formId = this.formEl.attr('id') || this.getUID();
            this.formEl.attr({'id': formId});

            // Add Base Class
            if( !this.formEl.hasClass(this.options.classname) ) { 
                this.formEl.addClass(this.options.classname);
            }

            // Check for Error-List Container and Hide
            var listId = this.options.validation.output.submit.listContainerId;
            if( listId.length ) {
                if( listId.charAt(0) != '#' ) { listId = '#' + listId; }
                data.listContainer = $(listId);
                if( data.listContainer ) { data.listContainer.hide(); }
            }
        },
        
        /**
         * Upgrades Form Elements to have Validation
         * 
         * @method upgradeValidation
         * @scope private
         * @return undefined
         */
        upgradeValidation: function() {
            var _self = this;
            
            // Hook Form Reset
            if( this.options.validation.hookReset ) {
                this.formEl.bind({reset: this._reset_form()});
            }

            // Enable Validation on Form Submission
            if( this.options.validation.output.submit.enabled ) {
                this.formEl.bind({submit: this._validate_form()});
            }

            // Enable Inline Form Validation
            if( this.options.validation.output.inline.enabled ) {
                // Watch Pattern & Required Fields
                $('[data-required], [data-pattern]', this.formEl).each(function() {
                    var fieldEl = $(this);
                    
                    // Find Field Container Element
                    var inputContainer = _self.findFieldContainer(fieldEl);

                    // Ensure Field has a Valid ID
                    var fieldId = fieldEl.attr('id') || _self.getUID();
                    fieldEl.attr({'id': fieldId});

                    // Build Array of Associated Elements; Dont Add Current Element First
                    var assocEls = _self.getAssociatedElements(fieldEl, false);

                    // Attach Events to Associated Field Elements
                    var f = _self._watch_pattern_required();
                    for( var i = 0; i < assocEls.length; i++ ) {
                        //f = this._watch_pattern_required(formEl, fieldEl);
                        assocEls[i].bind({'keyup': f, 'blur': f, 'change': f}); // Need a way to use delegate() here (see comment below)
                    }
                });

                // Attach Live Events (need a way to make this work for associated elements like radio lists; see comment above)
                //var f = this._watch_pattern_required(formEl);
                //$('[required], [pattern]', formEl).live({'keyup': f, 'blur': f, 'change': f});
                this.formEl.delegate('[data-required], [data-pattern]', 'keyup blur change', this._watch_pattern_required());
            }
        },
        
        /**
         * Function closure for Pattern/Required Field Monitoring; Maintains "this" variable as "_self"
         * 
         * @method _watch_pattern_required
         * @scope private
         * @return function [event handler]
         */
        _watch_pattern_required: function() {
            var _self = this;
            return function(e) {
                var fieldEl = $(this);

                // Pattern attribute overrides required attribute (any valid pattern will do the same/more as required anyway)
                if( fieldEl.attr('data-pattern') ) {
                    _self.watchPattern(fieldEl, e);
                } else {
                    _self.watchRequired(fieldEl, e);
                }
                return true;
            };
        },
        
        /**
         * Validates a Form on Form-Submission
         * 
         * @method validateForm
         * @scope private
         * @return boolean
         */
        validateForm: function( e ) {
            var data = this.formEl.data('h5form');
            
            // Clear any past errors
            this.clearFormErrors();
            if( data.listContainer ) data.listContainer.hide();

            // Validate all Pattern & Required Fields of Form
            this.validateFormFields();

            // Check if Any Part of Form Failed Validation
            data = this.formEl.data('h5form');
            if( data.errors.length ) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.displayFormErrors();
                return false;
            }
            return true;
        },
        
        /**
         * Function closure for Validating Forms on Form-Submission; Maintains "this" variable as "_self"
         * 
         * @method _validate_form
         * @scope private
         * @return function [event handler]
         */
        _validate_form: function(){ var _self = this; return function(e){ return _self.validateForm(e); }; },

        // -------------------------------------------------------------------------------------------------------------
        // Internal Rountine:
        resetForm: function( e ) {
            var _self = this;
            
            // Validate Pattern & Required Fields
            $('[data-required], [data-pattern]', this.formEl).each(function() {
                var fieldEl = $(this), fieldData = fieldEl.data('h5field');

                // Clear any past errors
                _self.clearFormErrors();
            
                // Ignore Text-Multi Fields (they reset themselves)
                if( fieldEl.attr('rel') == 'text-multi' ) return;

                // Check for Input Container Element for Applying Error Class
                var inputContainer = _self.findFieldContainer(fieldEl);

                // Clear Validity Classes
                inputContainer.removeClass(_self.options.validation.classname.invalid).removeClass(_self.options.validation.classname.valid);

                // Clear Icon
                _self.toggleFieldIcon(fieldEl, null, 'clear');

                // Clear Tooltip
                _self.toggleToolTip(fieldEl, null, true);

                // Reset Value to Initial Value
                var iv = fieldData.initialValue, p = fieldEl.attr('placeholder') || '';
                fieldEl.attr('value', iv || p);
                if( !iv && p.length ) fieldEl.addClass(_self.options.controls.placeholder.classname);
            });
        },
        
        /**
         * Function closure for Resetting Forms on Form-Reset; Maintains "this" variable as "_self"
         * 
         * @method _reset_form
         * @scope private
         * @return function [event handler]
         */
        _reset_form: function(){ var _self = this; return function(e){ _self.resetForm(e); }; },
        
        /**
         * Validates all Fields in a Form on Form-Submission
         * 
         * @method validateFormFields
         * @scope private
         * @return undefined
         */
        validateFormFields: function() {
            var _self = this, lastEl = '', data = this.formEl.data('h5form');
            
            // Validate Pattern & Required Fields
            $('[data-required], [data-pattern]', this.formEl).each(function() {
                var isFieldValid, patternData, errorMsg, fieldEl = $(this);

                // Check if we should validate hidden fields
                if( !_self.options.validation.validateHidden && _self.isElementHidden(fieldEl) ) { return; }

                // Get Element Name; ensure that it is not the same as last element to prevent double-checking grouped elements
                var fieldName = fieldEl.attr('name'); 
                if( fieldName == lastEl ) { return; }
                lastEl = fieldName;
                
                // Ensure Field has a Valid ID
                var fieldId = fieldEl.attr('id') || _self.getUID();
                fieldEl.attr({'id': fieldId});

                // Check Field Type
                if( fieldEl.attr('data-pattern') ) {
                    // No Pattern on Radio or Checkbox elements
                    if( _self.isInputCheckable(fieldEl) ) return;

                    // Check current state of Pattern attribute (may have changed)
                    if( !(fieldEl.attr('data-pattern') || '').length ) return;

                    // Check Field for Error Message or Get Default Error Message
                    patternData = _self.getPatternDataFromField(fieldEl);

                    // Check Field Validity
                    isFieldValid = _self.validatePattern(fieldEl, patternData, 'submit');

                    // Mark Field Element as Valid or Invalid; If invalid display error
                    _self.toggleFieldValidity(fieldEl, patternData.message, isFieldValid, 'submit');
                } else {
                    // Check current state of Required attribute (may have changed)
                    var req = (fieldEl.attr('data-required').toString() || 'false').toLowerCase();
                    if( req != 'true' && req != 'required' ) return;

                    // Check Field for Error Message or Get Default Error Message
                    errorMsg = fieldEl.attr('data-msg-required') || _self.options.validation.defaultErrorMessage.required;

                    // Check Field Validity
                    isFieldValid = _self.validateRequired(fieldEl, errorMsg, 'submit');

                    // Mark Field Element as Valid or Invalid; If invalid display error
                    _self.toggleFieldValidity(fieldEl, errorMsg, isFieldValid, 'submit');
                }
            });
        },

        /**
         * Monitors Required Fields and Validates on the fly
         * 
         * @method watchRequired
         * @scope private
         * @return undefined
         */
        watchRequired: function(fieldEl, e) {
            // Allow TAB Key
            var keyCode = this.getEventKeyCode(e);
            if( keyCode == 9 ) return;

            // Check current state of Required attribute (may have changed)
            var req = (fieldEl.attr('data-required').toString() || 'false').toLowerCase();
            if( req != 'true' && req != 'required' ) return;

            // Check if we should validate hidden fields
            if( !this.options.validation.validateHidden && this.isElementHidden(fieldEl) ) return;

            // Check Field for Error Message or Get Default Error Message
            var errorMsg = fieldEl.attr('data-msg-required') || this.options.validation.defaultErrorMessage.required;
            //if( errorMsg.charAt(0) == '@' ) errorMsg = Locale.get(errorMsg.substr(1)) || Locale.get('forms-validation.defaultMessage.required');

            // Check Current Error Count
            var formData = this.formEl.data('h5form'), errorCount = formData.errors.length;
            
            // Check Field Validity
            var isFieldValid = this.validateRequired(fieldEl, errorMsg, 'inline');

            // Mark Field Element as Valid or Invalid; If invalid display error
            this.toggleFieldValidity(fieldEl, errorMsg, isFieldValid, 'inline');

            // Display Error Message for Field (Not Icon or Tooltip)
            if( !isFieldValid ) {
                this.displayFieldError(fieldEl, errorMsg);
            }
        },
        
        /**
         * Function closure for Monitoring Required Fields; Maintains "this" variable as "_self"
         * 
         * @method _watch_required
         * @scope private
         * @return function [event handler]
         */
        _watch_required: function(fieldEl){ var _self = this; return function(e){ _self.watchRequired(fieldEl, e); }; },

        /**
         * Validates Required Fields
         * 
         * @method validateRequired
         * @scope private
         * @return boolean
         */
        validateRequired: function(fieldEl, errorMsg, validationType) {
            // Build Array of Associated Elements; Adds Current Element First
            var i, j, v, p, el, rel, isFieldValid = false, assocEls = this.getAssociatedElements(fieldEl, true);
            
            if (this.isInputCheckable(fieldEl)) {
                // Check Field Validity
                for( el, i = 0; i < assocEls.length; i++ ) {
                    if( assocEls[i].checked ){ isFieldValid = true; break; }
                } 
            } else if (this.isInputSelectable(fieldEl)) {
                
                var selectType = this.isInputSelectable(fieldEl); // will be 'multiple' or 'single'
                isFieldValid = true;

                // Single Select Type
                if( selectType == 'single' ) {
                    // Validate against empty or -1 option value
                    for( i = 0; i < assocEls.length; i++ ) {
                        v = assocEls[i][0].options[assocEls[i][0].selectedIndex].value.trim();
                        if( !v.length || v == '-1' ){ isFieldValid = false; break; }
                    }
                }
                // Multiple Select Type
                else {
                    // Validate against 0 selected indexes
                    for( i = 0; i < assocEls.length; i++ ) {
                        for( j = 0; j < assocEls[i][0].options.length; j++ ) {
                            if( assocEls[i][0].options[j].selected ){ isFieldValid = false; break; }
                        }
                        if( isFieldValid == false ) break;
                    }
                }
            }
            else if (this.isInputNumeric(fieldEl)) {
                // TODO: these might be upgraded to html5 elements which are restricted by min/max attributes,
                // otherwise might be old text type elements that need to be validated
                isFieldValid = true;
                
            } else {
                
                // Check for Custom Input-Type 'text-multi'
                rel = fieldEl.attr('rel');
                p = fieldEl.attr('placeholder') || '';
                v = fieldEl.attr('value') || '';
                        
                if (rel == 'text-multi') {
                    var data = this.getFieldData(fieldEl), count = data.multiCount;
                    if (count == 0 && v.length && v != p) { count = 1; }

                    // We only validate against min/max attributes for submission
                    var minLen = parseInt((fieldEl.attr('min') || 1), 10), maxLen = parseInt((fieldEl.attr('max') || 0), 10);
                    isFieldValid = ((count >= minLen) && (maxLen == 0 || count <= maxLen));
                
                } else {
                    
                    // Validate Single Text Value
                    for (i = 0; i < assocEls.length; i++) {
                        p = assocEls[i].attr('placeholder') || '';
                        v = assocEls[i].attr('value') || '';
                        if( v.length && v != p ) isFieldValid = true;
                    }
                }
            }
            
            // Update Errors Collection
            if (isFieldValid) {
                this.removeFormError(fieldEl);
            } else {
                this.addFormError(fieldEl, errorMsg);
            }
            
            return isFieldValid;
        },

        /**
         * Monitors Pattern Fields and Validates on the fly
         * 
         * @method watchPattern
         * @scope private
         * @return undefined
         */
        watchPattern: function(fieldEl, e) {
            // Allow TAB Key
            var keyCode = this.getEventKeyCode(e);
            if( keyCode == 9 ) return;

            // Check current state of Pattern attribute (may have changed)
            if( !(fieldEl.attr('data-pattern') || '').length ) return;

            // Check if we should validate hidden fields and ignore checkable elements
            if( (!this.options.validation.validateHidden && this.isElementHidden(fieldEl)) || this.isInputCheckable(fieldEl)) return;

            // Check Field for Error Message or Get Default Error Message
            var patternData = this.getPatternDataFromField(fieldEl);

            // Check Field Validity
            var isFieldValid = this.validatePattern(fieldEl, patternData, 'inline');

            // Mark Field Element as Valid or Invalid; If invalid display error
            this.toggleFieldValidity(fieldEl, patternData.message, isFieldValid, 'inline');

            // Display Error Message for Field (Not Icon or Tooltip)
            if( !isFieldValid ) {
                this.displayFieldError(fieldEl, patternData.message);
            }
        },
        
        /**
         * Function closure for Monitoring Pattern Fields; Maintains "this" variable as "_self"
         * 
         * @method _watch_pattern
         * @scope private
         * @return function [event handler]
         */
        _watch_pattern: function(fieldEl){ var _self = this; return function(e){ _self.watchPattern(fieldEl, e); }; },

        /**
         * Validates Pattern Fields
         * 
         * @method validatePattern
         * @scope private
         * @return boolean
         */
        validatePattern: function(fieldEl, patternData, validationType) {
            // Build Array of Associated Elements; Adds Current Element First
            var isFieldValid = true, assocEls = this.getAssociatedElements(fieldEl, true);

            // Get Pattern to Test Against
            var pattern = patternData.pattern, errorMsg = patternData.message;

            var p, v, i;
            switch( fieldEl[0].nodeName.toLowerCase() ) {
                case 'select':
                    for( i = 0; i < assocEls.length; i++ ) {
                        v = assocEls[i][0].options[assocEls[i][0].selectedIndex].value.trim();
                        if( !v.match(pattern) ){ isFieldValid = false; break; }
                    }
                    break;

                case 'input':
                case 'textarea':
                    // Check for Custom Input-Type 'text-multi'
                    var rel = fieldEl.attr('rel') || '';
                    if( rel == 'text-multi' ) {
                        var data = this.getFieldData(fieldEl), count = data.multiCount;

                        // We only validate against min/max attributes for submission
                        var minLen = parseInt((fieldEl.attr('min') || 0), 10), maxLen = parseInt((fieldEl.attr('max') || 0), 10);
                        isFieldValid = ((count >= minLen) && (maxLen == 0 || count <= maxLen));
                        
                        if (isFieldValid) {
                            for( i = 0; i < assocEls.length; i++ ) {
                                p = assocEls[i].attr('placeholder') || '';
                                v = assocEls[i].attr('value') || '';
                                if (!v.length || (v.length && v == p)) {continue;}
                                if( !v.match(pattern) ){ isFieldValid = false; break; }
                            }
                        }
                        
                    } else {
                        
                        for( i = 0; i < assocEls.length; i++ ) {
                            v = assocEls[i][0].value.trim();
                            if( !v.match(pattern) ){ isFieldValid = false; break; }
                        }
                    }
                    break;
            }
            
            // Update Errors Collection
            if (isFieldValid) {
                this.removeFormError(fieldEl);
            } else {
                this.addFormError(fieldEl, errorMsg);
            }
            
            return isFieldValid;
        },

        /**
         * Displays Validation Errors on Form-Submission
         * 
         * @method displayFormErrors
         * @scope private
         * @return undefined
         */
        displayFormErrors: function() {
            var data = this.formEl.data('h5form'), formattedOutput = '', friendlyName = '';

            var outputTypes = this.options.validation.output.submit.type.toLowerCase().split(',');
            for( var i = 0; i < outputTypes.length; i++ ) {
                outputTypes[i] = outputTypes[i].trim();

                // Prepare Formats for Output
                switch( outputTypes[i] ) {
                    case 'list':
                        if( data.listContainer ) data.listContainer.empty();
                        break;

                    case 'console':
                    case 'alert':
                        formattedOutput = 'Validation Errors:' + "\n";
                        break;
                }

                // Loop through all errors of Form
                for( var j = 0; j < data.errors.length; j++ ) {
                    
                    // Get Friendly Name of Field
                    friendlyName = this.getFriendlyFieldName(data.errors[j].fieldEl);
                    
                    // Build Output
                    switch( outputTypes[i] ) {
                        case 'list':
                            if( data.listContainer )
                                data.listContainer.append(this.options.validation.output.submit.addListItem(friendlyName + ': ' + data.errors[j].message));
                            break;

                        case 'console':
                        case 'alert':
                            formattedOutput += ' - ' + friendlyName + ': ' + data.errors[j].message + "\n";
                            break;
                    }
                }

                // Finalize Output and Display Error
                switch( outputTypes[i] ) {
                    case 'list':
                        if( data.listContainer ) {
                            // Display List Container
                            data.listContainer.show();

                            // Scroll Page to List Container
                            if( this.options.validation.output.submit.listFocusOnContainer )
                                $('html,body').animate({scrollTop: data.listContainer.offset().top}, 1000);
                        }
                        break;

                    case 'console': if( window.console ) console.log(formattedOutput); break;
                    case 'alert': alert(formattedOutput); break;
                }
            }
        },

        /**
         * Displays Validation Errors of a Specific Field on Form-Submission (Console Log Only)
         * 
         * @method displayFieldError
         * @scope private
         * @return undefined
         */
        displayFieldError: function(fieldEl, errorMsg) {
            if( window.console && this.options.validation.output.inline.type.toLowerCase().indexOf('console') > -1 ) {
                console.log(errorMsg);
            }
        },

        /**
         * Toggles Validity Indicators for Individual Fields
         * 
         * @method toggleFieldValidity
         * @scope private
         * @return undefined
         */
        toggleFieldValidity: function(fieldEl, errorMsg, isValid, validationType) {
            // Check for Input Container Element for Applying Error Class
            var inputContainer = this.findFieldContainer(fieldEl);

            // Store Validity State
            this.setFieldData(fieldEl, {isvalid: isValid});

            // Add/Remove Error Class to Input (or Input Container)
            if( isValid ) {
                inputContainer.removeClass(this.options.validation.classname.invalid).addClass(this.options.validation.classname.valid);
            } else {
                inputContainer.removeClass(this.options.validation.classname.valid).addClass(this.options.validation.classname.invalid);
            }

            // Toggle Field Icon next to Field
            this.toggleFieldIcon(fieldEl, errorMsg, isValid);

            // Toggle ToolTip next to Field
            if( (validationType == 'submit' && this.options.validation.output.submit.type.toLowerCase().indexOf('tooltip') > -1) ||
                (validationType == 'inline' && this.options.validation.output.inline.type.toLowerCase().indexOf('tooltip') > -1) ) {
                this.toggleToolTip(fieldEl, errorMsg, isValid);
            }
        },

        /**
         * Toggles Validity Icons for Individual Fields
         * 
         * @method toggleFieldIcon
         * @scope private
         * @return undefined
         */
        toggleFieldIcon: function(fieldEl, errorMsg, isValid) {
            // Call Custom Icon Hide Function
            if( this.options.validation.output.useIcon && typeof this.options.validation.output.iconToggle == 'function' ) {
                this.options.validation.output.iconToggle.apply(this, [fieldEl, errorMsg, isValid]);
            } else {
                this._field_icon_toggle(fieldEl, errorMsg, isValid);
            }
        },

        /**
         * Toggles Validity Tooltips for Individual Fields
         * 
         * @method toggleToolTip
         * @scope private
         * @return undefined
         */
        toggleToolTip: function(fieldEl, errorMsg, isValid) {
            // Get Field Data and associated Tooltip Element
            var fieldData = this.getFieldData(fieldEl), fieldTooltip = fieldData.fieldTooltip;

            if( isValid ) {
                // Call Custom Tooltip Hide Function
                if( typeof this.options.validation.output.tooltipHide == 'function' ) {
                    this.options.validation.output.tooltipHide.apply(this, [fieldEl, fieldTooltip]);
                }
                    
            } else {
                
                // Call Custom Tooltip Show Function
                if( typeof this.options.validation.output.tooltipShow == 'function' ) {
                    fieldTooltip = this.options.validation.output.tooltipShow.apply(this, [fieldEl, fieldTooltip, errorMsg]);
                }
            }

            // Store Tooltip with Field
            this.setFieldData(fieldEl, {fieldTooltip: fieldTooltip});
        },

        /**
         * Displays Validity Icon for Individual Fields (may be overridden)
         * 
         * @method _field_icon_toggle
         * @scope private
         * @return undefined
         */
        _field_icon_toggle: function(fieldEl, errorMsg, isValid) {
            // Check for Input Container Element for Applying Field Icon
            var inputContainer = this.findFieldContainer(fieldEl);

            // Check for Existing Field Icon
            var fieldIcon = fieldData.fieldIcon;
            if( !fieldIcon ) {
                // Create New Field Icon Element
                fieldIcon = $('<div/>').insertAfter(inputContainer);
                fieldIcon.addClass(this.options.validation.classname.validIcon)
                    .attr('title', this.options.validation.defaultErrorMessage.iconValid)
                    .css({'display': 'block'});

                // Store Field Icon with Field
                this.setFieldData(fieldEl, {fieldIcon: fieldIcon});
            }

            // Update Field Icon State
            fieldIcon.removeClass(this.options.validation.classname.validIcon).removeClass(this.options.validation.classname.invalidIcon);
            if( isValid === 'clear' ) {
                fieldIcon.css({'display': 'none'});
            } else {
                if( isValid ) {
                    fieldIcon.css({'display': 'block'})
                        .html('<span>' + this.options.validation.defaultErrorMessage.iconValid + '<\/span>')
                        .attr('title', this.options.validation.defaultErrorMessage.iconValid)
                        .addClass(this.options.validation.classname.validIcon);
                } else {
                    errorMsg = errorMsg || this.options.validation.defaultErrorMessage.iconInvalid;
                    fieldIcon.css({'display': 'block'})
                        .html('<span>' + errorMsg + '<\/span>')
                        .attr('title', errorMsg)
                        .addClass(this.options.validation.classname.invalidIcon);
                }
            }
        },


        // -------------------------------------------------------------------------------------------------------------
        // Autofocus
        // ~~~~~~~~~~~~~~~~~~~~~~~~~

        /**
         * HTML5 Feature: Autofocus - Automatically focuses on a Field Element
         * 
         * @method upgradeAutofocus
         * @scope private
         * @return undefined
         */
        upgradeAutofocus: function() {
            // Focus on element with "autofocus" attribute
            $('[autofocus]', this.formEl).focus();
        },
        
    
        // -------------------------------------------------------------------------------------------------------------
        // Placeholder
        // ~~~~~~~~~~~~~~~~~~~~~~~~~
    
        /**
         * HTML5 Feature: Placeholder - Provides placeholder text for Input Fields
         * 
         * @method upgradePlaceholder
         * @scope private
         * @return undefined
         */
        upgradePlaceholder: function() {
            var _self = this;
            
            // Find all elements with "placeholder" attribute
            $('[placeholder]', this.formEl).each(function() {
                var fieldEl = $(this), v = fieldEl.attr('value') || '', p = fieldEl.attr('placeholder') || '';
    
                // Store initial value
                // Prevent storing placeholder as initial value (Firefox)
                //   Scenario on Empty Field Value:
                //      On page load the value is read as empty; the placeholder text is added by script
                //      Then on page refresh, the value is read with the placeholder intact -- not good for script
                //      All is fine however, on a shift+refresh
                if( v == p ) v = '';
                _self.setFieldData(fieldEl, {initialValue: v});
    
                // Set value to placeholder if value is empty
                if( !v.length ) fieldEl.attr('value', p).addClass(_self.options.controls.placeholder.classname);
            });
    
            // Attach Events for Focus/Blur
            $('[placeholder]', this.formEl).live({
                focus: this._event_placeholder_blur(false),
                blur:  this._event_placeholder_blur(true)
            });
    
            // Hook Form Reset to Restore Initial Value of Placeholder
            if( this.options.controls.placeholder.hookReset ) {
                this.formEl.bind({reset: this._event_placeholder_reset()});
            }
    
            // Hook Form Submit to Clear Placeholder Value (prevent sending placeholder text to server)
            if( this.options.controls.placeholder.hookSubmit ) {
                this.formEl.bind({submit: this._event_placeholder_submit()});
            }
        },
    
        /**
         * Placeholder Focus/Blur Event Handler
         * 
         * @method _event_placeholder_blur
         * @scope private
         * @return function (event handler)
         */
        _event_placeholder_blur: function(blur) {
            var _self = this;
            return function( e ) {
                var t = $(e.target),
                    v = t.attr('value') || '',
                    p = t.attr('placeholder') || '';
    
                if( blur && !v.length ) t.attr('value', p).addClass(_self.options.controls.placeholder.classname);
                if( !blur && v == p ) t.attr('value', '').removeClass(_self.options.controls.placeholder.classname);
            };
        },
    
        /**
         * Placeholder Form-Reset Event Handler
         * 
         * @method _event_placeholder_reset
         * @scope private
         * @return function (event handler)
         */
        _event_placeholder_reset: function() {
            var _self = this;
            return function( e ) {
                var delayed = function() {
                    $('[placeholder]', _self.formEl).each(function() {
                        var fieldEl = $(this), data = _self.getFieldData(fieldEl),
                            iv = data.initialValue, p = fieldEl.attr('placeholder') || '';
    
                        // Ignore Text-Multi Fields (they reset themselves)
                        if( fieldEl.attr('rel') == 'text-multi' ) return;
    
                        // No InitialValue; Set to Placeholder
                        if( !iv.length )
                            fieldEl.attr('value', p).addClass(_self.options.controls.placeholder.classname);
    
                        // Set to InitialValue
                        else
                            fieldEl.attr('value', iv).removeClass(_self.options.controls.placeholder.classname);
                    });
                };
                window.setTimeout(delayed, 10); // Delayed until after browser reset does its thing
            };
        },
    
        /**
         * Placeholder Form-Submit Event Handler
         * 
         * @method _event_placeholder_submit
         * @scope private
         * @return function (event handler)
         */
        _event_placeholder_submit: function() {
            var _self = this;
            return function( e ) {
                $('[placeholder]', _self.formEl).each(function() {
                    var el = $(this), v = el.attr('value') || '', p = el.attr('placeholder') || '';
    
                    // Set value to placeholder if value is empty
                    if( v.length && v == p ) el.attr('value', '').removeClass(_self.options.controls.placeholder.classname);
                });
            };
        },


        // -------------------------------------------------------------------------------------------------------------
        // TextMulti
        // ~~~~~~~~~~~~~~~~~~~~~~~~~
        
        /**
         * HTML5 Feature: Text-Multi - Upgrade Text-Multi Input Elements to HTML5 Prototype
         *      This is a Custom Control not defined in the HTML5 spec.
         * 
         * @method upgradeTextMulti
         * @scope private
         * @return undefined
         */
        upgradeTextMulti: function() {
            var _self = this;
            
            // Upgrade to Text-Multi Element
            var upgrade = function() {
                var fieldEl = $(this), v = fieldEl.attr('value') || '', p = fieldEl.attr('placeholder') || '';

                // Set rel attribute for indentifying control type later
                fieldEl.attr('rel', 'text-multi');

                // Store initial value (if not placeholder)
                if( v.length && v != p ) _self.setFieldData(fieldEl, {initialValue: v});

                // Fix name attribute to be an array indicator
                var name = fieldEl.attr('name') || '';
                if( name.length && name.indexOf('[') < 0 ) fieldEl.attr('name', name + '[]');

                // Ensure field has a valid ID
                var fieldId = fieldEl.attr('id') || _self.getUID();
                fieldEl.attr('id', fieldId);

                // Call Custom TextMulti Render Function
                if( typeof _self.options.controls.textmulti.render == 'function' ) {
                    _self.options.controls.textmulti.render.apply(_self, [fieldEl]);
                } else {
                    _self._textmulti_render(fieldEl);
                }

                // Populate Initial Values
                var values = v.split(_self.options.controls.textmulti.valueSplit);
                if( values.length > 1 ) {
                    // Restrict Input Values to Max Count
                    var max = parseInt(fieldEl.attr('max') || 0, 10);
                    if( max > 0 && values.length > max ) values.length = max;

                    // Append All Input Values
                    for( var i = 0; i < values.length; i++ ) {
                        fieldEl.attr('value', values[i]);
                        _self._textmulti_blur(fieldEl);
                    }
                } else {
                    _self._textmulti_blur(fieldEl);
                }
            };

            // Find all elements with "text-multi" attribute
            $('[type=text-multi]', this.formEl).each(upgrade);
            if( !$.support.boxModel ) $('[rel=text-multi]', this.formEl).each(upgrade); // For MSIE 6 & 7 Quirks Mode

            // Attach Live Events
            $('[type=text-multi]', this.formEl).live({'blur': this._event_textmulti_blur()});

            // Hook Form Reset to Restore Initial Value of TextMulti
            if( this.options.controls.textmulti.hookReset )
                this.formEl.bind({reset: this._event_textmulti_reset()});
        },

        /**
         * Text-Multi Single Element Render
         * 
         * @method _textmulti_render
         * @scope private
         * @return undefined
         */
        _textmulti_render: function(fieldEl) {
        },

        /**
         * Text-Multi Multi Element Render
         * 
         * @method _textmulti_render_multi
         * @scope private
         * @param multiEls = [container, display, deleteIcon, hidden]
         * @return undefined
         */
        _textmulti_render_multi: function(fieldEl, multiEls) {
            // Update Container Width
            multiEls[0].css({'width': fieldEl.outerWidth()-2});

            // Add Hover events to Delete Icon
            multiEls[2].hover(function(){ $(this).addClass('hover'); }, function(){ $(this).removeClass('hover'); });
        },

        /**
         * Text-Multi Element Focus/Blur Function Closure
         * 
         * @method _event_textmulti_blur
         * @scope private
         * @return function (event handler)
         */
        _event_textmulti_blur: function() {
            var _self = this;
            return function( e ) {
                _self._textmulti_blur($(this));
            };
        },

        /**
         * Text-Multi Element Focus/Blur Event Handler
         * 
         * @method _textmulti_blur
         * @scope private
         * @return undefined
         */
        _textmulti_blur: function(fieldEl) {
            // Check Validity State of Element
            var fieldData = this.getFieldData(fieldEl);
            if( !fieldData.isvalid ) return;

            // May not have been a validated field, so still check for placeholder text or empty
            var v = fieldEl.attr('value') || '', p = fieldEl.attr('placeholder') || '';
            if( !v.length || v == p ) return;

            // Check max value
            var max = parseInt(fieldEl.attr('max') || 0, 10);
            if( max && fieldData.multiCount == max - 1 ) {
                // Reset Field; Do Not Clear Value
                this._textmulti_reset_field(fieldEl, false);
                return;
            }

            // Store Current Count
            this.setFieldData(fieldEl, {multiCount: ++fieldData.multiCount});

            // Get Name Attribute
            var n = fieldEl.attr('name');

            // Create Container Element for housing display, delete and hidden input elements
            var cn = this.options.controls.textmulti.classname;
            var container = $('<div/>', {'class': cn}).insertBefore(fieldEl);
            var display = $('<div/>', {'class': cn + '-display', 'html': '<span>' + v + '<\/span>'}).appendTo(container);
            var deleteIcon = $('<div/>', {'class': cn + '-delete', 'html': '<span>x<\/span>'}).appendTo(container);
            var hidden = $('<input/>', {'type': 'hidden', 'name': n, 'value': v}).appendTo(container);

            // Reset Field; Clear Value
            this._textmulti_reset_field(fieldEl, true);

            // Call Custom TextMulti Render-Multi Function
            if( typeof this.options.controls.textmulti.renderMulti == 'function' ) {
                this.options.controls.textmulti.renderMulti.apply(this, [fieldEl, [container, display, deleteIcon, hidden]]);
            } else {
                this._textmulti_render_multi(fieldEl, [container, display, deleteIcon, hidden]);
            }

            // Attach Click Event to Delete Icon
            deleteIcon.bind({'click': this._event_textmulti_delete(fieldEl, container)});
        },

        /**
         * Text-Multi Element Delete Event Handler
         * 
         * @method _event_textmulti_delete
         * @scope private
         * @return undefined
         */
        _event_textmulti_delete: function(fieldEl, containerEl) {
            var _self = this;
            
            return function( e ) {
                // Check Confirm Delete
                if( _self.options.controls.textmulti.confirmDelete !== false ) {
                    var cn = _self.options.controls.textmulti.classname;

                    // Remove Hover Class
                    containerEl.find('.' + cn + '-delete').removeClass('hover');

                    // Display Confirm Message
                    var v = containerEl.find('.' + cn + '-display').text();
                    if( !v.length ) v = 'the Selected Element';
                    if( !confirm(_self.options.controls.textmulti.confirmDelete.replace('%s', v)) )
                        return;
                }

                // Remove Multi-Element from DOM
                containerEl.remove();

                // Decrement Current Count
                var fieldData = _self.getFieldData(fieldEl);
                _self.setFieldData(fieldEl, {multiCount: --fieldData.multiCount});

                // Focus on Field Element
                fieldEl.focus().blur();
            };
        },

        /**
         * Text-Multi Form-Reset Event Handler
         * 
         * @method _event_textmulti_delete
         * @scope private
         * @return function (event handler)
         */
        _event_textmulti_reset: function() {
            var _self = this;
            
            return function( e ) {
                var delayed = function() {
                    $('[rel=text-multi]', _self.formEl).each(function() {
                        var fieldEl = $(this), fieldData = _self.getFieldData(fieldEl);

                        // Delete Old Containers
                        $('[type=hidden][name^=' + fieldEl.attr('name').replace('[]', '') +']', _self.formEl).each(function() {
                            var container = $(this).parent('.' + _self.options.controls.textmulti.classname);
                            container.remove();
                        });

                        // Reset Current Data
                        _self.setFieldData(fieldEl, {multiCount: 0, isvalid: true});

                        // Populate Initial Values
                        var values = fieldData.initialValue.split(_self.options.controls.textmulti.valueSplit);
                        if( values.length > 1 ) {
                            // Restrict Input Values to Max Count
                            var max = parseInt(fieldEl.attr('max') || 0, 10);
                            if( max > 0 && values.length > max ) values.length = max;

                            // Append All Input Values
                            for( var i = 0; i < values.length; i++ ) {
                                fieldEl.attr('value', values[i]);
                                _self._textmulti_blur(fieldEl);
                            }

                            fieldEl.attr('value', values[max-1]);
                        } else {
                            // Reset Field; Do Not Clear Value
                            _self._textmulti_reset_field(fieldEl, !fieldEl.attr('value').length);
                            _self._textmulti_blur(fieldEl);
                        }
                    });
                };
                window.setTimeout(delayed, 10); // Delayed until after browser reset does its thing
            };
        },

        /**
         * Text-Multi Element-Reset Event Handler
         * 
         * @method _textmulti_reset_field
         * @scope private
         * @return undefined
         */
        _textmulti_reset_field: function(fieldEl, clearValue) {
            // Check for Input Container Element for Applying Error Class
            var inputContainer = this.findFieldContainer(fieldEl);

            // Clear Validity Classes
            inputContainer.removeClass(this.options.validation.classname.invalid).removeClass(this.options.validation.classname.valid);

            // Clear Icon
            this.toggleFieldIcon(fieldEl, null, 'clear');

            // Clear Tooltip
            this.toggleToolTip(fieldEl, null, true);

            // Clear Value
            if( clearValue ) {
                var p = fieldEl.attr('placeholder') || '';
                fieldEl.attr('value', p);
                if( p.length ) fieldEl.addClass(this.options.controls.placeholder.classname);
            } else {
                fieldEl.removeClass(this.options.controls.placeholder.classname);
            }
        },
        

        // -------------------------------------------------------------------------------------------------------------
        // Common Routines
        // ~~~~~~~~~~~~~~~~~~~~~~~~~

        /**
         * Adds a Custom Pattern to the List of Custom Patterns for Validation
         * 
         * @method defineCustomPattern
         * @scope public
         * @return boolean
         */
        defineCustomPattern: function(name, pattern, message) {
            
            // Ensure name is unique
            for (var i = 0; i < this.options.validation.customPatterns.length; i++) {
                if (this.options.validation.customPatterns[i].name.toLowerCase() == name.toLowerCase()) {
                    return false;
                }
            }
            
            // Store Custom Validator
            this.options.validation.customPatterns.push({
                'name':    name,
                'pattern': pattern,
                'message': message
            });
            
            return true;
        },
        
        /**
         * Gets all Pattern related Attributes from Element
         * 
         * @method getPatternDataFromField
         * @scope private
         * @return object {'pattern', 'message'}
         */
        getPatternDataFromField: function(fieldEl) {
            var retval = {'pattern': null, 'message': null};
            
            // Get Pattern to Test Against
            retval.pattern = fieldEl.attr('data-pattern') || '';
            
            // Check Field for Error Message or Get Default Error Message
            retval.message = fieldEl.attr('data-msg-pattern') || this.options.validation.defaultErrorMessage.pattern;
            //if( errorMsg.charAt(0) == '@' ) errorMsg = Locale.get(errorMsg.substr(1)) || Locale.get('forms-validation.defaultMessage.pattern');
            
            // Check for Custom Pattern Usage
            if (retval.pattern.charAt(0) == '#') {
                retval.pattern = retval.pattern.substr(1);
                    
                // Get Pattern and Error Message
                for (var i = 0; i < this.options.validation.customPatterns.length; i++) {
                    if (retval.pattern.toLowerCase() == this.options.validation.customPatterns[i].name.toLowerCase()) {
                        retval.pattern = this.options.validation.customPatterns[i].pattern;
                        retval.message = this.options.validation.customPatterns[i].message;
                        break;
                    }
                }
            }
            return retval;
        },

        /**
         * Gets all Elements that are Associated to Current Element (such as radio buttons with same name)
         * 
         * @method getAssociatedElements
         * @scope private
         * @return array an array of elements that are associated with field
         */
        getAssociatedElements: function(fieldEl, includeFirst ) {
            // Build Array of Associated Elements; Add Current Element First
            var elements = [];

            if( this.isAssociatedByName(fieldEl) ) {
                // Find Associated Elements by Name Attribute
                var fieldName = fieldEl.attr('name'), fieldId = fieldEl.attr('id') || '';
                if( fieldName ) {
                    $('input[name=' + fieldName + ']', this.formEl).each(function() {
                        var assocEl = $(this), assocId = assocEl.attr('id') || '';
                        if( !includeFirst && assocId.length && assocId == fieldId ) return;
                        elements.push(assocEl);
                    });
                }
            } else {
                if( includeFirst ) elements.push(fieldEl);

                // Find Associated Elements by Custom Attribute
                var assoc = fieldEl.attr('data-associated');
                if( assoc ) {
                    var assocEl, assocIds = assoc.split(',');
                    for( var i = 0; i < assocIds.length; i++ ) {
                        if( assocIds[i].charAt(0) != '#' ) assocIds[i] = '#' + assocIds[i];
                        assocEl = $(assocIds[i]);
                        if( assocEl ) elements.push(assocEl);
                    }
                }
            }

            return elements;
        },
        
        /**
         * Finds the designated Container of the Field Element (defined by attribute "data-container")
         * 
         * @method findFieldContainer
         * @scope private
         * @return HTMLElement containing element or self
         */
        findFieldContainer: function( fieldEl ) {
            // Find Field Container Element
            var fieldData = this.getFieldData(fieldEl);
            var inputContainer = fieldData.container;
            if( !inputContainer ) {
                var containerId = fieldEl.attr('data-container') || '';
                if (containerId.length) {
                    inputContainer = $('#' + containerId);
                    if (!inputContainer.length) {
                        inputContainer = fieldEl;
                    }
                } else {
                    inputContainer = fieldEl;
                }
            }
            this.setFieldData(fieldEl, {container: inputContainer});
            return inputContainer;
        },
        
        /**
         * Determines if 2 elements are associated by "name" attribute
         * 
         * @method isAssociatedByName
         * @scope private
         * @return boolean
         */
        isAssociatedByName: function( fieldEl ) {
            var tp = 'text', tg = fieldEl[0].nodeName.toLowerCase();
            if( tg == 'input' ) tp = fieldEl.attr('type').toLowerCase();
            if( tp == 'text' ) tp = (fieldEl.attr('rel') || 'text').toLowerCase();
            return (tp == 'radio' || tp == 'checkbox');// || tp == 'text-multi');
        },

        /**
         * Determines if element is a checkbox input
         * 
         * @method isInputCheckable
         * @scope private
         * @return boolean
         */
        isInputCheckable: function( fieldEl ) {
            var tp = 'text', tg = fieldEl[0].nodeName.toLowerCase();
            if( tg == 'input' ) tp = fieldEl.attr('type').toLowerCase();
            return (tp == 'radio' || tp == 'checkbox');
        },

        /**
         * Determines if element is a selectbox input
         * 
         * @method isInputSelectable
         * @scope private
         * @return boolean
         */
        isInputSelectable: function( fieldEl ) {
            var tg = fieldEl[0].nodeName.toLowerCase();
            return (tg == 'select') ? (((fieldEl.attr('multiple')||'').length) ? 'multiple' : 'single' ) : false;
        },

        /**
         * Determines if element is a numeric-range input
         * 
         * @method isInputNumeric
         * @scope private
         * @return boolean
         */
        isInputNumeric: function( fieldEl ) {
            var tp = 'text', tg = fieldEl[0].nodeName.toLowerCase();
            if( tg == 'input' ) tp = fieldEl.attr('type').toLowerCase();
            return (tp == 'range' || tp == 'number');
        },

        /**
         * Determines if element is a hidden input or hidden element
         * 
         * @method isElementHidden
         * @scope private
         * @return boolean
         */
        isElementHidden: function( fieldEl ) {
            var isHidden = false;
            if( fieldEl.hasClass('hidden') || fieldEl.hasClass('visuallyhidden') || fieldEl.hasClass('invisible') || fieldEl.css('display') == 'none' || fieldEl.css('visibility') == 'hidden' )
                isHidden = true;
            return isHidden;
        },

        /**
         * Gets the KeyCode of the current Event
         * 
         * @method getEventKeyCode
         * @scope private
         * @return number
         */
        getEventKeyCode: function( e ) {
            if (!e.which && ((e.charCode || e.charCode === 0) ? e.charCode : e.keyCode))
                e.which = e.charCode || e.keyCode;
            return e.which;
        },

        /**
         * Gets the Data attached to the Field Element
         * 
         * @method getFieldData
         * @scope private
         * @return Object
         */
        getFieldData: function( fieldEl ) {
            var fieldData = fieldEl.data('h5field');
            if( !fieldData ) {
                fieldData = $.extend(true, {}, this.fieldDataTypes);
                fieldEl.data('h5field', fieldData);
            }
            return fieldData;
        },

        /**
         * Sets the Data attached to the Field Element
         * 
         * @method setFieldData
         * @scope private
         * @return undefined
         */
        setFieldData: function( fieldEl, newFieldData ) {
            var fieldData = fieldEl.data('h5field');
            if( !fieldData ) fieldData = $.extend(true, {}, this.fieldDataTypes);
            fieldEl.data('h5field', $.extend(true, fieldData, newFieldData));
        },

        /**
         * Raises an Event of the Specified Type
         * 
         * @method raiseEvent
         * @scope private
         * @return undefined
         */
        raiseEvent: function(eventName) {
            if (typeof this.options.events[eventName] == 'function') {
                var newarr = [].slice.call(arguments, 1);
                this.options.events[eventName].apply(this, newarr);
            } 
        },
        
        /**
         * Finds the Friendly Name of the Field by getting the Associated Label, or from the name/id attributes of the Field
         * 
         * @method getFriendlyFieldName
         * @scope private
         * @return string Friendly Name of Field
         */
        getFriendlyFieldName: function(fieldEl) {
            var friendlyName   = '', 
                fieldId        = fieldEl.attr('id'), 
                fieldContainer = this.findFieldContainer(fieldEl), 
                label          = fieldContainer.find('label');
            
            // Get Friendly Name from Label if Exists
            if (!label.length) {
                label = $('label[for='+fieldId+']');
            }
            
            // Found Label; Get Friendly Name
            if (label.length) {
                friendlyName = label.text().replace(':', '');
            }
            // No Label; Get Friendly Name from Element name or id attribute
            else {
                friendlyName = fieldEl.attr('name').trim();
                if (!friendlyName.length) {
                    friendlyName = fieldEl.attr('id').trim();
                }
            }
            
            // Ensure we have a value for name
            if (!friendlyName.length) {
                friendlyName = '[Unknown Field]';
            }
            
            return friendlyName;
        },

        /**
         * Clears all Errors of Form
         * 
         * @method clearFormErrors
         * @scope private
         * @return undefined
         */
        clearFormErrors: function() {
            // Clear any past errors
            var data = this.formEl.data('h5form');
            data.errors.length = 0;
            data.errors = [];
            this.formEl.data('h5form', data);
        },

        /**
         * Adds an Error Message to the Form
         * 
         * @method addFormError
         * @scope private
         * @return undefined
         */
        addFormError: function(fieldEl, errorMsg) {
            var data = this.formEl.data('h5form'), initialCount = data.errors.length;
            data.errors.push({'fieldId': fieldEl.attr('id'), 'fieldEl': fieldEl, 'message': errorMsg});
            //this.formEl.data('h5form', data);
            
            if (initialCount < 1) {
                this.raiseEvent('onInvalid');
            }
        },

        /**
         * Removes an Error Message from the Form
         * 
         * @method removeFormError
         * @scope private
         * @return undefined
         */
        removeFormError: function(fieldEl) {
            if (!fieldEl.length) {return;}
            var i, data = this.formEl.data('h5form'), fieldId = fieldEl.attr('id'), errors = [], initialCount = data.errors.length;
            for (i = 0; i < initialCount; i++) {
                if (data.errors[i].fieldId != fieldId) {
                    errors.push({'fieldId': data.errors[i].fieldId, 'fieldEl':  data.errors[i].fieldEl, 'message': data.errors[i].message});
                }
            }
            data.errors = errors;
            //this.formEl.data('h5form', data);
            
            if (initialCount > 0 && errors.length == 0) {
                this.raiseEvent('onValid');
            }
        },

        /**
         * Gets a Unique ID for Forms/Fields with no ID
         * 
         * @method getUID
         * @scope private
         * @return string Unique ID for Element
         */
        getUID: function(){ return 'jq-h5-uid-' + (++this.lastUID); }
    });

    /**
     * Upgrades forms to HTML5 and provides validation
     *
     * @method h5form
     * @param options {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
     * @return jQuery
     */
    $.fn.h5form = function( options ) {
        if (typeof options == 'string') {
            var instance = $(this).data('html5form'), args = Array.prototype.slice.call(arguments, 1);
            return instance[options].apply(instance, args);
        } else {
            return this.each(function() {
                var instance = $(this).data('html5form');
                if (instance) {
                    if (options) {
                        $.extend(instance.options, options);
                    }
                    instance.reload();
                } else {
                    $(this).data('html5form', new $h5f(this, options));
                }
            });
        }
    };

})(jQuery);

