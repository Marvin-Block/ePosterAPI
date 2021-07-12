const errText = "Bitte geben Sie eine UUID an."

validateVideoUUID = (req, res, next) => {
    if (!req.body.videoUUID)
        return res.status(400).send({message: errText});
    next();
}

validateLinkUUID = (req, res, next) => {
    if (!req.body.linkUUID)
        return res.status(400).send({message: errText});
    next();
}

validateDeviceUUID = (req, res, next) => {
    if (!req.body.deviceUUID)
        if(!req.body.uuid)
            return res.status(400).send({message: errText});
    next();
}


const checkUUID = {
    validateVideoUUID: validateVideoUUID,
    validateLinkUUID: validateLinkUUID,
    validateDeviceUUID: validateDeviceUUID
};

module.exports = checkUUID;
