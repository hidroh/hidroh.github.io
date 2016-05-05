(function($){
  var el;
  var settings = {};

  var methods = {
    init: function(options) {
      el = this;

      settings = { token: false, query: '' };

      if (options) {
        $.extend(settings, options);
      }

      if (!settings.token) {
        return this;
      }

      if (settings.query == '') {
        if (settings['complete']) {
          settings.complete(el, []);
        }
        return this;
      }
      $.getJSON(
        'http://tapirgo.com/api/1/search.json?token=' + settings.token + '&query=' + settings.query + '&callback=?', function(data){
          if (settings['complete']) {
            settings.complete(el, data);
          }
        }
      );

      return this;
    }
  };

  $.fn.tapir = function(method) {
    if (methods[method]) {
      return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.tapir');
    }
  };

})( jQuery );