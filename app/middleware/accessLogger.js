const controller = require("../controllers/log.controller");

log = (req, res, next) => {
    let logData = {Params: req.params, Body: req.body, Route: req.route.path, Method:req.route.methods, IP: req.connection.remoteAddress};
    controller.write_log(logData);
    next();
}

const accessLogger = {
    log: log
};

module.exports = accessLogger;
