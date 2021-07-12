//todo: fix noinspection JSUnresolvedVariable und typedef
const db = require("../models");
// noinspection JSUnresolvedVariable
const Log = db.log;

exports.write_log = (data) => {
    Log.create({
        route: JSON.stringify(data.Route),
        method: JSON.stringify(data.Method),
        params: JSON.stringify(data.Params),
        body: JSON.stringify(data.Body),
        ip: JSON.stringify(data.IP)
    });
}

exports.get_logs = (req, res) => {
    Log.findAndCountAll({
        order: [['ID', 'DESC']],
        offset: parseInt(req.params.offset),
        limit: parseInt(req.params.limit)
    }).then(log => {
        res.status(200).send({data:log})
    })
}

exports.get_all_logs = (req, res) => {
    Log.findAndCountAll({
        order: [['ID', 'DESC']]
    }).then(log => {
        res.status(200).send({data:log})
    })
}