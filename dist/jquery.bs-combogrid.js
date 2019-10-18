/*! Bootstrap Combogrid - v2.1.0 - 2019-10-18
* https://github.com/RodrigoBalest/bs-combogrid
* Copyright (c) 2019 Rodrigo Balest; */
/*
 * bs-combogrid
 * https://github.com/RodrigoBalest/bs-combogrid
 *
 * Copyright (c) 2016 Rodrigo Balest
 * Licensed under the MIT license.
 */

(function($) {

  // The combogrid input field
  function ComboGridInput(el, config) {

    var _this = this;
    this.$el = $(el);
    this.config = $.extend(true, {}, $.fn.bs_combogrid.defaults, config);
    this.page = 1;

    this.loadResultsPage = function(start, length) {
      var data = {
        // Number of items per page expected to be returned by the server.
        length: (length === undefined) ? this.config.length : length,
        // Index of first item expected to be returned by the server.
        start: (start === undefined) ? 0 : start                      
      };
      // Input field value.
      // If `<input type="text" name="search" value="lorem" />`,
      // then `data.search = 'lorem'`
      data[_this.$el.attr('name')] = _this.$el.val();

      // Merge user defined ajax data with the parameters
      // set above on `data` object.
      this.config.ajax.data = $.extend(true, {}, this.config.ajax.data, data);

      this.$el.addClass('cg-loading');

      // Make ajax request
      $.ajax(this.config.ajax)
        // When server responds...
        .always(function() {
          // ...removes combogrid container, if there's one...
          _this.clearContainer();
          // ...and removes loading class from input.
          _this.$el.removeClass('cg-loading');
        })
        // When server responds with success...
        .done(function(data) {
          // ...stores the returned data...
          _this.data = data;
          // ...and creates container with results.
          _this.container = new ComboGridContainer(_this.$el, data);
        })
        // When server responds with error...
        .fail(function(jqXHR) {
          // ...creates container with error message.
          _this.container = new ComboGridContainer(_this.$el, {
            error: jqXHR.status + ': ' + jqXHR.responseText
          });
        });
    };

    this.goToFirstPage = function() {
      this.page = 1;
      this.loadResultsPage(0);
    };

    this.goToLastPage = function() {
      // recordsTotal: the total number of records matching the search.
      // length: the number of records in the returned page.
      var numPages = Math.ceil(this.data.recordsTotal / this.data.data.length);
      this.page = numPages;
      // Get index of first record in the last page.
      var index = (numPages - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    this.goToPreviousPage = function() {
      this.page--;
      // We can't go below the first page.
      if(this.page <= 0){
        this.page = 1;
      }
      // Get index of first record in the previous page.
      var index = (this.page - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    this.goToNextPage = function() {
      this.page++;
      // recordsTotal: the total number of records matching the search.
      // length: the number of records in the returned page.
      var numPages = Math.ceil(this.data.recordsTotal / this.data.data.length);
      // We can't go above the last page.
      if(this.page > numPages){
        this.page = numPages;
      }
      // Get index of first record in the next page.
      var index = (this.page - 1) * this.config.length;
      this.loadResultsPage(index);
    };

    // Empties and removes the results container.
    this.clearContainer = function() {
      if(this.container !== undefined) {
        this.container.clear();
      }
    };

    // Sets up the events on the element.
    this.setUp = function() {
      // Make ajax call on 'enter'
      this.$el.on('keypress', function(ev) {
        var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if(keycode === 13) {
          _this.goToFirstPage();
        }
      });

      // Listen to clicks on a searchButton, if specified.
      if(this.config.searchButton) {
        $(document).on('click', this.config.searchButton, function(ev) {
          ev.preventDefault();
          _this.goToFirstPage();
        });
      }
    };

    // Start everything!
    this.setUp();
  }

  // The combogrid results container
  function ComboGridContainer(el, data) {
    var _this = this;
    this.$el = $(el);
    this.data = data;
    var comboGridInput = this.$el.data('bs_combogrid');

    this.setUp = function() {
      // Let's align the container to the left
      // and right below the input.
      var pos = _this.$el.position();
      pos.top = pos.top + _this.$el.outerHeight();

      this.container = $('<div />').attr({
        id: _this.$el.attr('id') + '-cg-container',
        class: 'cg-container card'
      }).css({
        top: pos.top,
        left: pos.left
      }).insertAfter(_this.$el);

      if (comboGridInput.config.containerWidth) {
        this.container.css('width', comboGridInput.config.containerWidth);
      }

      // Don't let container passes beyond bottom of the screen.
      var h = document.documentElement.clientHeight - (this.container.offset().top - $(window).scrollTop());
      this.container.css({
        maxHeight: h,
        overflow: 'auto'
      });

      this.setUpEvents();
    };

    this.setContents = function() {
      if ( ! this.data.hasOwnProperty('error') && ! $.isArray(this.data.data) ) {
        this.showMessage('Server must return an array of data or an error message', 'danger');
      }
      else if (this.data.error) {
        this.showMessage(this.data.error, 'danger');
      }
      else if (this.data.recordsTotal === 0 || this.data.data.length === 0) {
        this.showMessage(comboGridInput.config.emptyMessage, 'warning');
      }
      else {
        this.table = new ComboGridTable(this.$el, this.data, this.container);
        // Show paginator only when needed
        if (
          typeof this.data.recordsTotal === 'number' &&
          this.data.recordsTotal > this.data.data.length
        ) {
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

    // TODO: Check if these events are not triggered multiple times
    // os subsequent searches.
    this.setUpEvents = function() {
      $(document).on('click', clearIfItShould);
      this.$el.on('keypress', clearIfEscPressed);
    };

    function clearIfItShould(ev) {
      if(
        // if the target is not the input...
        ! _this.$el.is(ev.target) &&
        // ...and is not one of the pager's links...
        ! _this.container.find('.page-link').is(ev.target)
      ) {
        // ...removes the container and this listener.
        _this.clear();
        $(document).off('click', clearIfItShould);
      }
    }

    function clearIfEscPressed(ev) {
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

    var hasColModel = comboGridInput.config.colModel instanceof Object;

    this.setUp = function() {
      var $t = $('<table />').addClass('table').addClass(comboGridInput.config.tableClass);
      // If the developer informed a colModel, a tHead is created
      if(hasColModel) {
        var $tHead = $('<thead />');
        var $tHeadRow = $tHead.append('<tr />').find('tr');
        for(var colName in comboGridInput.config.colModel) {
          $('<th />').text(comboGridInput.config.colModel[colName]).appendTo($tHeadRow);
        }
        $tHead.appendTo($t);
      }
      generateTableBody($t, this.data.data);

      $t.appendTo(this.$container);
      this.$table = $t;
      this.setUpListeners();
    };

    function generateTableBody($t, data) {
      // Adds a tbody to the table
      var $tBody = $t.append('<tbody />').find('tbody');
      // Builds the table rows with data
      for(var i in data) {
        var $tr = $('<tr />');
        var rowData = data[i];
        if(hasColModel) { // If we have a colModel definition, order rows' cells according to it...
          for(var colName in comboGridInput.config.colModel) {
            $('<td />').text(rowData[colName]).appendTo($tr);
          }
        } else { // If we don't, order row's cells as returned from the server.
          for(var k in rowData) {
            $('<td />').text(rowData[k]).appendTo($tr);
          }
        }
        $tr.data(rowData).appendTo($tBody);
      }
    }

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
      firstLabel: '⏪',
      previousLabel: '◀',
      nextLabel: '▶',
      lastLabel: '⏩',
    };

    var comboGridInput = this.$el.data('bs_combogrid');
    var numPages = Math.ceil(data.recordsTotal / comboGridInput.config.length);
    var page = comboGridInput.page;

    this.setUp = function() {
      var $pager = $('<nav class="card-footer">' +
        '  <ul class="pagination pagination-sm justify-content-center mb-0">' +
        '    <li class="page-item previous pFirst"><a class="page-link" href="#">' + this.config.firstLabel + '</a></li>' +
        '    <li class="page-item previous pPrev"><a class="page-link" href="#">' + this.config.previousLabel + '</a></li>' +
        '    <li class="page-item disabled"><span class="pagerCounter page-link">' + page + '/' + numPages + '</span></li>' +
        '    <li class="page-item next pNext"><a class="page-link" href="#">' + this.config.nextLabel + '</a></li>' +
        '    <li class="page-item next pLast"><a class="page-link" href="#">' + this.config.lastLabel + '</a></li>' +
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
      // Instantiate only once
      if($el.data('bs_combogrid')) {
        return;
      }
      $el.data('bs_combogrid', new ComboGridInput(this, config));
    });
  };

  // Default config
  $.fn.bs_combogrid.defaults = {
    length: 10,
    emptyMessage: 'No results were found',
    // `ajax` accepts the same parameters as `jQuery.ajax()`.
    ajax: {},
    searchButton: false,
    // If the clicked item has a property named equal to input's name,
    // sets input's value the same as property's value
    onItemSelect: function(item) {
      var $this = $(this);
      if(typeof item[$this.attr('name')] !== undefined) {
         $this.val(item[$this.attr('name')]);
       }
    },
    tableClass: 'mb-0 table-hover table-sm',
    containerWidth: null
  };

}(jQuery));
