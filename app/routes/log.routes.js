const { accessLogger } = require("../middleware");
const controller = require("../controllers/log.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/v2/log/all', [accessLogger.log], controller.get_all_logs);
    app.get('/v2/log/:offset/:limit', [accessLogger.log], controller.get_logs);
};
