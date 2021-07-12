const { checkUUID, accessLogger } = require("../middleware");
const controller = require("../controllers/video.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/v2/video/all', [accessLogger.log], controller.get_all_videos);
    app.get('/v2/video/file/:uuid', [accessLogger.log], controller.get_file);
    app.get('/v1/file/:device/:uuid', [accessLogger.log], controller.get_file);
    app.get('/v2/video/thumbnail/:uuid', [accessLogger.log], controller.get_thumbnail);
    app.get('/v2/video/:uuid', [accessLogger.log], controller.get_video_by_uuid);
    app.get('/v2/video/:offset/:limit', [accessLogger.log], controller.get_videos);
    app.put('/v2/video', [accessLogger.log, checkUUID.validateVideoUUID], controller.update_video_by_uuid);
    app.post('/v2/video', [accessLogger.log, checkUUID.validateVideoUUID], controller.save_video);
    app.delete('/v2/video/:uuid', [accessLogger.log], controller.delete_video_by_uuid);
};
