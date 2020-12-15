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

const httpStatusCodes = require('./constants').HTTP_STATUS_CODES; // http status codes
const appCodes = require('./constants').APP_CODES; //  application specific errors
const defaultUser = require('./constants').DEFAULT_USER; //  default admin user

const supplyChainActors = require('./constants').SUPPLY_CHAIN_ACTORS; // supply chain actors

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
    submitTx(request, 'queryDrugs', '')
        .then((queryDrugsResponse) => {
            //  response is already a string;  not a buffer
            const drugs = JSON.parse(JSON.parse(queryDrugsResponse));
            console.log(drugs);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'Successfully retrieved drugs', data: drugs});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_FOUND,
                "There was a problem getting the list of drugs.");
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// GET - /drugs/:id
supplyChainRouter.route('/drugs/:id').get(function (request, response) {
    submitTx(request, 'queryDrug', request.params.id)
        .then((queryDrugResponse) => {
            // process response
            const drug = Drug.fromBuffer(queryDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'Successfully retrieved drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_FOUND,
                'Drug id, ' + request.params.id +
                ' does not exist or the user does not have access to drug details at this time.');
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// GET - /drugs/drug-history/:id
supplyChainRouter.route('/drugs/drug-history/:id').get(function (request, response) {
    submitTx(request, 'queryDrugTransactionHistory', request.params.id)
        .then((queryDrugHisResponse) => {
            //  response is already a string;  not a buffer
            const drugs = (JSON.parse(queryDrugHisResponse));
            console.log(drugs);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'Successfully retrieved drug history', data: drugs});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_FOUND,
                'Drug id, ' + request.params.id +
                ' does not exist or the user does not have access to drug history at this time.');
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
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
            const drug = Drug.fromBuffer(result);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'Successfully created drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_CREATED,
                "There was a problem manufacturing the drug.");
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// PATCH - /drugs/manufacturer/ship/:id
supplyChainRouter.route('/drugs/manufacturer/ship/:id').patch(function (request, response) {
    submitTx (request, 'manufacturerShipDrug', request.params.id)
        .then((manShipDrugResponse) => {
            console.log('Process manufacturerShipDrug transaction.');
            const drug = Drug.fromBuffer(manShipDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'manufacturer successfully shipped drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_SHIPPED,
                "There was a problem in the manufacturer shipping the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// __________________________________Distributor__________________________________
/// PATCH - /drugs/distributor/receive/:id
supplyChainRouter.route('/drugs/distributor/receive/:id').patch(function (request, response) {
    submitTx (request, 'distributorReceiveDrug', request.params.id)
        .then((disReceiveDrugResponse) => {
            console.log('Process distributorReceiveDrug transaction.');
            const drug = Drug.fromBuffer(disReceiveDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'distributor successfully received drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_RECEIVED,
                "There was a problem in the distributor receiving the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// PATCH - /drugs/distributor/ship/:id
supplyChainRouter.route('/drugs/distributor/ship/:id').patch(function (request, response) {
    submitTx (request, 'distributorShipDrug', request.params.id)
        .then((disShipDrugResponse) => {
            console.log('Process distributorShipDrug transaction.');
            const drug = Drug.fromBuffer(disShipDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'distributor successfully shipped drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_SHIPPED,
                "There was a problem in the distributor shipping the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// __________________________________Wholesaler__________________________________
/// PATCH - /drugs/wholesaler/receive/:id
supplyChainRouter.route('/drugs/wholesaler/receive/:id').patch(function (request, response) {
    submitTx (request, 'wholesalerReceiveDrug', request.params.id)
        .then((wholeReceiveDrugResponse) => {
            console.log('Process wholesalerReceiveDrug transaction.');
            const drug = Drug.fromBuffer(wholeReceiveDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'wholesaler successfully received drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_RECEIVED,
                "There was a problem in the wholesaler receiving the drug," + request.params.id)
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// PATCH - /drugs/wholesaler/ship/:id
supplyChainRouter.route('/drugs/wholesaler/ship/:id').patch(function (request, response) {
    submitTx (request, 'wholesalerShipDrug', request.params.id)
        .then((wholeShipDrugResponse) => {
            console.log('Process wholesalerShipDrug transaction.');
            const drug = Drug.fromBuffer(wholeShipDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'wholesaler successfully shipped drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_SHIPPED,
                "There was a problem in the wholesaler shipping the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});



/// __________________________________Retailer__________________________________
/// PATCH - /drugs/retailer/receive/:id
supplyChainRouter.route('/drugs/retailer/receive/:id').patch(function (request, response) {
    submitTx (request, 'retailerReceiveDrug', request.params.id)
        .then((retReceiveDrugResponse) => {
            console.log('Process retailerReceiveDrug transaction.');
            const drug = Drug.fromBuffer(retReceiveDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'retailer successfully received drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_RECEIVED,
                "There was a problem in the retailer receiving the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// PATCH - /drugs/retailer/sell/:id
supplyChainRouter.route('/drugs/retailer/sell/:id').patch(function (request, response) {
    submitTx (request, 'retailerSellDrug', request.params.id)
        .then((retSellDrugResponse) => {
            console.log('Process retailerSellDrug transaction.');
            const drug = Drug.fromBuffer(retSellDrugResponse);
            console.log(drug);
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'retailer successfully sold drug', data: drug});
        }, (error) => {
            const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_SOLD,
                "There was a problem in the retailer selling the drug," + request.params.id);
            
            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
});


/// __________________________________Drug Authorization__________________________________
/// PATCH - /drugs/authorize/:id
supplyChainRouter.route('/drugs/authorize').patch(function (request, response) {
    
    const encryptedId = request.body.encryptedDrugId;
    
    console.log('encryptedId');
    console.log(encryptedId);
    
    const decryptedData = utils.decryptData(encryptedId);
    
    console.log('decrypted data');
    console.log(decryptedData);
    
    getUsernamePassword(request).then(() => {
        let smartContractName = '';
        
        utils.getUser(request.username, defaultUser.userId).then((user) => {

            switch (user.usertype) {
                case supplyChainActors.distributor:
                    smartContractName = 'distributorReceiveDrug';
                    break;

                case supplyChainActors.wholesaler:
                    smartContractName = 'wholesalerReceiveDrug';
                    break;

                case supplyChainActors.retailer:
                    smartContractName = 'retailerReceiveDrug';
                    break;
            }

            submitTx (request, smartContractName, decryptedData)
                .then((receiveDrugResponse) => {
                    console.log(`Process ${smartContractName} transaction.`);
                    const drug = Drug.fromBuffer(receiveDrugResponse);
                    console.log(drug);
                    response.status(httpStatusCodes.STATUS_SUCCESS);
                    response.send({code: appCodes.SUCCESS, message: `${user.usertype} ${user.userid} successfully received drug`, data: drug});
                }, (error) => {
                    const errorResponse = utils.prepareErrorResponse(error, appCodes.DRUG_NOT_RECEIVED,
                        `There was a problem in ${user.usertype} ${user.userid}  receiving the drug,` + request.params.id);

                    response.status(httpStatusCodes.STATUS_SERVER_ERROR);
                    response.send(errorResponse);
                });
            
        }, (userErr) => {
            const errorResponse = utils.prepareErrorResponse(userErr, appCodes.USER_NOT_FOUND,
                "Could not get user details for user, " + request.username);

            response.status(httpStatusCodes.STATUS_SERVER_ERROR);
            response.send(errorResponse);
        });
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

supplyChainRouter.route('/users/register').post(function (request, response) {
    
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
                        response.status(httpStatusCodes.STATUS_SUCCESS);
                        response.send({code: appCodes.SUCCESS, message: 'successfully registered user', data: result}); // return back the password
                    }, (registerError) => {
                        const errorResponse = utils.prepareErrorResponse(registerError, appCodes.USER_NOT_REGISTERED,
                            "User, " + userId + " could not be registered. "
                            + "Verify if calling identity has admin privileges.");
                        
                        response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
                        response.send(errorResponse);
                    });
            }, usernamePassErr => {
                const errorResponse = utils.prepareErrorResponse(usernamePassErr, appCodes.INVALID_HEADER,
                    "Invalid header;  User, " + userId + " could not be registered.")
                
                response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
                response.send(errorResponse);
            });
    } catch (error) {
        const errorResponse = utils.prepareErrorResponse(error, httpStatusCodes.STATUS_SERVER_ERROR,
            "Internal server error; User, " + userId + " could not be registered.");
        
        response.status(httpStatusCodes.STATUS_SERVER_ERROR);
        response.send(errorResponse);
    }
});

//  Purpose:    To enroll registered users with Fabric CA;
//  A call to enrollUser to Fabric CA generates (and returns) certificates for the given (registered) user;
//  These certificates are need for subsequent calls to Fabric Peers.
//  Input: { userid, password } in header and request.body.usertype
//  Output:  Certificate on successful enrollment
//  Usage:  "smith", "smithpw", "manufacturer"
supplyChainRouter.route('/users/enroll').post(function (request, response) {
    const userId = request.body.userid;
    const userPwd = request.body.password;
    const userType = request.body.usertype;
    
    //  retrieve username, password of the called from authorization header
    getUsernamePassword(request).then(newRequest => {
        utils.enrollUser(userId, userPwd, userType).then(enrolledUser => {
            response.status(httpStatusCodes.STATUS_SUCCESS);
            response.send({code: appCodes.SUCCESS, message: 'successfully enrolled user', data: enrolledUser});
        }, enrolledError => {
            const errorResponse = utils.prepareErrorResponse(enrolledError, appCodes.USER_NOT_ENROLLED,
                "User, " + newRequest.username + " could not be enrolled. Check that user is registered.");
            
            response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
            response.send(errorResponse);
        });
    }, usernamePassErr => {
        const errorResponse = utils.prepareErrorResponse(usernamePassErr, appCodes.INVALID_USER_HEADER,
            "Invalid header;  User, " + request.username + " could not be enrolled.");
        
        response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
        response.send(errorResponse); // this is made possible because the request object property of user name and password has been added (in getUsernamePassword).
        // hence we can access it because it points to the same reference in memory
    });
});

supplyChainRouter.route('/users/is-enrolled/:id').get(function (request, response) {
    //  only admin can call this api;  But this is not verified here
    //  get admin username and pwd from request header
    //
    let userId = request.params.id;

    getUsernamePassword(request)
        .then(newRequest => {
            utils.isUserEnrolled(userId).then(isEnrolled => {
                response.status(httpStatusCodes.STATUS_SUCCESS);
                response.send({code: appCodes.SUCCESS, message: 'successfully retrieved enrollment status', data: isEnrolled});
            }, enrolledError => {
                const errorResponse = utils.prepareErrorResponse(enrolledError, appCodes.USER_NOT_ENROLLED,
                    "Error checking enrollment for user, " + userId);
                
                response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
                response.send(errorResponse);
            });
        }, usernamePwdErr => {
            const errorResponse = utils.prepareErrorResponse(usernamePwdErr, appCodes.INVALID_USER_HEADER,
                "Invalid header; Error checking enrollment for user, " + userId);
            
            response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
            response.send(errorResponse);
        });
})

//  Purpose: Get list of all users
//  Output:  array of all registered users
//  Usage:  ""
supplyChainRouter.route('/users').get(function (request, response) {
    getUsernamePassword(request)
        .then(newRequest => {
            utils.getAllUsers(newRequest.username).then((allUsers) => {
                response.status(httpStatusCodes.STATUS_SUCCESS);
                response.send({code: appCodes.SUCCESS, message: 'successfully retrieved users', data: allUsers});
            }, (allUsersErr) => {
                const errorResponse = utils.prepareErrorResponse (allUsersErr, appCodes.USER_NOT_FOUND,
                    "Problem getting list of users.");
                
                response.status(httpStatusCodes.STATUS_SERVER_ERROR);
                response.send(errorResponse);
            });
        }, (reqError) => {
            const errorResponse = utils.prepareErrorResponse(reqError, appCodes.INVALID_USER_HEADER,
                "Invalid header;  User, " + request.username + " could not be enrolled.");
            
            response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
            response.send(errorResponse);
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
                        response.status(httpStatusCodes.STATUS_SUCCESS);
                        response.send({code: appCodes.SUCCESS, message: 'successfully retrieved user', data: user});
                    }, (userErr) => {
                        const errorResponse = utils.prepareErrorResponse(userErr, appCodes.USER_NOT_FOUND,
                            "Could not get user details for user, " + newRequest.params.id);
                        
                        response.status(httpStatusCodes.STATUS_SERVER_ERROR);
                        response.send(errorResponse);
                    });
                } else {
                    let error = {};
                    const errorResponse = utils.prepareErrorResponse(error, appCodes.USER_NOT_ENROLLED,
                        "Verify if the user is registered and enrolled.");
                    
                    response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
                    response.send(errorResponse);
                }
            }, (enrolledErr) => {
                const errorResponse = utils.prepareErrorResponse(enrolledErr, appCodes.USER_NOT_ENROLLED,
                    "Problem checking for user enrollment.");
                
                response.status(httpStatusCodes.STATUS_SERVER_ERROR);
                response.send(errorResponse);
            });
        }, (reqError) => {
            const errorResponse = utils.prepareErrorResponse(reqError, appCodes.INVALID_USER_HEADER,
                "Invalid header;  User, " + userId + " could not be enrolled.");
            
            response.status(httpStatusCodes.STATUS_CLIENT_ERROR);
            response.send(errorResponse);
        });
});


module.exports = supplyChainRouter;
