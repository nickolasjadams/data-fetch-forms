# FetchDataForms

[![npm version](https://badge.fury.io/js/@stegopop%2Fajaxy-forms.svg)](https://badge.fury.io/js/@stegopop%2Fajax-tap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Instantly turn an HTML form element into an AJAX request just by adding an attribute.

## Dependencies

Requires jQuery's AJAX.

## Usage

Make your web apps feel snappier by converting server-side requests into AJAX requests.  

Instantiate FetchDataForms

```
new FetchDataForms();
```

Just add the `data-fetch` attribute to any form you'd like to convert.

```html
<form action="/url" method="POST" data-fetch>
   ...
</form>
```

## Install

With NPM

```markdown
npm install @stegopop/data-fetch-forms
```

With a CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@stegopop/data-fetch-forms"></script>
```

## Options

Below are optional features that can be configured via an options object passed the the FetchDataForms constructor, or via data attributes.

### Selector

By default, any form with the `data-fetch` attribute will submit with FetchDataForms.

You may modify this with a css style selector in the options object.

```js
new FetchDataForms({
    select: "form.snap"
});
```

### reCAPTCHA

*Note: FetchDataForms only supports reCAPTCHA v3.*

Added Google reCAPTCHA to FetchDataForms is super simple. Just add a recaptcha object with a version and siteKey as in the options object.

```html
<script src="https://www.google.com/recaptcha/api.js?render=YourKeyHere11111111111111111111111111111"></script>
<script>
   new FetchDataForms({
      recaptcha: {
         version: "v3",
         siteKey: "YourKeyHere11111111111111111111111111111"
      },
   });
</script>
```

Then add the `data-fetch-recaptcha` attribute to any form you'd like to protect.

```html
<form action="/url" method="POST" data-fetch data-fetch-recaptcha>
    ...
</form>
```

*Note: This version of the Google reCAPTCHA is score-based. If you wanted to perform certain actions based on that score, 
then pass the `score` from Google's Site Verify Response. You can access that in the form submit event, or the `done`, `always`, or `fail` callbacks.* 

### Showing Errors

Displaying errors in form inputs requires you to specify where you'd like the error to show. 

Do that with the `data-fetch-errors` attribute.

```html
<form action="/url" method="POST" data-fetch>
   
    <label for="favorite_sandwich">
        <input type="text" name="favorite_sandwich" id="favorite_sandwich" required>
        <div data-fetch-errors="favorite_sandwich"></div>
    </label>
    
</form>
```

Then when the server finds an error, return a JSON message with this format for errors.

```json
{
    "errors": {
        "favorite_sandwich": {
            "messages": [
                "This is the 'favorite_sandwich' error message.",
                "There could multiple errors."
            ]
        }
    }
}
```

### Submission Events

If you assign your form an id, then an event will be dispatched whenever your form is submitted.

Whatever casing you use for your form id will be converted to kebab-casing for the event name. 

*Example: `<form id="testForm">` requires listening like this `addEventListener("test-form-submit", function() { ... })`*

```html
<form id="snap-example" action="/url" method="POST" data-fetch>
    ...
</form>

<script>
    document.querySelector("#snap-example").addEventListener("snap-example-submit", function(data) {
        console.log("Recieved an event");
    });
</script>
```

### Callbacks

Another way to call code after a submission is with the AJAX callback attributes.

- done
- fail
- always
- beforeSend

Pass the name of a JavaScript function to the attribute.

```html
<form action="/url" method="POST" 
      data-fetch 
      data-fetch-done="doneCallbackExample"
      data-fetch-fail="failCallbackExample"
      data-fetch-always="alwaysCallbackExample"
      data-fetch-before-send="beforeSendCallbackExample">
    ...
</form>
```

Pass the return data to your done callback function by adding a data argument to your function.

```js
function doneCallbackExample(data) {
    ...
}

function failCallbackExample(data) {
    ...
}

function alwaysCallbackExample(data) {
    ...
}

function beforeSendCallbackExample() {
    ...
}
```

### Disable Submit Button Duration

By default, the submission button for your form will be disabled for 1.5 seconds after submission to prevent multiple submissions.

You modify this disabled duration by setting `submitDisabledDuration` in the options object passed to the FetchDataForms class.

```js
new FetchDataForms({
    submitDisabledDuration: 3000
});
```

Or you may disable it by setting the value to 0.

### Multiple Submit Buttons

You may add multiple submit buttons to your form. 

Adding a name and value to your buttons will allow you see which submitter was pressed from the backend.

Only the submitter element name and value will be submitted.

Just like the browser default, if you press enter in your form, the first submit element will be the one that submits the form.