﻿﻿module.exports.SUPPLY_CHAIN_ACTORS = {
    regulator: 'regulator',
    manufacturer: 'manufacturer',
    distributor: 'distributor',
    wholesaler: 'wholesaler',
    retailer: 'retailer',
    consumer: 'consumer',
    admin: 'admin'
};

﻿module.exports.DEFAULT_USER = {
    userId: 'admin',
    userSecret: 'adminpw',
    userType: 'admin'
};

// http status codes
module.exports.HTTP_STATUS_CODES = {
    STATUS_SUCCESS: 200,
    STATUS_CLIENT_ERROR: 400,
    STATUS_SERVER_ERROR: 500
}

//  application specific errors
module.exports.APP_CODES = {
    SUCCESS: 0,
    DRUG_NOT_FOUND: 1001,
    DRUG_NOT_CREATED: 1002,
    DRUG_NOT_SHIPPED: 1003,
    DRUG_NOT_RECEIVED: 1004,
    DRUG_NOT_SOLD: 1005,
    USER_NOT_ENROLLED: 1006,
    USER_NOT_FOUND: 1007,
    USER_NOT_REGISTERED: 1008,
    INVALID_USER_HEADER: 1009
}

//  smart contract errors
module.exports.SMART_CONTRACT_CODES = {
    DUPLICATE_DRUG_ID: 101,
    DRUG_ID_NOT_FOUND: 102
}

//  smart contract events
module.exports.SMART_CONTRACT_EVENTS = {
    EVENT_TYPE: 'bcpocevent'
}