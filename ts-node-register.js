let project;
if (process.argv[2].includes("client")) {
    project = "tsconfig.client.json";
} else if (process.argv[2].includes("admin")) {
    project = "tsconfig.admin.json";
} else {
    project = "tsconfig.server.json";
}

require("ts-node").register({
    project,
    lazy: true,
    fast: true
});
