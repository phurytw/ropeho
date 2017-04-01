const jsdom = require("jsdom").jsdom;

global.document = jsdom("");
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === "undefined") {
        global[property] = document.defaultView[property];
    }
});

global.Blob = window.Blob;
global.File = window.File;
global.URL = window.URL;
global.Image = window.Image;

global.navigator = {
    userAgent: "node.js"
};
