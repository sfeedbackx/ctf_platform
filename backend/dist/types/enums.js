export var instanceState;
(function (instanceState) {
    instanceState["RUNNING"] = "RUNNING";
    instanceState["STOPPED"] = "STOPPED";
    instanceState["PENDING"] = "PENDING";
    instanceState["FAILED"] = "FAILED";
    instanceState["TERMINATED"] = "TERMINATED";
})(instanceState || (instanceState = {}));
export var serviceType;
(function (serviceType) {
    serviceType["FRONTEND"] = "FRONTEND";
    serviceType["BACKEND"] = "BACKEND";
    serviceType["DB"] = "DB";
})(serviceType || (serviceType = {}));
//# sourceMappingURL=enums.js.map