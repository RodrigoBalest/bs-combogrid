# Bootstrap Combogrid

JQuery Combogrid input for Twitter Bootstrap v4.x

> For use with Bootstrap v3.x, use the latest v1.x version of the plugin.

## Getting Started

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/bs-combogrid.min.js"></script>
<link rel="stylesheet" href="dist/jquery.bs-combogrid.min.css">
<script>
jQuery(function($) {
  $('input').bs_combogrid(options);
});
</script>
```

## Documentation
`options` is an object with the following keys:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | {Int} | 10 | Number of rows per page. |
| `emptyMessage` | {String} | 'No results were found' | Text shown when a search returns no results. |
| `ajax` | {Object} | `{}` | An settings object just like the one passed to [`$.ajax()`](http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings).<br />At least the `url` parameter is needed. |
| `searchButton` | {String\|boolean} | `false` | The CSS selector of the button that triggers the search, or `false` if no button is used.<br />Note that pressing <kbd>Enter</kbd> always submits the search, regardless of using a search button or not. |
| `onItemSelect` | {function} | See source code | A function that is run when the user selects one of the returned results, which only parameter is the selected row data.<br />By default, it searches in the selected row for a key:value pair whose key matches the input name and sets its value to the input. |
| `tableClass` | {String} | `mb-0 table-hover table-sm` | Extra classes added to the results table. |

## Examples

At the root folder, run `npm run demo`, browse to `https://localhost:8080` and try searching some videogame titles and consoles!
