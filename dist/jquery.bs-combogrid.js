/*! Bootstrap Combogrid - v1.0.0 - 2016-08-10
* https://github.com/RodrigoBalest/bs-combogrid
* Copyright (c) 2016 Rodrigo Balest; Licensed MIT */
(function($) {

  // The combogrid input field
  function ComboGridInput(el, config) {

    var _this = this;
    this.$el = $(el);
    this.config = $.extend(true, {}, $.fn.bs_combogrid.defaults, config);
    this.page = 1;

    this.loadResultsPage = function(start, length) {
      var data = {
        /* jshint ignore:start */
        //[_this.$el.attr('name')] : _this.$el.val(),                  // Input field value
        /* jshint ignore:end */
        length: (length === undefined) ? this.config.length : length, // Number of items per page expected to be returned by the server
        start: (start === undefined) ? 0 : start                      // Index of first item expected to be returned by the server
      };
      data[_this.$el.attr('name')] = _this.$el.val();

      this.config.ajax.data = $.extend(true, {}, this.config.ajax.data, data); // Merge user defined ajax data with plugin's ajax data

      this.$el.addClass('cg-loading');

      // Make ajax request
      $.ajax(this.config.ajax).always(function() {
        _this.clearContainer(); // Removes combogrid container, if there's one
        _this.$el.removeClass('cg-loading');
      }).done(function(data) {
        _this.data = data;
        _this.container = new ComboGridContainer(_this.$el, data); // Creates container with results
      }).fail(function(jqXHR) {
        _this.container = new ComboGridContainer(_this.$el, { // Creates container with error message
          error: jqXHR.status + ': ' + jqXHR.responseText
        });
      });
    };

    this.goToFirstPage = function() {
      this.page = 1;
      this.loadResultsPage(0);
    };

    this.goToLastPage = function() {
      var numPages = Math.ceil(this.data.recordsTotal / this.data.data.length);
      this.page = numPages;
      var index = (numPages - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    this.goToPreviousPage = function() {
      this.page--;
      if(this.page <= 0){ this.page = 1; }
      var index = (this.page - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    this.goToNextPage = function() {
      this.page++;
      var numPages = Math.ceil(this.data.recordsTotal / this.data.data.length);
      if(this.page > numPages){ this.page = numPages; }
      var index = (this.page - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    this.clearContainer = function() {
      if(this.container !== undefined) {
        this.container.clear();
      }
    };

    this.setUp = function() {
      // Make ajax call on 'enter'
      this.$el.on('keypress', function(ev) {
        var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if(keycode === 13) {
          _this.page = 1;
          _this.loadResultsPage();
        }
      });

    };

    this.setUp();
  }

  // The combogrid results container
  function ComboGridContainer(el, data) {
    var _this = this;
    this.$el = $(el);
    this.data = data;
    var comboGridInput = this.$el.data('bs_combogrid');

    this.setUp = function() {
      var pos = _this.$el.position();
      pos.top = pos.top + _this.$el.outerHeight();

      this.container = $('<div />').attr({
        id: _this.$el.attr('id') + '-cg-container',
        class: 'cg-container panel panel-default'
      }).css({
        top: pos.top,
        left: pos.left
      }).insertAfter(_this.$el);

      this.setUpEvents();
    };

    this.setContents = function() {
      if( ! this.data.hasOwnProperty('error') && ! $.isArray(this.data.data) ) {
        this.showMessage('Server must return an array of data or an error message', 'danger');
      }
      else if(this.data.error) {
        this.showMessage(this.data.error, 'danger');
      }
      else if (this.data.recordsTotal === 0 || this.data.data.length === 0) {
        this.showMessage(comboGridInput.config.emptyMessage, 'warning');
      }
      else {
        this.table = new ComboGridTable(this.$el, this.data, this.container);
        if( typeof this.data.recordsTotal === 'number' && this.data.recordsTotal > this.data.data.length) { // Show paginator only when needed
          this.paginator = new ComboGridPaginator(this.$el, this.data, this.container);
        }
      }
    };

    this.showMessage = function(msg, type) {
      type = typeof type !== 'undefined' ? type : 'info';
      this.container.addClass('alert alert-' + type).text(msg);
    };

    // Removes container DOM element
    this.clear = function() {
      delete this.table;
      delete this.paginator;
      this.container.remove();
    };

    this.setUpEvents = function() {
      $(document).on('click', checkClickedOutside);
      this.$el.on('keypress', checkEscPressed);
    };

    function checkClickedOutside(ev) {
      var elements = [];
      elements.push(_this.$el);
      elements.push(_this.container);

      $.each(elements, function(key, value) {
          if (!$(value).is(ev.target) && // if the target of the click isn't the container...
              $(value).has(ev.target).length === 0) // ... nor a descendant of the container
          {
              _this.clear();
              $(document).off('click', checkClickedOutside);
          }
      });
    }

    function checkEscPressed(ev) {
        var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if(keycode === 27) {
          _this.clear();
        }
    }

    this.setUp();
    this.setContents();
  }

  // The combogrid results table
  function ComboGridTable(el, data, container) {
    var _this = this;
    this.$el = $(el);
    this.data = data;
    this.$container = $(container);
    var comboGridInput = this.$el.data('bs_combogrid');

    this.setUp = function() {
      var $t = $('<table />').addClass('table table-hover');
      var $tBody = $t.append('<tbody />').find('tbody');

      for(var i in this.data.data) {
        var $tr = $('<tr />');
        var rowData = this.data.data[i];
        for(var k in rowData) {
          $('<td />').text(rowData[k]).appendTo($tr);
        }
        $tr.data(rowData).appendTo($tBody);
      }
      $t.appendTo(this.$container);
      this.$table = $t;
      this.setUpListeners();
    };

    this.setUpListeners = function() {
      this.$table.on("click", "tr", function() {
    	  comboGridInput.config.onItemSelect.call(_this.$el, $(this).data());
    	});
    };

    this.setUp();
  }

  // The combo grid paginator
  function ComboGridPaginator(el, data, container) {
    this.$el = $(el);
    this.data = data;
    this.$container = $(container);
    this.config = {
  	  firstLabel: '<span class="glyphicon glyphicon-fast-backward"></span>',
  	  previousLabel: '<span class="glyphicon glyphicon-backward"></span>',
  	  nextLabel: '<span class="glyphicon glyphicon-forward"></span>',
  	  lastLabel: '<span class="glyphicon glyphicon-fast-forward"></span>',
  	};

    var comboGridInput = this.$el.data('bs_combogrid');
    var numPages = Math.ceil(data.recordsTotal / comboGridInput.config.length);
    var page = comboGridInput.page;

    this.setUp = function() {
      var $pager = $('<nav class="panel-footer">' +
    	  '  <ul class="pager">' +
    	  '    <li class="previous pFirst"><a href="#">' + this.config.firstLabel + '</a></li>' +
    	  '    <li class="previous pPrev"><a href="#">' + this.config.previousLabel + '</a></li>' +
    	  '    <li><span class="pagerCounter">' + page + '/' + numPages + '</span></li>' +
    	  '    <li class="next pLast"><a href="#">' + this.config.lastLabel + '</a></li>' +
    	  '    <li class="next pNext"><a href="#">' + this.config.nextLabel + '</a></li>' +
    	  '  </ul>' +
    	  '</nav>');
      if(page <= 1) {
        $pager.find('.pFirst, .pPrev').addClass('disabled');
      }
      if(page >= numPages) {
        $pager.find('.pLast, .pNext').addClass('disabled');
      }
      this.$container.append($pager);
      this.$pager = $pager;
      this.setUpListeners();
    };

    this.setUpListeners = function() {
      this.$pager.on('click', function(ev) {
        var $t = $(ev.target).parents('li').first();
        ev.preventDefault();
        if($t.hasClass('pFirst')) {
          if(page > 1) {
            comboGridInput.goToFirstPage();
          }
        }
        else if ($t.hasClass('pPrev')) {
          if(page > 1) {
            comboGridInput.goToPreviousPage();
          }
        }
        else if ($t.hasClass('pLast')) {
          if(page < numPages) {
            comboGridInput.goToLastPage();
          }
        }
        else if ($t.hasClass('pNext')) {
          if(page < numPages) {
            comboGridInput.goToNextPage();
          }
        }
      });
    };

    this.setUp();
  }

  // Collection method.
  $.fn.bs_combogrid = function(config) {
    return this.each(function() {
      var $el = $(this);
      if($el.data('bs_combogrid')) { return; } // Instantiate only once
      $el.data('bs_combogrid', new ComboGridInput(this, config));
    });
  };

  // Default config
  $.fn.bs_combogrid.defaults = {
    length: 10,
    emptyMessage: 'No results were found',
    ajax: {},
    // If the clicked item has a property named equal to input's name,
  	// sets input's value the same as property's value
  	onItemSelect: function(item) {
  	  var $this = $(this);
  	  if(typeof item[$this.attr('name')] !== undefined) {
  	     $this.val(item[$this.attr('name')]);
       }
  	},
  };

}(jQuery));
