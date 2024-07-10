const { config } = require("@swc/core/spack");

module.exports = config({
    entry: {
        web: __dirname + "/public/src/FetchDataForms.js",
    },
    output: {
        path: __dirname + "/public/dist",
        name: "fetch-data-forms.js"
    },
    module: {},
});