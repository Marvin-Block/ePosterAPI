const deviceController = require("../controllers/device.controller");
const videoController = require("../controllers/video.controller");
const linkController = require("../controllers/link.controller");
module.exports = function(wss) {
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(data) {
            switch (data) {
                case 'device':
                    deviceController.get_all_devices_ws(ws)
                    break;
                case 'video':
                    videoController.get_all_videos_ws(ws)
                    break;
                case 'link':
                    linkController.get_all_links_ws(ws)
                    break;
                default:
                    // default
            }
        })
    })
};
