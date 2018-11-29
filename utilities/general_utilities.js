'use strict';

const validateParams = function (req, required_params) {
    console.log(req.body);
    for (var idx = 0; idx < required_params.length; idx++) {
        if (!(required_params[idx] in req.body)) {
            return false;
        }
    }
    return true;
}

module.exports.validateParams = validateParams;
