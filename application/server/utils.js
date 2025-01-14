/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const path = require('path');
const { FileSystemWallet, Gateway, User, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

// rijndael for aes encryption
const Rijndael = require('rijndael-js');
const key = '9c6e7b092cd3015f';
const iv = 'bb739a9759b400ed';

const cipher = new Rijndael(key, 'cbc');


//  global variables for HLFabric
let gateway;
let network;
let contract = null;
let configData; // config.json
let wallet; // ../../gateway/local/gen_local_wallet   -> it eventually stores the wallet of the admin
let bLocalHost; // true
let fabricConnProfile;  // ../../gateway/local/fabric_connection.json   -> the fabric connection profile but parsed as a json object
let orgMspId;  // Org1MSP

const smartContractEvents = require('./constants').SMART_CONTRACT_EVENTS; //  HLFabric EVENT
const defaultUser = require('./constants').DEFAULT_USER; //  default admin user

const utils = {};

// Main program function

utils.prepareErrorResponse = (error, code, message) => {
    let errorMsg;

    try {
        // Pull specific fabric transaction error message out of error stack
        let entries = Object.entries(error);
        errorMsg = entries[0][1][0]["message"];
    } catch (exception) {
        // Error wasn't sent from fabric, so can't pull error out.
        errorMsg = null;
    }

    let result = { "code": code, "message": errorMsg ? errorMsg : message, "error": error };
    console.log("utils.js:prepareErrorResponse(): " + message);
    console.log(result);

    return result;
}


utils.connectGatewayFromConfig = async () => {
    console.log(">>>connectGatewayFromConfig:  ");

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();

    try {

        // Read configuration file which gives
        //  1.  connection profile - that defines the blockchain network and the endpoints for its CA, Peers
        //  2.  network name
        //  3.  channel name
        //  4.  wallet - collection of certificates
        //  5.  username - identity to be used for performing transactions

        const platform = process.env.PLATFORM || 'LOCAL';
        if (platform === 'IBP') {
            configData = JSON.parse(fs.readFileSync('../../gateway/ibp/config.json', 'utf8'));
            console.log("Platform = " + platform);
            bLocalHost = false;
        } else { // PLATFORM = LOCAL
            configData = JSON.parse(fs.readFileSync('../../gateway/local/config.json', 'utf8'));
            console.log("Platform = " + platform);
            bLocalHost = true;
        }

        const walletPath = configData["wallet"];
        console.log("walletpath = " + walletPath);

        // Parse the connection profile. This would be the path to the file downloaded from the IBM Blockchain Platform operational console, 
        // if using IBM platform to execute
        const ccpPath = path.resolve(__dirname, configData["connection_profile_filename"]);

        const defaultUserId = process.env.FABRIC_USER_ID || defaultUser.userId; // the default which is the admin (for local)
        const defaultPassword = process.env.FABRIC_USER_SECRET || defaultUser.userSecret;
        const defaultUserType = process.env.FABRIC_USER_TYPE || defaultUser.userType;

        console.log('user: ' + defaultUserId + ", defaultPassword: ", defaultPassword + ", defaultUserType: ", defaultUserType);

        // Load connection profile; will be used to locate a gateway
        fabricConnProfile = JSON.parse(fs.readFileSync(ccpPath, 'utf8')); // we first the json file from the file system and parse the fabric_connection.json here to a json object

        // Set up the MSP Id
        orgMspId = fabricConnProfile.client.organization;
        console.log('MSP ID: ' + orgMspId);

        // Open path to the identity wallet
        wallet = new FileSystemWallet(walletPath);

        const idExists = await wallet.exists(defaultUserId);
        if (!idExists) { // creating a default admin wallet to be used in case one does not exist
            // Enroll identity in the wallet
            console.log(`Enrolling and importing ${defaultUserId} into wallet`);
            await utils.enrollUser(defaultUserId, defaultPassword, defaultUserType);
        }

        // 1. connect to gateway
        // 2. connect to channel
        // 3. connect to smart contract on channel
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(fabricConnProfile, {
            identity: defaultUserId, wallet: wallet, discovery: { enabled: true, asLocalhost: bLocalHost }
        });

        // Access channel: channel_name
        console.log('Use network channel: ' + configData["channel_name"]); // -> network channel - mychannel

        // Get addressability to the smart contract as specified in config
        network = await gateway.getNetwork(configData["channel_name"]);
        console.log('Use ' + configData["smart_contract_name"] + ' smart contract.');

        // contract will be used in subsequent calls to submit transactions to Fabric
        contract = await network.getContract(configData["smart_contract_name"]);

    } catch (error) {
        console.log('Error connecting to Fabric network. ' + error.toString());
    } finally {
    }

    return contract;
}

utils.events = async () => {
    // get an eventhub once the fabric client has a user assigned. The user
    // is required because the event registration must be signed

    //  Eventhub is attached to a peer.  Get the peer, to register an event hub.
    //  client -> channel -> peer -> eventHub

    const client = gateway.getClient();
    const channel = client.getChannel(configData["channel_name"]);
    const peers = channel.getChannelPeers();
    if (peers.length === 0) {
        throw new Error("Error after call to channel.getChannelPeers(): Channel has no peers!");
    }

    console.log("Connecting to event hub..." + peers[0].getName());

    //  Assuming that we want to connect to the first peer in the peers list
    const channel_event_hub = channel.getChannelEventHub(peers[0].getName());

    // to see the event payload, use 'true' in the call to channel_event_hub.connect(boolean)
    channel_event_hub.connect(true);

    const event_monitor = new Promise((resolve, reject) => {
        /*  Sample usage of registerChaincodeEvent
        registerChaincodeEvent ('chaincodename', 'regularExpressionForEventName',
               callbackfunction(...) => {...},
               callbackFunctionForErrorHandling (...) => {...},
               // options:
               {startBlock:23, endBlock:30, unregister: true, disconnect: true}
        */
        const regid = channel_event_hub.registerChaincodeEvent(configData["smart_contract_name"], smartContractEvents.EVENT_TYPE,
            (event, block_num, txnid, status) => {
                // This callback will be called when there is a chaincode event name
                // within a block that will match on the second parameter in the registration
                // from the chaincode with the ID of the first parameter.

                //let event_payload = JSON.parse(event.payload.toString());

                console.log("Event payload: " + event.payload.toString());
                console.log("\n------------------------------------");
            }, (err) => {
                // this is the callback if something goes wrong with the event registration or processing
                reject(new Error('There was a problem with the eventhub in registerTxEvent ::' + err));
            },
            { disconnect: false } //continue to listen and not disconnect when complete
        );
    }, (err) => {
        console.log("At creation of event_monitor: Error:" + err.toString());
        throw (err);
    });

    Promise.all([event_monitor]);
}  //  end of events()

utils.submitTx = async(contract, txName, ...args) => {
    console.log(">>>utils.submitTx..."+txName+" ("+args+")");
    const result = contract.submitTransaction(txName, ...args);
    return result.then(response => {
        console.log ('utils.js: submitTx -> Transaction submitted successfully. Response: ', response.toString());
        return Promise.resolve(response.toString());
    },(error) =>
    {
        console.log ('utils.js: submitTx -> Error:' + error.toString());
        return Promise.reject(error);
    });
}

//  function registerUser
//  Purpose: Utility function for registering users with HL Fabric CA.
utils.registerUser = async (userId, userPwd, userType, adminIdentity) => {
    console.log("\n------------  utils.registerUser ---------------");
    console.log("\n userid: " + userId + ", pwd: " + userPwd + ", usertype: " + userType)

    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(fabricConnProfile, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });

    const orgs = fabricConnProfile.organizations;
    const CAs = fabricConnProfile.certificateAuthorities;
    const fabricCAKey = orgs[orgMspId].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    const newUserDetails = {
        enrollmentID: userId,
        enrollmentSecret: userPwd,
        role: "client",
        //affiliation: orgMspId,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": userType,
                "ecert": true
            }],
        maxEnrollments: 5
    };

    //  Register is done using admin signing authority
    return ca.register(newUserDetails, gateway.getCurrentIdentity())
        .then(newPwd => {
            //  if a password was set in 'enrollmentSecret' field of newUserDetails,
            //  the same password is returned by "register".
            //  if a password was not set in 'enrollmentSecret' field of newUserDetails,
            //  then a generated password is returned by "register".
            console.log('\n Secret returned: ' + newPwd);
            return newPwd;
        }, error => {
            console.log('Error in register();  ERROR returned: ' + error.toString());
            return Promise.reject(error);
        });
}  //  end of function registerUser

utils.enrollUser = async (userid, userpwd, usertype) => {
    console.log("\n------------  utils.enrollUser -----------------");
    console.log("userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certificate authority
    const orgs = fabricConnProfile.organizations;  // organizations
    const CAs = fabricConnProfile.certificateAuthorities; // certificateAuthorities
    const fabricCAKey = orgs[orgMspId].certificateAuthorities[0]; // organizations[Org1MSP].certificateAuthorities[0] => Org1CA
    const caURL = CAs[fabricCAKey].url; // certificateAuthorities[Org1CA].url => http://localhost:17050
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    const newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        attrs: [
            {
                "name": "usertype", // application role
                "value": usertype,
                "ecert": true
            }]
    };

    // enroll onto the network and then import 
    return ca.enroll(newUserDetails).then(enrollment => {
        //console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);
        const identity = X509WalletMixin.createIdentity(orgMspId, enrollment.certificate, enrollment.key.toBytes());
        return wallet.import(userid, identity).then(notused => {
            console.log('msg: Successfully enrolled user, ' + userid + ' and imported into the wallet');
            console.log('notused', notused);

            return `successfully enrolled user ${userid} and imported into the wallet`;
        }, error => {
            console.log("error in wallet.import\n" + error.toString());
            throw error;
        });
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}

//  function setUserContext
//  Purpose:    to set the context to the user (who called this api) so that ACLs can be applied
//              for that user inside chaincode. All subsequent calls using that gateway / contract
//              will be on this user's behalf.
//  Input:certificateAuthorities      userid - which has been registered and enrolled earlier (so that certificates are
//              available in the wallet)
//  Output:     no explicit output;  (Global variable) contract will be set to this user's context
utils.setUserContext = async (userid, pwd) => {
    console.log('\n>>>setUserContext...');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log(`An identity for the user: ${userid} does not exist in the wallet`);
        console.log('Enroll user before retrying');
        throw (`Identity does not exist for userid: ${userid}`);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log(`Connect to Fabric gateway with userid: ${userid}`);
        let userGateway = new Gateway();
        await userGateway.connect(fabricConnProfile, { identity: userid, wallet: wallet, discovery: { enabled: true, asLocalhost: bLocalHost } });

        network = await userGateway.getNetwork(configData["channel_name"]);
        contract = await network.getContract(configData["smart_contract_name"]);

        return contract;
    }
    catch (error) { throw (error); }
}  //  end of setUserContext(userid)

utils.isUserEnrolled = async (userid) => {
    return wallet.exists(userid).then(result => {
        return result;
    }, error => {
        console.log("error in wallet.exists\n" + error.toString());
        throw error;
    });
}

//  function getUser
//  Purpose: get specific registered user
utils.getUser = async (userid, adminIdentity) => {
    console.log(">>>getUser...");

    const gateway = new Gateway();
    // Connect to gateway as admin
    await gateway.connect(fabricConnProfile, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });

    const client = gateway.getClient();
    const fabric_ca_client = client.getCertificateAuthority();
    const idService = fabric_ca_client.newIdentityService();
    const user = await idService.getOne(userid, gateway.getCurrentIdentity());
    const result = {"userid": userid};

    // for admin, usertype is "admin";
    if (userid === defaultUser.userId) {
        result.usertype = userid;
    } else { // look through user attributes for "usertype"

        if (user.result && user.result.attrs){
            const attributes = user.result.attrs;

            if (attributes.length > 0){
                // look through all attributes for one called "usertype"
                for (let i = 0; i < attributes.length; i++) {
                    if (attributes[i].name === "usertype") {
                        result.usertype = attributes[i].value;
                        break;
                    }
                }
            }
        }
    }

    console.log (result);
    return Promise.resolve(result);
}  //  end of function getUser

//  function getAllUsers
//  Purpose: get all enrolled users
utils.getAllUsers = async (adminIdentity) => {
    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(fabricConnProfile, { wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });

    const client = gateway.getClient();
    const fabric_ca_client = client.getCertificateAuthority();
    const idService = fabric_ca_client.newIdentityService();
    const user = gateway.getCurrentIdentity();
    const userList = await idService.getAll(user);
    const identities = userList.result.identities;
    const allUsers = [];
    let tmpUser;
    let attributes;

    // for all identities
    for (let i = 0; i < identities.length; i++) {
        tmpUser = {};
        tmpUser.id = identities[i].id;
        tmpUser.usertype = "";

        if (tmpUser.id === defaultUser.userId)
            tmpUser.usertype = tmpUser.id;
        else {
            attributes = identities[i].attrs;

            if (attributes && attributes.length > 0){
                // look through all attributes for one called "usertype"
                for (let j = 0; j < attributes.length; j++){
                    if (attributes[j].name === "usertype") {
                        tmpUser.usertype = attributes[j].value;
                        break;
                    }
                }
            }
        }

        allUsers.push(tmpUser);
    }

    return allUsers;
}  //  end of function getAllUsers

utils.encryptData = (data) => {
    const cipherTextBuffer = Buffer.from(cipher.encrypt(data, 128, iv));

    return cipherTextBuffer.toString('base64');
}

utils.decryptData = (cipherText) => {
    const cipherTextBuffer = Buffer.from(cipherText, 'base64');

    const plaintext = Buffer.from(cipher.decrypt(cipherTextBuffer, 128, iv));

    return plaintext.toString();
}

module.exports = utils;
