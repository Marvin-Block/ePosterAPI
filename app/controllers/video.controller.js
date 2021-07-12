//todo: fix noinspection JSUnresolvedVariable und typedef
const db = require("../models");
// noinspection JSUnresolvedVariable
const Video = db.video;
// noinspection JSUnresolvedVariable
const { QueryTypes } = require('sequelize');
const Link = db.link;
const linkController = require("../controllers/link.controller");
const fileModule = require("../modules/file.module");

Video.hasMany(Link, {foreignKey:'videoUUID', as:'link', sourceKey:'videoUUID'});

//todo check if it actually works.
exports.get_file = (req, res) => {
    Video.findOne({
        where: {
            videoUUID: req.params.uuid.endsWith('.mp4') ? req.params.uuid.slice(0,-4) : req.params.uuid
        }
    }).then(video => {
        if (!video){
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`})
        }
        return res.status(200).sendFile(video.path);
        //res.status(200).sendFile(__apiRoot + '/videos/' +video.videoUUID + '.mp4');
    });
}

//todo check if it actually works.
exports.get_thumbnail = (req, res) => {
    Video.findOne({
        where: {
            videoUUID: req.params.uuid
        }
    }).then(video => {
        if (!video){
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`})
        }
        return res.status(200).sendFile(video.path.replace('videos','thumbnails').replace('mp4','jpg'));
        //return res.status(200).sendFile(__apiRoot + '/thumbnails/' +video.videoUUID + '.jpg');
    });
}

exports.get_video_by_uuid = (req, res) => {
    Video.findOne({
        include:[{model:Link, as:'link'}],
        where: {
            videoUUID: req.params.uuid
        }
    }).then(video => {
        if (!video){
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`})
        }
        res.status(200).send({data:video});
    })
}

exports.get_videos = (req, res) => {
    Video.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']],
        offset: parseInt(req.params.offset),
        limit: parseInt(req.params.limit)
    }).then(video => {
        res.status(200).send({data:video})
    })
}

exports.get_all_videos_ws = (ws) => {
    // Video.sequelize.query('SELECT * FROM `videos`', {type: QueryTypes.SELECT}).then( video => {
    //     video.type = 'video'
    //     ws.send(JSON.stringify(video))
    // })

    Video.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']]
    }).then(video => {
        video.type = 'video'
        ws.send(JSON.stringify(video))
    })
}

exports.get_all_videos = (req, res) => {
    Video.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']]
    }).then(video => {
        res.status(200).send({data:video})
    })
}

exports.save_video = (req, res) => {
    if(!req.files) {
        return res.status(400).send({ message: "Kein Dateianhang"});
    }

    // noinspection JSUnresolvedVariable
    let file = req.files.uploadedFile;
    // ['misc','videos'].map(x=>{return req.body.hasOwnProperty(x)}).includes(false)
    if(!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
        return res.status(400).send({ message: "Der Anhang muss ein Video oder ein Bild sein."})
    }

    Video.findOne({
        where: {
            md5: file.md5
        }
    }).then( async (video) => {
        if(video){
            return res.status(400).send({message:"Datei ist bereits Vorhanden."});
        }

        if(file.mimetype.startsWith('image')){
            const fileResult = await fileModule.imageToVideo(file, req.body)
            if(fileResult.status !== 200) return res.status(fileResult.status).send({message: fileResult.message, data: fileResult.data});
        }
        else {
            fileModule.saveVideo(file,req.body);
        }
        if(!req.body.rotation || req.body.rotation === 'null' || req.body.rotation === 0) req.body.rotation = null
        if(!req.body.category || req.body.category === 'null' || req.body.category === 0) req.body.category = null
        Video.create({
            videoUUID: req.body.videoUUID,
            name: req.body.name,
            category: req.body.category,
            path: `${__apiRoot}/videos/${req.body.videoUUID}.mp4`,
            size: file.size,
            width: req.body.width,
            height: req.body.height,
            md5: file.md5,
            calendarWeek: req.body.calendarWeek,
            orientation_V2: req.body.orientation ?? req.body.orientation_V2,
            rotation: req.body.rotation
        }).then(()=>{
            res.status(200).send({message:"Video wurde Erfolgreich hochgeladen"});
        }).catch(error => {
            res.status(500).send({message:"Es ist ein Fehler aufgetreten", error:error})
        })
    })
}

exports.update_video_by_uuid = (req, res) => {
    Video.findOne({
        where: {
            videoUUID: req.body.videoUUID
        }
    }).then(video => {
        if(!video){
            return res.status(404).send({message: `Für diese ID (${req.body.videoUUID}) konnten keine Daten gefunden werden.`})
        }
        if(!req.body.rotation || req.body.rotation === 'null' || req.body.rotation === 0) req.body.rotation = null
        if(!req.body.category || req.body.category === 'null' || req.body.category === 0) req.body.category = null
        video.update({
            name: req.body.name ?? video.name,
            category: req.body.category,
            calendarWeek: req.body.calendarWeek,
            orientation_V2: req.body.orientation ?? req.body.orientation_V2 ?? video.orientation_V2,
            rotation: req.body.rotation
        }).then(updatedVideo => {
            return res.status(200).send({message: "Video wurde erfolgreich angepasst.",data:updatedVideo})
        })
    })
}

exports.delete_video_by_uuid = (req, res) => {
    Video.findOne({
        where: {
            videoUUID: req.params.uuid
        }
    }).then(video => {
        if(!video)
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`});
        video.destroy().then(destroyedVideo => {
            fileModule.removeFile(req.params.uuid);
            let removedLinks = linkController.bulk_delete_links('video',req.params.uuid);
            res.status(200).send({message: "Eintrag erfolgreich gelöscht.", deviceData:destroyedVideo, linkData:removedLinks});
        });
    });
}
