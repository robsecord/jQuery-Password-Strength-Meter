/* Author: 

*/

$(document).ready(function() {
    
    // Enable HTML5 Forms    
    $('form').h5form({
        validation: {
            output: {
                inline: {type: 'none'},
                submit: {enabled: false},
                iconToggle: h5form_toggleFieldIcon
            },
            classname: {
                valid:   '',
                invalid: 'error'
            }        
        }
    });
    
    // Enable Password Meter
    $('[data-password-meter]').pwdMeter({
        //...
    });
    
});


// Custom Method for Displaying Field Validity Icons
// "this" var refers to h5form object
function h5form_toggleFieldIcon(fieldEl, errorMsg, isValid) {
    var fieldData = this.getFieldData(fieldEl);

    // Check for Existing Field Icon
    var fieldIcon = fieldData.fieldIcon;
    if( !fieldIcon ) {
        // Create New Field Icon Element
        fieldIcon = $('<span/>').insertAfter(fieldEl);
        fieldIcon.addClass('help-block error-msg')
            .attr('title', this.options.validation.defaultErrorMessage.iconValid)
            .css({'display': 'block'});

        // Store Field Icon with Field
        this.setFieldData(fieldEl, {fieldIcon: fieldIcon});
    }

    // Update Field Icon State
    if( isValid !== false ) {
        fieldIcon.css({'display': 'none'});
    } else {
        errorMsg = errorMsg || this.options.validation.defaultErrorMessage.iconInvalid;
        fieldIcon.css({'display': 'block'})
            .html('<small><\/small>' + errorMsg)
            .attr('title', errorMsg);
    }
}
