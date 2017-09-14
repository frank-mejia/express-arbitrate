'use strict';

const _ = require('lodash');

const isValidCustomObject = (value, type) => {
        return _.reduce(_.keys(type), (isValid, key) => {
            // convert to object
            const isValidValue = assertType(value[key], type[key]['type']);
            if (type[key]['required']) {
                if (!isValidValue) return false && isValid;
            } else {
                // field not required
                if (!isValidValue && !_.isUndefined(value[key])) return false && isValid;
            }
            return true && isValid;
        }, true);
};

const isValidArrayOf = (value, type) => {
    return _.reduce(value, (isValid, element) => {
        console.log(element);
        console.log(type);
        return isValid && assertType(element, type);
    }, true);
};

const assertType = (value, type) => {
    if (type == Arbitrate.type.Integer) {
        return _.isInteger(_.toNumber(value));
    } else if (type == Arbitrate.type.Number) {
        return _.isNumber(_.toNumber(value));
    } else if (type == Arbitrate.type.String) {
        return _.isString(value);
    } else if (type == Arbitrate.type.Boolean) {
        return _.isBoolean(value);
    } else if (type == Arbitrate.type.Object) {
        return _.isObject(value);
    } else if (type == Arbitrate.type.Array) {
        return _.isArray(value);
    } else if (_.isPlainObject(type)) {
        if (type['customType'] == 'CustomObject') {
            if (!_.isPlainObject(value)) {
                return false;
            }
            return isValidCustomObject(value, type['value']);
        } else if (type['customType'] == 'ArrayOf') {
            console.log('Asserting ArrayOf');
            if (!_.isArray(value)) {
                return false;
            }
            return isValidArrayOf(value, type['value']);
        }
    }
};

const getValueFromLocation = (req, location, name) => {
    if (location === Arbitrate.location.Body) {
        return req.body[name];
    } else if (location === Arbitrate.location.Query) {
        return req.query[name];
    } else if (location === Arbitrate.location.Params) {
        return req.params[name];
    } else if (location === Arbitrate.location.Any) {
        return req.query[name]
            || req.params[name]
            || req.body[name]
    }
};

const Arbitrate = {

    validateRequest: (rules) => {
        return (req, res, next) => {
            if (!_.isPlainObject(rules)) {
                throw new Error('validateRequest expects an object as a parameter');
            }

            const errors =_.reduce(_.keys(rules), (errors, ruleName) => {
                const ruleSpec = rules[ruleName];
                const value = getValueFromLocation(req, ruleSpec.location, ruleName);
                if (_.isUndefined(value)&&(ruleSpec.required)) {
                    errors.push({
                        message: `Required field "${ruleName}" was not specified`
                    });
                } else if (!_.isUndefined(value)) {
                    if (!assertType(value, ruleSpec.type)) {
                        errors.push({
                            message: `Invalid type of field: ${ruleName}`
                        });
                    }
                }
                return errors;
            },[]);

            if (!_.isEmpty(errors)) {
                return res.status(400).json(errors);
            }
            next();
        };
    },

    type: {
        Integer: 0,
        Number:  1,
        String:  2,
        Boolean: 3,
        Object:  4,
        Array:   5,
        UUID:    6,
        CustomObject: (value) => {return { value, customType: 'CustomObject'}},
        ArrayOf: (value) => {return { value, customType: 'ArrayOf'}},
    },

    location: {
        Body:   0,
        Query:  1,
        Params: 2,
        Any:    3
    }
};


module.exports = Arbitrate;