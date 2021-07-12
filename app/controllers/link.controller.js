//todo: fix noinspection JSUnresolvedVariable und typedef
const _ = require("lodash");
const v4 = require('uuid').v4;
const { QueryTypes } = require('sequelize');
const db = require("../models");
// noinspection JSUnresolvedVariable
const Link = db.link;
// noinspection JSUnresolvedVariable
const Video = db.video;
// noinspection JSUnresolvedVariable
const Device = db.device;

const Op = db.Sequelize.Op;

Link.hasOne(Device, {foreignKey: 'deviceUUID', as:'device', sourceKey:'deviceUUID'});
Link.hasOne(Video, {foreignKey: 'videoUUID', as:'video', sourceKey:'videoUUID'});

exports.get_link_by_uuid = (req, res) => {
  Link.findOne({
      include:[{model:Device, as:'device'}, {model:Video, as:'video'}],
      where: {
        linkUUID: req.params.uuid
      }
  }).then(link => {
      if(!link)
          return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`})
      res.status(200).send({data:link});
  })
};

exports.get_links = (req, res) => {
    Link.findAndCountAll({
        include:[{model:Device, as:'device'}, {model:Video, as:'video'}],
        order: [['ID', 'DESC']],
        offset: parseInt(req.params.offset),
        limit: parseInt(req.params.limit)
    }).then(link => {
       res.status(200).send({data:link});
    });
};

exports.get_all_links_ws = (ws) => {
    // Link.sequelize.query('SELECT * FROM `links`', {type: QueryTypes.SELECT}).then( link => {
    //     link.type = 'link'
    //     ws.send(JSON.stringify(link))
    // })

    Link.findAndCountAll({
        include:[{model:Device, as:'device'}, {model:Video, as:'video'}],
        order: [['ID', 'DESC']]
    }).then(link => {
        link.type = 'link'
        ws.send(JSON.stringify(link));
    });
};

exports.get_all_links = (req, res) => {
    Link.findAndCountAll({
        include:[{model:Device, as:'device'}, {model:Video, as:'video'}],
        order: [['ID', 'DESC']]
    }).then(link => {
        res.status(200).send({data:link});
    });
};

exports.save_link = async (req, res) => {
    if(['content','devices','start','end','active'].map(x=>{return (req.body.hasOwnProperty(x) && req.body[x].length > 0) }).includes(false))
        return res.status(400).send({message:"Die Anfrage beinhaltet nicht alle erforderlichen Daten."});
    let videosToAdd = req.body.content.split(',');
    // noinspection JSUnresolvedVariable
    let devicesToAdd = req.body.devices.split(',');
    console.log(videosToAdd, devicesToAdd)
    let insertQuery = new Promise((resolve, reject) => {
        let bulkData = [];
        //Devices filtern falls uuids angegeben sind die nicht existieren.
        Device.findAll({where:{deviceUUID: devicesToAdd}}).then(device => {
            if(!device) reject('Keine Geräte gefunden')
            devicesToAdd = [];
            device.forEach(entry=> {
                devicesToAdd.push(entry.dataValues.deviceUUID);
            });
            //Videos filtern falls uuids angegeben werden die nich existieren.
            Video.findAll({where:{videoUUID: videosToAdd}}).then(video => {
                videosToAdd = [];
                video.forEach(entry => {
                    videosToAdd.push(entry.dataValues.videoUUID);
                });
                //iteriere über existierende deviceUUIDs | Für jedes Gerät den neuen Inhalt ermitteln
                devicesToAdd.forEach((givenDevice, index, array) => {
                    //Abfrage Links mit bekannter deviceUUID
                    Link.findAndCountAll({
                        where:{
                            deviceUUID:givenDevice
                        }
                    }).then(queryDevice => {
                        let content = videosToAdd;
                        let videoUUID = [];
                        //videoUUIDs der Links iterativ in videoUUID schreiben
                        queryDevice.rows.forEach(entry => {
                            videoUUID.push(entry.dataValues.videoUUID);
                        });
                        //Videos die dem Gerät bereits zugewiesen sind, raus streichen
                        let contentToAdd = _.difference(content, videoUUID);
                        //für jedes video iterativ einträge erzeugen und diese bulkData anhängen
                        contentToAdd.forEach(uuid => {
                            bulkData.push({
                                linkUUID: v4(),
                                deviceUUID: givenDevice,
                                videoUUID: uuid,
                                start: req.body.start ?? new Date().valueOf(),
                                end: req.body.end ?? new Date().addDays(7).valueOf(),
                                position: req.body.position ?? 999,
                                active: req.body.active ?? 0
                            });
                        })
                    }).finally( () => {
                        //wenn der Letzte eintrag angefügt wurde, Promise mit bulkData resovlen.
                        if(index === array.length -1)
                            return resolve(bulkData);
                    }).catch(err => {
                        // res.status(500).send({message:"Es ist ein Fehler eim Einfügen in die Datenbank aufgetreten", error:err.message});
                        return reject({message:"Es ist ein Fehler eim Einfügen in die Datenbank aufgetreten", error:err.message})
                    })
                });
            })
        })
    });

    insertQuery.then(
    /**
     * @param {object[]} bulkData - Array mit den anzupassenden Einträgen
     */
    (bulkData) => {
        //für jeden eintrag in bulkData einen eintrag in der Datenbank generieren. Anzahl und Erzeugte Einträge als Response.
        Link.bulkCreate(bulkData).then(result => {
            return res.status(200).send({message:`${result.length} Datensätze wurden eingefügt.`, data:result})
        }).catch(err =>{
            return res.status(500).send({message:"Es ist ein Fehler eim Einfügen in die Datenbank aufgetreten", error:err.message});
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).send({message:"Es ist ein Fehler eim Einfügen in die Datenbank aufgetreten", error:err.message});
    });
};

exports.update_link_by_uuid = (req, res) => {
    Link.findOne({
        where: {
            linkUUID: req.body.linkUUID
        }
    }).then(link => {
        if(!link)
            return res.status(404).send({message: `Für diese ID (${req.params.linkUUID}) konnten keine Daten gefunden werden.`})
        link.update({
            name: req.body.name ?? link.name,
            start: req.body.start ?? link.start,
            end: req.body.end ?? link.end,
            active: req.body.active ?? link.active,
            position: req.body.position ?? link.position
        }).then(updatedLink => {
            return res.status(200).send({message: "Link wurde erfolgreich angepasst.", data:updatedLink})
        })
    })
};

exports.delete_link_by_uuid = (req, res) => {
    Link.findOne({
        where: {
            linkUUID: req.params.uuid
        }
    }).then(link => {
        if(!link)
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`});
        link.destroy().then(destroyedLink => {
            res.status(200).send({message: "Eintrag erfolgreich gelöscht.", data:destroyedLink});
        });
    });
};

exports.bulk_delete_links = (type, uuid) => {
    Link.destroy(type === 'device' ? {where: {deviceUUID:uuid}} : {where: {videoUUID:uuid}}).then(destroyedLinks => {
        return {message: "Einträge erfolgreich gelöscht.", data:destroyedLinks};
    })
}

exports.delete_from_device = (req, res) => {
    let uuids = []
    try{
        uuids = JSON.parse(req.body.uuidList)
        Link.destroy({
            where: {
                linkUUID: {
                    [Op.or]: uuids
                }
            }
        }).then(deletedLinks => {
            if(!deletedLinks) {
                return res.status(400).send({message: `Für die angegebenen IDs konnten keine Einträge gefunden werden.`});
            } else {
                return res.status(200).send({message: deletedLinks + ' Einträge erfolgreich gelöscht.'});
            }
        })
    } catch (err) {
        return res.status(400).send({message: `Ungültiges Format.`, data: err});
    }
}

