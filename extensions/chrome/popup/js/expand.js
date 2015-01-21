// why is javascript still missing sprintf anyway?!
if (typeof String.prototype.format != 'function') {
    String.prototype.format = function() {
        var args = arguments;
        if (typeof args[0] == "object")
            args = args[0];
 
        return this.replace(/{([\d\w\_\-]+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

if (typeof String.prototype.capitalizeFirstLetter != 'function') {
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

// helper for leading zeroes
if (typeof Number.prototype.pad != 'function') {
    Number.prototype.pad = function(size) {
        var num = this+"";
        while (num.length < size) num = "0" + num;
        return num;
    };
}