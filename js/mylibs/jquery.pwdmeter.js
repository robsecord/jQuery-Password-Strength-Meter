/**
 *  Original Implementation and Algorithm by: Jeff Todnem (http://www.todnem.com/)
 */



if(typeof String.prototype.trim != 'function' ) {
    String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };
}
if (typeof String.prototype.strReverse != 'function') {
    String.prototype.strReverse = function() {
    	var newstring = "";
    	for (var s=0; s < this.length; s++) {
    		newstring = this.charAt(s) + newstring;
    	}
    	return newstring;
    };
}


(function($, undefined) {
    
    //"use strict";
    
    // Configuration properties
    var defaults = {
        // Optional Settings:
        complexityStrings: [
            {min:  0, max:  20, desc: 'Very Weak'}, 
            {min: 21, max:  40, desc: 'Weak'}, 
            {min: 41, max:  60, desc: 'Good'}, 
            {min: 61, max:  80, desc: 'Strong'}, 
            {min: 81, max: 100, desc: 'Very Strong'}
        ]
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
    $.pwdMeter = function(element, options) {
        this.options = $.extend(true, {}, defaults, options || {});

        // Get Field Element and Reference Data
        this.fieldEl = $(element);
        if (!this.fieldEl.length) {return;}
        
        // Setup Field Elements for Monitoring
        this.setup();
    };

    // Create shortcut for internal use
    var $pwd = $.pwdMeter;
    $pwd.fn = $pwd.prototype = {pwdMeter: '0.1.1'};
    $pwd.fn.extend = $pwd.extend = $.extend;

    $pwd.fn.extend({
        
        /**
         * Sets up the Password Strength Meter Field Elements
         *
         * @method setup
         * @scope private
         * @return undefined
         */
        setup: function() {
            // Get ID of Password Meter Element 
            var meterId = this.fieldEl.attr('data-password-meter');
            if (!meterId.length) {return;}
            if (meterId.charAt(0) != '#') {
                meterId = '#' + meterId;
            }
            
            // Get Password Meter Elements
            this.meterContainer = $(meterId);
            if (!this.meterContainer.length) {return;}
            
            // Get Password Meter Child Elements
            this.meterBg = this.meterContainer.find('.password-strength-bg');
            this.meterDesc = this.meterContainer.find('.password-strength-desc');
            if (!this.meterBg.length || !this.meterDesc.length) {return;}
            
            // Display Password Meter
            this.meterContainer.show();
            
            // Attach Event to Monitor Keystrokes
            this.fieldEl.bind('keyup', this._monitor_key_press());
        },
        
        /**
         * Monitors Keypresses on Password Fields to Test Strength of Password
         *
         * @method monitorKeyPress
         * @scope private
         * @return undefined
         */
        monitorKeyPress: function(e) {
            var fieldEl = $(e.target), val = fieldEl.val();
            
            // Get Strength Score
            var score = this.getStrengthScore(val);
            
            // Determine Complexity Value
            var i, complexity = '';
            for (i = 0; i < this.options.complexityStrings.length; i++) {
                if (score >= this.options.complexityStrings[i].min && score <= this.options.complexityStrings[i].max) {
                    complexity = this.options.complexityStrings[i].desc;
                    break;
                }
            }

    		// Update Password Meter Elements with Score    		
    		this.meterBg.css({'backgroundPosition': '-' + parseInt(score * 4) + 'px'});
    		this.meterDesc.html(complexity);
    		
    		return true;
        },
        
        /**
         * Function closure for Monitoring Keypresses on Password Fields; Maintains "this" variable as "_self"
         * 
         * @method _monitor_key_press
         * @scope private
         * @return function [event handler]
         */
        _monitor_key_press: function(){ var _self = this; return function(e){ return _self.monitorKeyPress(e); }; },

        
        /**
         * Tests Password String to Determine Strength Score
         *   - Function written by: Jeff Todnem (http://www.todnem.com/)
         *
         * @method getStrengthScore
         * @scope private
         * @return undefined
         */
        getStrengthScore: function(pwd) {
        	var nScore=0, nLength=0, nAlphaUC=0, nAlphaLC=0, nNumber=0, nSymbol=0, nMidChar=0, nRequirements=0, nAlphasOnly=0, nNumbersOnly=0, nUnqChar=0, nRepChar=0, nRepInc=0, nConsecAlphaUC=0, nConsecAlphaLC=0, nConsecNumber=0, nConsecSymbol=0, nConsecCharType=0, nSeqAlpha=0, nSeqNumber=0, nSeqSymbol=0, nSeqChar=0, nReqChar=0, nMultConsecCharType=0;
        	var nMultRepChar=1, nMultConsecSymbol=1;
        	var nMultMidChar=2, nMultRequirements=2, nMultConsecAlphaUC=2, nMultConsecAlphaLC=2, nMultConsecNumber=2;
        	var nReqCharType=3, nMultAlphaUC=3, nMultAlphaLC=3, nMultSeqAlpha=3, nMultSeqNumber=3, nMultSeqSymbol=3;
        	var nMultLength=4, nMultNumber=4;
        	var nMultSymbol=6;
        	var nTmpAlphaUC="", nTmpAlphaLC="", nTmpNumber="", nTmpSymbol="";
        	var sAlphaUC="0", sAlphaLC="0", sNumber="0", sSymbol="0", sMidChar="0", sRequirements="0", sAlphasOnly="0", sNumbersOnly="0", sRepChar="0", sConsecAlphaUC="0", sConsecAlphaLC="0", sConsecNumber="0", sSeqAlpha="0", sSeqNumber="0", sSeqSymbol="0";
        	var sAlphas = "abcdefghijklmnopqrstuvwxyz";
        	var sNumerics = "01234567890";
        	var sSymbols = ")!@#$%^&*()";
        	var sComplexity = "Too Short";
        	var sStandards = "Below";
        	var nMinPwdLen = 8;
        	if (document.all) { var nd = 0; } else { var nd = 1; }
        	if (pwd) {
        		nScore = parseInt(pwd.length * nMultLength);
        		nLength = pwd.length;
        		var arrPwd = pwd.replace(/\s+/g,"").split(/\s*/);
        		var arrPwdLen = arrPwd.length;
        		
        		/* Loop through password to check for Symbol, Numeric, Lowercase and Uppercase pattern matches */
        		for (var a=0; a < arrPwdLen; a++) {
        			if (arrPwd[a].match(/[A-Z]/g)) {
        				if (nTmpAlphaUC !== "") { if ((nTmpAlphaUC + 1) == a) { nConsecAlphaUC++; nConsecCharType++; } }
        				nTmpAlphaUC = a;
        				nAlphaUC++;
        			}
        			else if (arrPwd[a].match(/[a-z]/g)) { 
        				if (nTmpAlphaLC !== "") { if ((nTmpAlphaLC + 1) == a) { nConsecAlphaLC++; nConsecCharType++; } }
        				nTmpAlphaLC = a;
        				nAlphaLC++;
        			}
        			else if (arrPwd[a].match(/[0-9]/g)) { 
        				if (a > 0 && a < (arrPwdLen - 1)) { nMidChar++; }
        				if (nTmpNumber !== "") { if ((nTmpNumber + 1) == a) { nConsecNumber++; nConsecCharType++; } }
        				nTmpNumber = a;
        				nNumber++;
        			}
        			else if (arrPwd[a].match(/[^a-zA-Z0-9_]/g)) { 
        				if (a > 0 && a < (arrPwdLen - 1)) { nMidChar++; }
        				if (nTmpSymbol !== "") { if ((nTmpSymbol + 1) == a) { nConsecSymbol++; nConsecCharType++; } }
        				nTmpSymbol = a;
        				nSymbol++;
        			}
        			/* Internal loop through password to check for repeat characters */
        			var bCharExists = false;
        			for (var b=0; b < arrPwdLen; b++) {
        				if (arrPwd[a] == arrPwd[b] && a != b) { /* repeat character exists */
        					bCharExists = true;
        					/* 
        					Calculate icrement deduction based on proximity to identical characters
        					Deduction is incremented each time a new match is discovered
        					Deduction amount is based on total password length divided by the
        					difference of distance between currently selected match
        					*/
        					nRepInc += Math.abs(arrPwdLen/(b-a));
        				}
        			}
        			if (bCharExists) { 
        				nRepChar++; 
        				nUnqChar = arrPwdLen-nRepChar;
        				nRepInc = (nUnqChar) ? Math.ceil(nRepInc/nUnqChar) : Math.ceil(nRepInc); 
        			}
        		}
        		
        		/* Check for sequential alpha string patterns (forward and reverse) */
        		for (var s=0; s < 23; s++) {
        			var sFwd = sAlphas.substring(s,parseInt(s+3));
        			var sRev = sFwd.strReverse();
        			if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqAlpha++; nSeqChar++;}
        		}
        		
        		/* Check for sequential numeric string patterns (forward and reverse) */
        		for (var s=0; s < 8; s++) {
        			var sFwd = sNumerics.substring(s,parseInt(s+3));
        			var sRev = sFwd.strReverse();
        			if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqNumber++; nSeqChar++;}
        		}
        		
        		/* Check for sequential symbol string patterns (forward and reverse) */
        		for (var s=0; s < 8; s++) {
        			var sFwd = sSymbols.substring(s,parseInt(s+3));
        			var sRev = sFwd.strReverse();
        			if (pwd.toLowerCase().indexOf(sFwd) != -1 || pwd.toLowerCase().indexOf(sRev) != -1) { nSeqSymbol++; nSeqChar++;}
        		}
        		
        	    /* Modify overall score value based on usage vs requirements */
        
        		/* General point assignment */
        		if (nAlphaUC > 0 && nAlphaUC < nLength) {	
        			nScore = parseInt(nScore + ((nLength - nAlphaUC) * 2));
        		}
        		if (nAlphaLC > 0 && nAlphaLC < nLength) {	
        			nScore = parseInt(nScore + ((nLength - nAlphaLC) * 2)); 
        		}
        		if (nNumber > 0 && nNumber < nLength) {	
        			nScore = parseInt(nScore + (nNumber * nMultNumber));
        		}
        		if (nSymbol > 0) {	
        			nScore = parseInt(nScore + (nSymbol * nMultSymbol));
        		}
        		if (nMidChar > 0) {	
        			nScore = parseInt(nScore + (nMidChar * nMultMidChar));
        		}
        		
        		/* Point deductions for poor practices */
        		if ((nAlphaLC > 0 || nAlphaUC > 0) && nSymbol === 0 && nNumber === 0) {  // Only Letters
        			nScore = parseInt(nScore - nLength);
        			nAlphasOnly = nLength;
        		}
        		if (nAlphaLC === 0 && nAlphaUC === 0 && nSymbol === 0 && nNumber > 0) {  // Only Numbers
        			nScore = parseInt(nScore - nLength); 
        			nNumbersOnly = nLength;
        		}
        		if (nRepChar > 0) {  // Same character exists more than once
        			nScore = parseInt(nScore - nRepInc);
        		}
        		if (nConsecAlphaUC > 0) {  // Consecutive Uppercase Letters exist
        			nScore = parseInt(nScore - (nConsecAlphaUC * nMultConsecAlphaUC)); 
        		}
        		if (nConsecAlphaLC > 0) {  // Consecutive Lowercase Letters exist
        			nScore = parseInt(nScore - (nConsecAlphaLC * nMultConsecAlphaLC)); 
        		}
        		if (nConsecNumber > 0) {  // Consecutive Numbers exist
        			nScore = parseInt(nScore - (nConsecNumber * nMultConsecNumber));  
        		}
        		if (nSeqAlpha > 0) {  // Sequential alpha strings exist (3 characters or more)
        			nScore = parseInt(nScore - (nSeqAlpha * nMultSeqAlpha)); 
        		}
        		if (nSeqNumber > 0) {  // Sequential numeric strings exist (3 characters or more)
        			nScore = parseInt(nScore - (nSeqNumber * nMultSeqNumber)); 
        		}
        		if (nSeqSymbol > 0) {  // Sequential symbol strings exist (3 characters or more)
        			nScore = parseInt(nScore - (nSeqSymbol * nMultSeqSymbol)); 
        		}
        
        		/* Determine if mandatory requirements have been met and set image indicators accordingly */
        		var arrChars = [nLength,nAlphaUC,nAlphaLC,nNumber,nSymbol];
        		var arrCharsIds = ["nLength","nAlphaUC","nAlphaLC","nNumber","nSymbol"];
        		var arrCharsLen = arrChars.length;
        		for (var c=0; c < arrCharsLen; c++) {
        			if (arrCharsIds[c] == "nLength") { var minVal = parseInt(nMinPwdLen - 1); } else { var minVal = 0; }
        			if (arrChars[c] == parseInt(minVal + 1)) { nReqChar++; }
        			else if (arrChars[c] > parseInt(minVal + 1)) { nReqChar++; }
        			else {}
        		}
        		nRequirements = nReqChar;
        		if (pwd.length >= nMinPwdLen) { var nMinReqChars = 3; } else { var nMinReqChars = 4; }
        		if (nRequirements > nMinReqChars) {  // One or more required characters exist
        			nScore = parseInt(nScore + (nRequirements * 2)); 
        		}
        
        		/* Determine if additional bonuses need to be applied and set image indicators accordingly */
        		var arrChars = [nMidChar,nRequirements];
        		var arrCharsIds = ["nMidChar","nRequirements"];
        		var arrCharsLen = arrChars.length;
        		for (var c=0; c < arrCharsLen; c++) {
        			if (arrCharsIds[c] == "nRequirements") { var minVal = nMinReqChars; } else { var minVal = 0; }
        		}
        		
        		if (nScore > 100) { nScore = 100; } else if (nScore < 0) { nScore = 0; }
        	}
     		return nScore;
    	}
        
    });

    /**
     * Upgrades forms to HTML5 and provides validation
     *
     * @method h5form
     * @param options {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
     * @return jQuery
     */
    $.fn.pwdMeter = function( options ) {
        if (typeof options == 'string') {
            var instance = $(this).data('pwdMeter'), args = Array.prototype.slice.call(arguments, 1);
            return instance[options].apply(instance, args);
        } else {
            return this.each(function() {
                var instance = $(this).data('pwdMeter');
                if (instance) {
                    if (options) {
                        $.extend(instance.options, options);
                    }
                    instance.reload();
                } else {
                    $(this).data('pwdMeter', new $pwd(this, options));
                }
            });
        }
    };

})(jQuery);

