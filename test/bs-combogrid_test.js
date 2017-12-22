/* globals sinon */

(function($) {

  var sampleData;

  module('jQuery#bs_combogrid', {
    setup: function() {
      this.elems = $('#qunit-fixture').find('input');
      $('#qunit-fixture').find('.cg-container').remove();
      $.mockjax.clear();
    }
  });

  /***********************************************/
  test('is available on jquery namespace', function() {
	  expect(1);
	  ok($.fn.bs_combogrid);
  });

  /***********************************************/
  test('is chainable', function() {
    expect(1);
    strictEqual(this.elems.bs_combogrid(), this.elems, 'should be chainable');
  });

  /***********************************************/
  test('an ajax call is made on enter keypress', function() {
    expect(1);
    sinon.spy($, 'ajax');

    this.elems.bs_combogrid();
    this.elems.triggerEnter();

    ok($.ajax.calledOnce, 'an ajax call should have been made');

    $.ajax.restore();
  });

  /***********************************************/
  test('ajax call sends input field name:value pair', function() {
    expect(this.elems.length);

    this.elems.each(function() {
      sinon.spy($, 'ajax');
      var $el = $(this);

      $el.bs_combogrid();

      $el.val('Lorem ipsum');
      $el.triggerEnter();

      var args = $.ajax.getCall(0).args[0];
      ok(args.hasOwnProperty('data') &&
        args.data.hasOwnProperty($el.attr('name')) &&
        args.data[$el.attr('name')] === $el.val(), 'an ajax call should have been made with the expected ' + $el.attr('name') + ':' + $el.val() + ' pair');

      $.ajax.restore();
    });
  });

  /***********************************************/
  test('ajax call sends expected number of entries per page as \'length\'', function() {
    expect(this.elems.length * 2);

    this.elems.each(function() {
      sinon.spy($, 'ajax');
      var $el = $(this);

      $el.bs_combogrid();
      $el.triggerEnter();

      var args = $.ajax.getCall(0).args[0];
      ok(args.hasOwnProperty('data') && args.data.hasOwnProperty('length'), 'an ajax call should have a \'length\' attribute');
      equal(args.data.length, 10, '\'length\' defaults to 10');

      $.ajax.restore();
    });
  });

  /***********************************************/
  test('ajax call sends start index number to server', function() {
    sinon.spy($, 'ajax');
    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    var args = $.ajax.getCall(0).args[0];
    ok(args.hasOwnProperty('data') && args.data.hasOwnProperty('start'), 'an ajax call should have a \'start\' attribute');
    equal(args.data.start, 0, '\'length\' defaults to 0');

    $.ajax.restore();
  });

  /***********************************************/
  asyncTest('creates results container below input', function() {
    $.mockjax({
      url: '*',
      responseTime: [100, 200]
    });

    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      var cPos = $container.position();
      var elPos = $el.position();

      equal($container.attr('id'), $el.attr('id') + '-cg-container', 'The element next to the input should have appropriate ID');
      ok($container.hasClass('cg-container'), 'The element next to the input should have \'cg-container\' class');
      equal(cPos.left, elPos.left, 'Container should be left aligned to the input');
      equal(cPos.top, $el.outerHeight() + elPos.top, 'Container should be right below the input');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('server must return an array of data or an error message, or message is shown', function() {
    $.mockjax({
      url: '*',
      responseTime: [100, 200],
      responseText: ''
    });

    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      equal($container.text(), 'Server must return an array of data or an error message', 'Error message should have been shown');
      ok($container.hasClass('alert alert-danger'), 'Container should have \'alert-danger\' class');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('message should be displayed when results are empty', function() {
    $.mockjax({
      url: '*',
      responseTime: 20,
      responseText: {"data":[],"recordsTotal":0}
    });

    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      equal($container.text(), 'No results were found', '\'No results were found\' message should be shown');
      ok($container.hasClass('alert alert-warning'), 'Container should have \'alert-warning\' class');

      start();
    }, 25);
  });
  /***********************************************/
  asyncTest('empty results message should be customized', function() {
    $.mockjax({
      url: '*',
      responseTime: 20,
      responseText: {"data":[],"recordsTotal":0}
    });

    var $el = this.elems.first();

    $el.bs_combogrid({
      emptyMessage: 'Akukho ziphumo afunyanwa!'
    });
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      equal($container.text(), 'Akukho ziphumo afunyanwa!', 'custom empty message should be shown');

      start();
    }, 25);
  });

  /***********************************************/
  asyncTest('http errors must be shown', function() {
    $.mockjax({
      url: '*',
      responseTime: [100, 200],
      status: 404,
      responseText: 'Not found'
    });

    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      equal($container.text(), '404: Not found', 'HTTP error message should have been shown');
      ok($container.hasClass('alert alert-danger'), 'Container should have \'alert-error\' class');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('container displays error message sent by the server', function() {
    $.mockjax({
      url: '*',
      responseTime: [100, 200],
      responseText: {
        error: 'Something very terrible and scary happened to your webserver!'
      }
    });

    var $el = this.elems.first();

    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();

      equal($container.text(), 'Something very terrible and scary happened to your webserver!', 'The container should show the error message sent from the server');
      ok($container.hasClass('alert alert-danger'), 'Container should have \'alert-error\' class');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('creates result datagrid', function() {

    var data = sampleData[0];

    $.mockjax({
      url: '*',
      responseText: { data: data },
      responseTime: [250, 750]
    });

    var $el = this.elems.first();
    $el.bs_combogrid();
    $el.triggerEnter();

    window.setTimeout(function() {
      var $container = $el.next();
      var $tableBody = $container.find('table').find('tbody');

      equal($tableBody.length, 1, 'container should have a table of results');

      for(var i in data) {
        var $row = $tableBody.find('tr').eq(i);
        equal(data[i].console, $row.find('td').eq(0).text(), 'content of first column at row ' + i + ' should match');
        equal(data[i].title, $row.find('td').eq(1).text(), 'content of second column at row ' + i + ' should match');
      }
      start();
    }, 1000);
  });

  /***********************************************/
  asyncTest('can set ajax config as plugin config item', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 5 },
      responseTime: [10, 20]
    });
    sinon.spy($, 'ajax');

    var ajaxConfig = {
      url: 'this/is/data/url',
      method: 'POST',
      data: {
        somedata: 'somevalue'
      }
    };

    var $el = this.elems.first();
    $el.bs_combogrid({
      ajax: ajaxConfig
    });
    $el.triggerEnter();

    setTimeout(function() {
      var ajaxData = $.ajax.getCall(0).args[0];
      equal(ajaxData.url, ajaxConfig.url, 'ajax should have been called with url = \'' + ajaxConfig.url +'\'');
      equal(ajaxData.method, ajaxConfig.method, 'ajax should have been called with method = \'' + ajaxConfig.method +'\'');
      equal(ajaxData.data.somedata, ajaxConfig.data.somedata, 'ajax should have been called with extra data');
      $.ajax.restore();
      start();
    }, 21);
  });

  /***********************************************/
  test('can set the default number of items per page as config', function() {
    sinon.spy($, 'ajax');

    var $el = this.elems.first();

    $el.bs_combogrid({
      length: 123
    });
    $el.triggerEnter();

    equal($.ajax.getCall(0).args[0].data.length, 123, 'the \'length\' config value should have been sent to the server');

    $.ajax.restore();
  });

  /***********************************************/
  asyncTest('creates paginator when server returns \'recordsTotal\' > \'data\'', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 27 },
      responseTime: [100, 200]
    });

    var $el = this.elems.first();

    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    setTimeout(function() {
      var $container = $('#qunit-fixture').find('#' + $el.attr('id') + '-cg-container');
      var $paginator = $container.find('nav .pagination');

      ok($paginator.length, 'container should have paginator');

      var $paginatorItems = $paginator.find('li');
      equal($paginatorItems.length, 5, 'paginator should have 5 items');
      ok($paginatorItems.eq(0).hasClass('pFirst'), 'first paginator item should have class \'pFirst\'');
      ok($paginatorItems.eq(1).hasClass('pPrev'), 'second paginator item should have class \'pPrev\'');
      ok($paginatorItems.eq(3).hasClass('pNext'), 'last but one paginator item should have class \'pNext\'');
      ok($paginatorItems.eq(4).hasClass('pLast'), 'last paginator item should have class \'pLast\'');

      var $paginatorCounter = $paginatorItems.find('span');
      ok($paginatorCounter.hasClass('pagerCounter'), 'third paginator item should have an span with class \'pagerCounter\'');
      equal($paginatorCounter.text(), '1/6', 'paginator counter should show \'currentPage/totalPages\'');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('don\'t create paginator when server returns \'recordsTotal\' <= \'data\'', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 5 },
      responseTime: [100, 200]
    });

    var $el = this.elems.first();

    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    setTimeout(function() {
      var $container = $('#qunit-fixture').find('#' + $el.attr('id') + '-cg-container');
      var $paginator = $container.find('nav .pagination');

      ok( ! $paginator.length, 'container should not have a paginator');

      start();
    }, 250);
  });

  /***********************************************/
  asyncTest('pagination links send correct start number to server', function() {
    // Create results with pagination
    $.mockjax([
      {
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 }, // 3 start numbers at 0, 5 and 10, because length will be 5.
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[2], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[1], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[2], recordsTotal: 12 },
        responseTime: [10, 20]
      }
    ]);
    var $el = this.elems.first();
    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    var spy = sinon.spy($, 'ajax');

    setTimeout(function() {
      var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
      $paginator.find('.pNext a').trigger('click');
      equal(spy.getCall(0).args[0].data.start, 5, 'Next link should send start = 5');
      setTimeout(function(){
        var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
        $paginator.find('.pLast a').trigger('click');
        equal(spy.getCall(1).args[0].data.start, 10, 'Last link should send start = 10');
        setTimeout(function(){
          var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
          $paginator.find('.pPrev a').trigger('click');
          equal(spy.getCall(2).args[0].data.start, 5, 'Previous link should send start = 5');
          setTimeout(function(){
            var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
            $paginator.find('.pFirst a').trigger('click');
            equal(spy.getCall(3).args[0].data.start, 0, 'First link should send start = 0');
            start();
            $.ajax.restore();
          }, 21);
        }, 21);
      }, 21);
    }, 21);
  });

  /***********************************************/
  asyncTest('paginator shows correct pagination info', function() {
    // Create results with pagination
    $.mockjax([
      {
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 }, // 3 start numbers at 0, 5 and 10, because length will be 5.
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[2], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[1], recordsTotal: 12 },
        responseTime: [10, 20]
      }, {
        url: '*',
        responseText: { data: sampleData[2], recordsTotal: 12 },
        responseTime: [10, 20]
      }
    ]);
    var $el = this.elems.first();
    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    setTimeout(function() {
      var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
      equal($paginator.find('.pagerCounter').text(), '1/3', 'Paginator counter should show \'1/3\'');
      $paginator.find('.pNext a').trigger('click');
      setTimeout(function(){
        var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
        equal($paginator.find('.pagerCounter').text(), '2/3', 'Paginator counter should show \'2/3\'');
        $paginator.find('.pLast a').trigger('click');
        setTimeout(function(){
          var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
          equal($paginator.find('.pagerCounter').text(), '3/3', 'Paginator counter should show \'3/3\'');
          $paginator.find('.pPrev a').trigger('click');
          setTimeout(function(){
            var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
            equal($paginator.find('.pagerCounter').text(), '2/3', 'Paginator counter should show \'2/3\'');
            $paginator.find('.pFirst a').trigger('click');
            setTimeout(function(){
              var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
              equal($paginator.find('.pagerCounter').text(), '1/3', 'Paginator counter should show \'1/3\'');
              start();
            }, 21);
          }, 21);
        }, 21);
      }, 21);
    }, 21);
  });

  /***********************************************/
  asyncTest('doesn\'t try to go to a page previous to the first one', function() {
    $.mockjax([
      {
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 },
        responseTime: [10, 20]
      }
    ]);

    var $el = this.elems.first();
    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    var spy = sinon.spy($, 'ajax');
    setTimeout(function() {
      var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
      $paginator.find('.pFirst a').trigger('click');
      equal(spy.callCount, 0, 'No ajax request should have been made.');
      ok($paginator.find('.pFirst').hasClass('disabled'), 'First paginator link should have \'disabled\' class');
      $paginator.find('.pPrev a').trigger('click');
      equal(spy.callCount, 0, 'No ajax request should have been made.');
      ok($paginator.find('.pPrev').hasClass('disabled'), 'Previous paginator link should have \'disabled\' class');
      start();
      $.ajax.restore();
    }, 25);
  });

  /***********************************************/
  asyncTest('doesn\'t go to page after last one', function() {
    $.mockjax([
      { // First page
        url: '*',
        responseText: { data: sampleData[0], recordsTotal: 12 },
        responseTime: [10, 20]
      }, { // Last page
        url: '*',
        responseText: { data: sampleData[3], recordsTotal: 12 },
        responseTime: [10, 20]
      }
    ]);

    var $el = this.elems.first();
    $el.bs_combogrid({ length: 5});
    $el.triggerEnter();

    var spy = sinon.spy($, 'ajax');

    setTimeout(function () {
      var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
      $paginator.find('.pLast a').trigger('click'); // Let's go to the last page before testing
      setTimeout(function() {
        var $paginator = $el.parent().find('#' + $el.attr('id') + '-cg-container').find('.pagination');
        $paginator.find('.pLast a').trigger('click');
        equal(spy.callCount, 1, 'No ajax request should have been made.');
        ok($paginator.find('.pLast').hasClass('disabled'), 'Last paginator link should have \'disabled\' class');
        $paginator.find('.pNext a').trigger('click');
        equal(spy.callCount, 1, 'No ajax request should have been made.');
        ok($paginator.find('.pNext').hasClass('disabled'), 'Next paginator link should have \'disabled\' class');
        start();
        $.ajax.restore();
      }, 25);
    }, 25);
  });

  /***********************************************/
  asyncTest('\'onItemSelect\' callback is called when an result item is selected', function() {
    expect(1);
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 5 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();

    $el.bs_combogrid({
      length: 5,
      onItemSelect: function() {
        ok(true, '\'onItemSelect\' callback should be called');
      }
    });
    $el.triggerEnter();

    setTimeout(function(){
      var $tds = $('#' + $el.attr('id') + '-cg-container').find('td');
      var $td = $tds.eq(Math.floor(Math.random() * $tds.length));
      $td.trigger('click');
      start();
    }, 21);
  });

  /***********************************************/
  asyncTest('by default \'onItemSelect\' should find a property on clicked row\'s data with the same name of the input and set input\'s value', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 5 },
      responseTime: [10, 20]
    });

    // We'll change our fixture here only for this testcase
    var $el = this.elems.first();
    $el.attr('name', 'console');

    $el.bs_combogrid();
    $el.triggerEnter();

    setTimeout(function(){
      var $td = $('#' + $el.attr('id') + '-cg-container').find('td:contains("Resident Evil")');
      $td.trigger('click');
      equal($el.val(), 'Playstation', 'Input should have value = \'Playstation\'');
      start();
    }, 21);
  });

  /***********************************************/
  asyncTest('Destroys combogrid if clicked outside of it', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 12 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();
    // We'll create a dummy div for testing
    var $dummy = $('<div />').text('Lorem ipsum dolor sit amet').insertAfter($el);

    $el.bs_combogrid();
    $el.triggerEnter();

    setTimeout(function () {
      $dummy.trigger('click');
      equal($el.parent().find('.cg-container').length, 0, 'There should not have any combogrid container');
      start();
    }, 25);
  });

  /***********************************************/
  asyncTest('Destroys combogrid if ESC is pressed', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 12 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();
    $el.bs_combogrid();
    $el.triggerEnter();

    setTimeout(function () {
      $el.triggerEsc();
      equal($el.parent().find('.cg-container').length, 0, 'There should not have any combogrid container');
      start();
    }, 25);
  });

  /***********************************************/
  asyncTest('User can configure fields titles as \'colModel\' config parameter', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 12 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();
    $el.bs_combogrid({
      colModel: {
        "title": "Game's title",
        "console": "Console's title"
      }
    });
    $el.triggerEnter();

    setTimeout(function () {
      var $table = $el.parent().find('.cg-container table');
      var $tHead = $table.find('thead');
      equal($tHead.length, 1, 'There should have a thead element in results table');
      equal($tHead.find('th').eq(0).text(), "Game's title", "First column's title should be 'Game's title'");
      equal($tHead.find('th').eq(1).text(), "Console's title", "Second column's title should be 'Console's title'");
      var $tBody = $table.find('tbody');
      equal($tBody.find('td').eq(0).text(), "Super Mario Bros", "First column's text should match table's title");
      equal($tBody.find('td').eq(1).text(), "Nintendo", "Second column's text should match table's title");
      start();
    }, 25);
  });

  /***********************************************/
  asyncTest('Can trigger search on clicking a specific button', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 12 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();
    // Create a button for testing
    $el.after('<button id="trigger-btn" />Click Me!</button>');
    $el.bs_combogrid({
      searchButton: '#trigger-btn'
    });
    var spy = sinon.spy($, 'ajax');

    $('#trigger-btn').trigger('click');

    setTimeout(function () {
      equal(spy.callCount, 1, 'An ajax request should have been made.');
      start();
    }, 25);
  });

  /***********************************************/
  asyncTest('User can define container width in options', function() {
    $.mockjax({
      url: '*',
      responseText: { data: sampleData[0], recordsTotal: 12 },
      responseTime: [10, 20]
    });

    var $el = this.elems.first();

    $el.bs_combogrid({
      containerWidth: '456px'
    });
    $el.triggerEnter();

    setTimeout(function() {
      var $container = $el.parent().find('.cg-container');
      equal($container.get(0).style.width, '456px', 'The container should have the expected dimension \'456\'.');
      start();
    }, 25);

  });

  /***********************************************/
  // HELPER FUNCTIONS
  $.fn.triggerEnter = function() {
    var e = $.Event('keypress');
    e.which = 13; // Enter
    e.keyCode = 13;
    return this.each(function() {
      $(this).trigger(e);
    });
  };

  $.fn.triggerEsc = function() {
    var e = $.Event('keypress');
    e.which = 27; // Enter
    e.keyCode = 27;
    return this.each(function() {
      $(this).trigger(e);
    });
  };

  sampleData = [
    [
      { console: 'Nintendo', title: 'Super Mario Bros' },
      { console: 'Master System', title: 'Alex Kidd' },
      { console: 'Mega Drive', title: 'Sonic the Hedgehog' },
      { console: 'SNES', title: 'Super Mario World' },
      { console: 'Playstation', title: 'Resident Evil' }
    ], [
      { console: 'PC', title: 'Doom' },
      { console: 'Atari', title: 'Enduro' },
      { console: 'N64', title: 'Mario Party' },
      { console: 'Playstation 2', title: 'GTA San Andreas' },
      { console: 'GameCube', title: 'Metroid' }
    ], [
      { console: 'Playstation 3', title: 'Uncharted' },
      { console: 'Playstation 4', title: 'The Last of Us Remastered' }
    ]
  ];

}(jQuery));
