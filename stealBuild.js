var stealTools = require("steal-tools");

stealTools.export({
    system: {
        config: "package.json!npm",
        main: "src/can-interrupt"
    },
    options: {
        sourceMaps: true
    },
    outputs: {
        "+cjs": {},
        "+amd": {},
        "+global-js": {}
    }
});