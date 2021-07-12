//todo: fix noinspection JSUnresolvedVariable und typedef
const _ = require("lodash");
const db = require("../models");
const { QueryTypes } = require('sequelize');
const ad = require("../modules/ad.module");
const linkController = require("../controllers/link.controller");

// noinspection JSUnresolvedVariable
const Link = db.link;
// noinspection JSUnresolvedVariable
const Device = db.device;

Device.hasMany(Link, {foreignKey:'deviceUUID', as:'link', sourceKey:'deviceUUID'});

const Op = db.Sequelize.Op;

/**
 * @param stringOrArray - Entweder ein String im Format eines Arrays, oder ein Array mit Videos vom Raspberry.
 * @returns {string[]} - Array mit UUIDs
 */
function formatRaspberryVideoList(stringOrArray){
    if(typeof stringOrArray === 'string')
        if(stringOrArray.length > 1)
            // Konvertiere String im Array Format zu einem Array.
            // slice(1,-1) -> Entferne erstes und letztes Zeichen, in dem Fall "[" und "]".
            // replace(/[0-9]{1,3}_|.mp4/g, '') -> Entferne alle Vorkomnisse von "3 Zahlen, zwischen 0 bis 9, gefolgt von einem _" und ".mp4".
            // split(',') -> Teile den String an jedem Komma. Gibt einen Array mit Strings zurück.
            stringOrArray = stringOrArray.slice(1,-1).replace(/[0-9]{1,3}_|.mp4/g, '').split(',');
        else
            //Wenn deviceContent ein leerer String ist, wird der Variable ein leerer Array zugewiesen.
            stringOrArray = [];
    else
        //iteratives entfernen aller Vorkomnisse von "3 Zahlen, zwischen 0 bis 9, gefolgt von einem _" und ".mp4".
        stringOrArray.forEach((videoUUID, index) => stringOrArray[index] = videoUUID.replace(/[0-9]{1,3}_|.mp4/g, ''));
    return stringOrArray;
}

function newEntry(requestData){
    return new Promise( async resolve => {
        /**
         * @typedef FilInfo
         * @type {{Data: {FilNr:String, Description:String}, Valid: boolean}}
         */
        const FilInfo = await ad.resolveFil(requestData.misc.ip);
        let temp = requestData.misc.temp ?? "00.0'C";
        let width = requestData.misc.screenDim.width ?? '0000';
        let height = requestData.misc.screenDim.height ?? '0000';
        Device.create({
            deviceUUID: requestData.uuid,
            filNr: FilInfo.Data.FilNr,
            location: FilInfo.Data.FilNr + ' - ' + FilInfo.Data.Description,
            lastRequest: new Date().valueOf(),
            temp: temp.slice(0,2),
            type: width === '0000' ? null : height > width ? 'ePoster' : 'Fernseher',
            orientation: width === '0000' ? null : height > width ? 'Hoch' : 'Breit',
            width: typeof width === 'number' ? width : 0,
            height: typeof height === 'number' ? height : 0,
            freeDiskSpace: requestData.misc.fDisk ?? '00G',
            totalDiskSpace: requestData.misc.tDisk ?? '00G',
            ip: requestData.misc.ip
        }).then(createdDevice => {
            return resolve({message:"Neuer Eintrag wurde erstellt.", data:createdDevice});
        }).catch(err => {
            return resolve({message:"Error", data:err});
        });
    });
}

/**
 * @typedef req.body.videos
 * @type {array}
 */
function existingEntry(requestData, device){
    return new Promise(resolve => {
        let temp = requestData.misc.temp ?? device.temp;
        let width = requestData.misc.screenDim.width ?? device.width;
        let height = requestData.misc.screenDim.height ?? device.height;
        //Einträge in der Datenbank aktualisieren.
        device.update({
            temp: !isNaN(parseInt(temp)) ? temp.slice(0,2) : temp,
            width: typeof width === 'number' ? width : 0,
            height: typeof height === 'number' ? height : 0,
            freeDiskSpace: requestData.misc.fDisk || device.freeDiskSpace,
            totalDiskSpace: requestData.misc.tDisk ||device.totalDiskSpace,
            ip: requestData.misc.ip || device.ip,
            lastRequest: new Date().valueOf()
        }).then(updatedDevice => {
            //Einträge, welche zu der Geräte UUID gehören, auflisten.
            Link.findAndCountAll({
                order: [['ID', 'ASC']],
                where: {
                    deviceUUID:updatedDevice.deviceUUID,
                    active: 1,
                    start: {
                        [Op.lte]: new Date().valueOf()
                    },
                    end: {
                        [Op.gte]: new Date().valueOf()
                    }
                }
            }).then(links => {
                //links.rows -> Array
                //Element des Arrays -> Objekt (dataValues)
                //dataValues beinhaltet die benötigten Informationen
                let uuidDb = [];
                links.rows.forEach(obj => {uuidDb.push(obj.dataValues.videoUUID)});
                let uuidPi = formatRaspberryVideoList(requestData.videos);
                if(uuidPi[0] === '*') uuidPi = [];
                let missingOnDevice = _.difference(uuidDb, uuidPi);
                let removeFromDevice = _.difference(uuidPi, uuidDb);
                //todo add position to remove (?) or *
                return resolve({missingOnDevice, removeFromDevice})
            });
        });

    });


    //return console.log({message:"Bestehenden Eintrag updaten!", data:requestData});
}

exports.get_device_by_uuid = (req, res) => {
    Device.findOne({
        include:[{model:Link, as:'link'}],
        where: {
            deviceUUID: req.params.uuid
        }
    }).then(device => {
        if (!device)
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`})

        res.status(200).send({data:device});
    })
}

exports.get_devices = (req, res) => {
    Device.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']],
        offset: parseInt(req.params.offset),
        limit: parseInt(req.params.limit)
    }).then(device => {
        res.status(200).send({data:device})
    })
}

exports.get_all_devices_ws = (ws) => {
    // Device.sequelize.query('SELECT * FROM `devices`', {type: QueryTypes.SELECT}).then( device => {
    //     device.type = 'device'
    //     ws.send(JSON.stringify(device))
    // })

    Device.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']]
    }).then(device => {
        device.type = 'device'
        ws.send(JSON.stringify(device))
    })
}

exports.get_all_devices = (req, res) => {
    Device.findAndCountAll({
        include:[{model:Link, as:'link'}],
        order: [['ID', 'DESC']]
    }).then(device => {
        res.status(200).send({data:device})
    })
}

exports.update_device_by_uuid = (req, res) => {
    const deviceUUID = !req.body.uuid ? req.body.deviceUUID : req.body.uuid
    Device.findOne({
        where: {
            deviceUUID: deviceUUID
        }
    }).then(device => {
        if(!device)
            return res.status(404).send({message: `Für diese ID (${deviceUUID}) konnten keine Daten gefunden werden.`})
        if(!req.body.rotation || req.body.rotation === 'null') req.body.rotation = null
        device.update({
            filNr: req.body.filNr ?? device.filNr,
            location: req.body.location ?? device.location,
            description: req.body.description ?? device.description,
            type: req.body.type ?? device.type,
            orientation: req.body.orientation ?? device.orientation,
            rotation: req.body.rotation,
            temp: req.body.temp ?? device.temp,
            freeDiskSpace: req.body.freeDiskSpace ?? device.freeDiskSpace,
            totalDiskSpace: req.body.totalDiskSpace ?? device.totalDiskSpace,
            width: req.body.width ?? device.width,
            height: req.body.height ?? device.height,
            ip: req.body.ip ?? device.ip
        }).then(updatedDevice => {
            return res.status(200).send({message: "Das Gerät wurde erfolgreich angepasst.", data:updatedDevice})
        });
    })
}

exports.delete_device_by_uuid = (req, res) => {
    Device.findOne({
        where: {
            deviceUUID: req.params.uuid
        }
    }).then(device => {
        if(!device)
            return res.status(404).send({message: `Für diese ID (${req.params.uuid}) konnten keine Daten gefunden werden.`});
        device.destroy().then(destroyedDevice => {
            let removedLinks = linkController.bulk_delete_links('device',req.params.uuid);
            res.status(200).send({message: "Eintrag erfolgreich gelöscht.", deviceData:destroyedDevice, linkData:removedLinks});
        });
    });
}

/**
 * @typedef req.body.misc
 * @type {{temp:string, tDisk:string, fDisk:string, ip:string, screenDim:{width:string, height:string}}}
 */
exports.post_device = async (req, res) => {
    //Falls eins der Felder, die im Array Deklariert wurden, fehlt, wird abgebrochen, da nicht alle benötigten Daten gegeben wurden.
    if(['misc','videos'].map(x=>{return req.body.hasOwnProperty(x)}).includes(false) || ['ip', 'screenDim'].map(x=>{return req.body.misc.hasOwnProperty(x)}).includes(false))
        return res.status(400).send({message:"Es Fehlen Wichtige Felder."});

    // APIv1 -> uuid
    // APIv2 -> deviceUUID
    const deviceUUID = !req.body.uuid ? req.body.deviceUUID : req.body.uuid;

    Device.findOne({
        where:{
            deviceUUID: deviceUUID
        }
    }).then(async device => {
        if(!device){
            await newEntry(req.body);
            res.status(200).send();
        }
        else{
            let changeList =  await existingEntry(req.body, device);
            res.status(200).send({
                "status": "UPDATE",
                "add": changeList.missingOnDevice,
                "remove": changeList.removeFromDevice
            });
        }
    });
};
