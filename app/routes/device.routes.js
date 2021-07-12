const { checkUUID, accessLogger } = require("../middleware");
const controller = require("../controllers/device.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get('/v2/device/all',[accessLogger.log], controller.get_all_devices);
    app.get('/v2/device/:uuid', [accessLogger.log], controller.get_device_by_uuid);
    app.get('/v2/device/:offset/:limit', [accessLogger.log], controller.get_devices);
    app.put('/v2/device', [accessLogger.log, checkUUID.validateDeviceUUID], controller.update_device_by_uuid);
    app.delete('/v2/device/:uuid', [accessLogger.log], controller.delete_device_by_uuid);
    app.post('/v2/device', [accessLogger.log, checkUUID.validateDeviceUUID], controller.post_device);
    app.post('/v1/device', [accessLogger.log, checkUUID.validateDeviceUUID], controller.post_device);
};
