'use strict';

const validateParams = (req, required_params) => {
    for (let idx = 0; idx < required_params.length; idx++) {
        if (!(required_params[idx] in req.body)) {
            return false;
        }
    }
    return true;
}

module.exports.validateParams = validateParams;
