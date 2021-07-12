const { checkUUID, accessLogger} = require("../middleware");
const controller = require("../controllers/link.controller");

module.exports = function(app) {
    app.use(function(req, res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get('/v2/link/all', [accessLogger.log], controller.get_all_links);
    app.get('/v2/link/:uuid', [accessLogger.log], controller.get_link_by_uuid);
    app.get('/v2/link/:offset/:limit', [accessLogger.log], controller.get_links);
    app.put('/v2/link', [accessLogger.log, checkUUID.validateLinkUUID], controller.update_link_by_uuid);
    app.delete('/v2/link/bulk', [accessLogger.log], controller.delete_from_device);
    app.delete('/v2/link/:uuid', [accessLogger.log], controller.delete_link_by_uuid);
    app.post('/v2/link', [accessLogger.log], controller.save_link);
};
