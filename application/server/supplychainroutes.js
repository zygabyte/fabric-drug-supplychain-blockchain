/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
'use strict';
const express = require('express');
const utils = require('./utils');
const supplyChainRouter = express.Router();

// Bring key classes into scope, most importantly Fabric SDK network class
const Drug = require('../../contract/lib/drug');

// http status codes
const STATUS_SUCCESS = 200;
const STATUS_CLIENT_ERROR = 400;
const STATUS_SERVER_ERROR = 500;

//  USER Management Errors
const USER_NOT_ENROLLED = 1000;
const INVALID_HEADER = 1001;

//  application specific errors
const SUCCESS = 0;
const DRUG_NOT_FOUND = 2000;

async function getUsernamePassword(request) {
    // check for basic auth header
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return Promise.reject('Missing Authorization Header');  //  status 401
    }

    // get auth credentials
    const base64Credentials = request.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    //  At this point, username + password could be verified for auth -
    //  but NOT BEING VERIFIED here.  Username and password are
    //  verified with Fabric-Certificate-Authority at enroll-user time.
    //  Once enrolled,
    //  certificate is retrieved from CA and stored in local wallet.
    //  After that, password will not be used.  username will be used
    //  to pick up certificate from the local wallet.

    if (!username || !password) {
        return Promise.reject('Invalid Authentication Credentials');  //  status 401
    }

    // attach username and password to request object
    request.username = username;
    request.password = password;

    return request;
}

async function submitTx(request, txName, ...args) {
    try {
        //  check header; get username and pwd from request
        //  does NOT verify auth credentials - only checks for the existence of the user name and password
        await getUsernamePassword(request);
        return utils.setUserContext(request.username, request.password).then((contract) => {
            // Insert txName as args[0]
            args.unshift(txName);
            // Insert contract as args[0]
            args.unshift(contract);
            // .apply applies the list entries as parameters to the called function
            return utils.submitTx.apply("unused", args)
                .then(buffer => {
                    return buffer;
                }, error => {
                    return Promise.reject(error);
                });
        }, error => {
            return Promise.reject(error);
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
}

//____________________________________________________________________________ROUTES____________________________________________________________________________

/// GET - /drugs
supplyChainRouter.route('/drugs').get(function (request, response) {
    submitTx(request, 'getAllDrugs', '')
        .then((queryDrugsResponse) => {
            //  response is already a string;  not a buffer
            let drugs = queryDrugsResponse;
            response.status(STATUS_SUCCESS);
            response.send(drugs);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the list of drugs."));
        });
});


/// GET - /drugs/:id
supplyChainRouter.route('/drugs/:id').get(function (request, response) {
    submitTx(request, 'getDrug', request.params.id)
        .then((queryDrugResponse) => {
            // process response
            let drug = Drug.fromBuffer(queryDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, DRUG_NOT_FOUND,
                'Drug id, ' + request.params.id +
                ' does not exist or the user does not have access to drug details at this time.'));
        });
});


/// __________________________________Manufacturer__________________________________
/// POST - /drugs
supplyChainRouter.route('/drugs').post(function (request, response) {
    console.log('request body ', request.body);
    submitTx(request, 'createDrug', JSON.stringify(request.body))
        .then((result) => {
            // process response
            console.log('\nProcess createDrug transaction.');
            let drug = Drug.fromBuffer(result);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem manufacturing the drug."));
        });
});


/// PUT - /drugs/manufacturer/ship/:id
supplyChainRouter.route('/drugs/manufacturer/ship/:id').put(function (request, response) {
    submitTx (request, 'manufacturerShipDrug', request.params.id)
        .then((manShipDrugResponse) => {
            console.log('Process manufacturerShipDrug transaction.');
            let drug = Drug.fromBuffer(manShipDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the manufacturer shipping the drug," + request.params.id));
        });
});


/// __________________________________Distributor__________________________________
/// PUT - /drugs/distributor/receive/:id
supplyChainRouter.route('/drugs/distributor/receive/:id').put(function (request, response) {
    submitTx (request, 'distributorReceiveDrug', request.params.id)
        .then((disReceiveDrugResponse) => {
            console.log('Process distributorReceiveDrug transaction.');
            let drug = Drug.fromBuffer(disReceiveDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the distributor receiving the drug," + request.params.id));
        });
});


/// PUT - /drugs/distributor/ship/:id
supplyChainRouter.route('/drugs/distributor/ship/:id').put(function (request, response) {
    submitTx (request, 'distributorShipDrug', request.params.id)
        .then((disShipDrugResponse) => {
            console.log('Process distributorShipDrug transaction.');
            let drug = Drug.fromBuffer(disShipDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the distributor shipping the drug," + request.params.id));
        });
});


/// __________________________________Wholesaler__________________________________
/// PUT - /drugs/wholesaler/receive/:id
supplyChainRouter.route('/drugs/wholesaler/receive/:id').put(function (request, response) {
    submitTx (request, 'wholesalerReceiveDrug', request.params.id)
        .then((wholeReceiveDrugResponse) => {
            console.log('Process wholesalerReceiveDrug transaction.');
            let drug = Drug.fromBuffer(wholeReceiveDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the wholesaler receiving the drug," + request.params.id));
        });
});


/// PUT - /drugs/wholesaler/ship/:id
supplyChainRouter.route('/drugs/wholesaler/ship/:id').put(function (request, response) {
    submitTx (request, 'wholesalerShipDrug', request.params.id)
        .then((wholeShipDrugResponse) => {
            console.log('Process wholesalerShipDrug transaction.');
            let drug = Drug.fromBuffer(wholeShipDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the wholesaler shipping the drug," + request.params.id));
        });
});



/// __________________________________Retailer__________________________________
/// PUT - /drugs/retailer/receive/:id
supplyChainRouter.route('/drugs/retailer/receive/:id').put(function (request, response) {
    submitTx (request, 'retailerReceiveDrug', request.params.id)
        .then((retReceiveDrugResponse) => {
            console.log('Process retailerReceiveDrug transaction.');
            let drug = Drug.fromBuffer(retReceiveDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the retailer receiving the drug," + request.params.id));
        });
});


/// PUT - /drugs/retailer/sell/:id
supplyChainRouter.route('/drugs/retailer/sell/:id').put(function (request, response) {
    submitTx (request, 'retailerSellDrug', request.params.id)
        .then((retSellDrugResponse) => {
            console.log('Process retailerSellDrug transaction.');
            let drug = Drug.fromBuffer(retSellDrugResponse);
            logDrugDetails(drug);
            response.status(STATUS_SUCCESS);
            response.send(drug);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in the retailer selling the drug," + request.params.id));
        });
});



////////////////////////////////// User Management APIs ///////////////////////////////////////

//  Purpose:    POST api to register new users with Hyperledger Fabric CA;
//  Note:       After registration, users have to enroll to get certificates
//              to be able to submit transactions to Hyperledger Fabric Peer.
//  Input:      request.body = {username (string), password (string), usertype (string)}
//              usertype = {"admin", "manufacturer", "distributor", "wholesaler", "retailer", "customer"}
//              An admin identity is required to make this call to CA and
//              should be passed in authorization header.
//  Output:     pwd; If password was "", a generated password is returned in response
//  Usage 1:    "smith", "smithpw", "manufacturer"
//  Usage 2:    "smith", "",        "manufacturer"

supplyChainRouter.route('users/register').post(function (request, response) {
    
    const userId = request.body.userid;
    const userPwd = request.body.password;
    const userType = request.body.usertype;
    
    try {
        //  only admin can call this api;  get admin username and pwd from request header
        getUsernamePassword(request)
            .then(newRequest => {
                //  1.  No need to call setUserContext
                //  Fabric CA client is used for register-user;
                //  2.  In this demo application UI, only admin sees the page "Manage Users"
                //  So, it is assumed that only the admin has access to this api
                //  users/register can only be called by a user with admin privileges.

                utils.registerUser(userId, userPwd, userType, newRequest.username)
                    .then((result) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result);
                    }, (registerError) => {
                        response.status(STATUS_CLIENT_ERROR);
                        response.send(utils.prepareErrorResponse(registerError, STATUS_CLIENT_ERROR,
                            "User, " + userId + " could not be registered. "
                            + "Verify if calling identity has admin privileges."));
                    });
            }, usernamePassErr => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(usernamePassErr, INVALID_HEADER,
                    "Invalid header;  User, " + userId + " could not be registered."));
            });
    } catch (error) {
        response.status(STATUS_SERVER_ERROR);
        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
            "Internal server error; User, " + userId + " could not be registered."));
    }
});

//  Purpose:    To enroll registered users with Fabric CA;
//  A call to enrollUser to Fabric CA generates (and returns) certificates for the given (registered) user;
//  These certificates are need for subsequent calls to Fabric Peers.
//  Input: { userid, password } in header and request.body.usertype
//  Output:  Certificate on successful enrollment
//  Usage:  "smith", "smithpw", "manufacturer"
supplyChainRouter.route('users/enroll').post(function (request, response) {
    let userType = request.body.usertype;
    
    //  retrieve username, password of the called from authorization header
    getUsernamePassword(request).then(newRequest => {
        utils.enrollUser(newRequest.username, newRequest.password, userType).then(enrolledUser => {
            response.status(STATUS_SUCCESS);
            response.send(enrolledUser);
        }, enrolledError => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(enrolledError, STATUS_CLIENT_ERROR,
                "User, " + newRequest.username + " could not be enrolled. Check that user is registered."));
        });
    }, usernamePassErr => {
        response.status(STATUS_CLIENT_ERROR);
        response.send(utils.prepareErrorResponse(usernamePassErr, INVALID_HEADER,
            "Invalid header;  User, " + request.username + " could not be enrolled.")); // this is made possible because the request object property of user name and password has been added (in getUsernamePassword).
        // hence we can access it because it points to the same reference in memory
    });
});

supplyChainRouter.route('users/is-enrolled/:id').get(function (request, response) {
    //  only admin can call this api;  But this is not verified here
    //  get admin username and pwd from request header
    //
    let userId = request.params.id;

    getUsernamePassword(request)
        .then(newRequest => {
            utils.isUserEnrolled(userId).then(isEnrolled => {
                response.status(STATUS_SUCCESS);
                response.send(isEnrolled);
            }, enrolledError => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(enrolledError, STATUS_CLIENT_ERROR,
                    "Error checking enrollment for user, " + userId));
            });
        }, usernamePwdErr => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(usernamePwdErr, INVALID_HEADER,
                "Invalid header; Error checking enrollment for user, " + userId));
        });
})

//  Purpose: Get list of all users
//  Output:  array of all registered users
//  Usage:  ""
supplyChainRouter.route('/users').get(function (request, response) {
    getUsernamePassword(request)
        .then(newRequest => {
            utils.getAllUsers(newRequest.username).then((allUsers) => {
                response.status(STATUS_SUCCESS);
                response.send(allUsers);
            }, (allUsersErr) => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse (allUsersErr, STATUS_SERVER_ERROR,
                    "Problem getting list of users."));
            });
        }, (reqError) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(reqError, INVALID_HEADER,
                "Invalid header;  User, " + request.username + " could not be enrolled."));
        });
});

supplyChainRouter.route('/users/:id').get(function (request, response) {
    //  Get admin username and pwd from request header
    //  Only admin can call this api; this is not verified here;
    //  Possible future enhancement
    
    const userId = request.params.id;
    
    getUsernamePassword(request)
        .then(newRequest => {
            utils.isUserEnrolled(userId).then(isEnrolled => {
                if (isEnrolled === true) {
                    utils.getUser(userId, newRequest.username).then((user) => {
                        response.status(STATUS_SUCCESS);
                        response.send(user);
                    }, (userErr) => {
                        response.status(STATUS_SERVER_ERROR);
                        response.send(utils.prepareErrorResponse(userErr, STATUS_SERVER_ERROR,
                            "Could not get user details for user, " + newRequest.params.id));
                    });
                } else {
                    let error = {};
                    response.status(STATUS_CLIENT_ERROR);
                    response.send(utils.prepareErrorResponse(error, USER_NOT_ENROLLED,
                        "Verify if the user is registered and enrolled."));
                }
            }, (enrolledErr) => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse(enrolledErr, STATUS_SERVER_ERROR,
                    "Problem checking for user enrollment."));
            });
        }, (reqError) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(reqError, INVALID_HEADER,
                "Invalid header;  User, " + userId + " could not be enrolled."));
        });
});


//____________________________________________________________________________UTILITIES____________________________________________________________________________
function logDrugDetails(drug){
    console.log(`drug ${drug.drugId} : price = ${drug.price}, quantity = ${drug.quantity}, expiryDate = ${drug.expiryDate}, 
                        manufacturerId = ${drug.manufacturerId}, distributorId = ${drug.distributorId}, 
                        wholesalerId = ${drug.wholesalerId}, retailerId = ${drug.retailerId},  currentState = ${drug.currentState}`);
}


module.exports = supplyChainRouter;