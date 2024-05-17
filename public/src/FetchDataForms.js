/**
 * FetchDataForms.js
 *
 * Instantly turn html form elements into asynchronous fetch forms by adding an attribute.
 * 
 * @author Nick Adams
 * @see {@link https://github.com/nickolasjadams/fetch-data-forms|Repository}
 * @license MIT
 * @version 1.0.0
 */

class FetchDataForms {
    
    constructor(options) {
        this.selector = "form[data-fetch]";
        this.submitDisabledDuration = 1500;
        this.recaptcha = {
            version: "v3"
        };
        this.onDone = "";
        this.onFail = "";
        this.onAlways = "";
        this.onBeforeSend = "";
        if (options) {
            if (options.selector) {
                this.selector = options.selector;
            }
            if (options.submitDisabledDuration) {
                this.submitDisabledDuration = options.submitDisabledDuration;
            }
            if (options.recaptcha) {
                this.recaptcha = { ...this.recaptcha, ...options.recaptcha };
                if (parseInt(this.recaptcha.version)) {
                    this.recaptcha.version = "v" + this.recaptcha.version;
                } else {
                    this.recaptcha.version = this.recaptcha.version.toLowerCase();
                }
                if (this.recaptcha.version !== "v3") {
                    console.warn("Only reCAPTCHA v3 is supported at this time.");
                }
                if (!this.recaptcha.siteKey) {
                    console.warn("reCAPTCHA siteKey must be set.")
                }

            }
        }
        this.forms = document.querySelectorAll(this.selector);
        this.addFormEventListeners();
    }

    addFormEventListeners() {
        let _this = this;
        this.forms.forEach(function (form) {
            form.addEventListener("submit", function(e) {
                e.preventDefault();

                let form, data, submitter;
                [form, data, submitter] = _this.prepFormData(this, e);

                console.log(data);

                if (form.dataset['fetchRecaptcha'] === '') {
                    if (typeof window['grecaptcha'] === "undefined") {
                        console.warn("reCAPTCHA objects couldn't be found. Have the scripts been loaded?");
                    } else {
                        window['grecaptcha'].ready(function() {
                            window['grecaptcha'].execute(_this.recaptcha.siteKey, {action: 'submit'}).then(function(token) {
                                data['recaptcha_token'] = token;
                                _this.sendXhrRequest(form, data, submitter);
                            });
                        });
                    }
                } else {
                    _this.sendXhrRequest(form, data, submitter);
                }

            }, false)
        })
    }

    prepFormData(form, submissionEvent) {
        this.onDone = window[form.getAttribute('data-fetch-done')];
        this.onFail = window[form.getAttribute('data-fetch-fail')];
        this.onAlways = window[form.getAttribute('data-fetch-always')];
        this.onBeforeSend = window[form.getAttribute('data-fetch-before-send')];
        let submitter = submissionEvent.submitter;
        let formData = new FormData(form, submitter);
        if (submitter) {
            submitter.disabled = "disabled";
        }

        let data = {};
        for (const [key, value] of formData) {
            let formElements = document.querySelectorAll("[name='" + key + "']");
            if (formElements.length > 1) { // multiple elements with the same 'name' attribute
                let isSubmissionElement = (formElements[0].tagName === "INPUT" && formElements[0].type === "submit") || (formElements[0].tagName === "BUTTON" && formElements[0].type !== "button");
                let isRadioElement = formElements[0].tagName === "INPUT" && formElements[0].type === "radio";
                if (isSubmissionElement) { // Make scalar because only one element can submit the form
                    data[key] = formData.get(key)
                } else if (isRadioElement) { // Make scalar because only one item is selected
                    data[key] = formData.get(key)
                } else { // Make an array because this is assumed to be checkboxes
                    data[key] = formData.getAll(key)
                }
            } else {
                let isMultipleSelect = formElements[0].tagName === "SELECT" && formElements[0].attributes["multiple"]
                let isMultipleFiles = formElements[0].tagName === "INPUT" && formElements[0].type === "file" && formElements[0].attributes["multiple"]
                if (isMultipleSelect || isMultipleFiles) { // Make an array because multiple values are assumed available
                    data[key] = formData.getAll(key)
                } else {
                    data[key] = formData.get(key)
                }
            }
        }
        let rData = new FormData();
        Object.entries(data).forEach(([key, value]) => {

            // arrays
            if (Array.isArray(value)) {
                console.log("An array was submitted with this request.")
                value.forEach(item => {
                    rData.append(key, item);
                    // console.log(item);
                })
            } else {
                // everything else
                rData.append(key, value);
                // console.log(value);
            }

            // this.printFormData(rData);
        });
        return [ form, rData, submitter ];
    }

    sendXhrRequest(form, data, submitter) {
        let _this = this;
        console.table(data);

        let fetchOptions = {
            method: form.method
        }

        if (form.method.toUpperCase() === "GET") {
            const params = new URLSearchParams();
            for (const pair of data.entries()) {
                params.append(pair[0], pair[1]);
            }
            form.action += (form.action.includes('?') ? '&' : '?') + params.toString();
        } else { // POST
            fetchOptions.body = data;
        }
    
        if (submitter) {
            setTimeout(() => {
                submitter.removeAttribute("disabled");
            }, _this.submitDisabledDuration);
            if (typeof _this.onBeforeSend === "function") _this.onBeforeSend();
        }
    
        fetch(form.action, fetchOptions)
            .then(async response => {
                let responseData;
                if (response.ok) {
                    responseData = await response.json();
                    form.reset();
                    document.querySelectorAll("[data-fetch-errors]").forEach(element => {
                        element.innerHTML = "";
                    });
                    if (typeof _this.onDone === "function") _this.onDone(responseData);
                    if (form.id) {
                        let id = form.id.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, '-').toLowerCase();
                        form.dispatchEvent(new CustomEvent(id + "-submit", { detail: responseData }));
                    }
                } else {
                    responseData = await response.json();
                    let errors = responseData.errors || responseData.responseJSON?.errors;
                    form.querySelectorAll("[data-fetch-errors]").forEach(errorElement => {
                        errorElement.innerHTML = "";
                    });
                    if (errors) {
                        Object.entries(errors).forEach(([key, value]) => {
                            let messages = value['messages'];
                            let errorElement = form.querySelector(`[data-fetch-errors="${key}"]`);
                            if (errorElement) {
                                messages.forEach(message => {
                                    errorElement.insertAdjacentHTML("afterbegin", `<div>${message}</div>`);
                                });
                            }
                        });
                    }
                    if (typeof _this.onFail === "function") _this.onFail(responseData);
                }
                return responseData;
            })
            .then(data => {
                console.log(data);
                if (typeof _this.onAlways === "function") _this.onAlways(data);
            })
            .catch(error => {
                if (typeof _this.onFail === "function") _this.onFail(error);
            });
            
    }

    printFormData(formData) {
        for (var pair of formData.entries()) {
            if (typeof(pair[1]) === "object") {
                console.log(pair[0]);
                console.log(pair[1])
                console.log(JSON.stringify(pair[1], null, 4))
            } else {
                console.log(pair[0]+ ', ' + pair[1]);
            }
        }
    }

}