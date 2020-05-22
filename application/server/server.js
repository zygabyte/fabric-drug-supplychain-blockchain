/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
'use strict';

// Classes for Node Express
const express = require('express');
const app = express();
const cors = require('cors');
const utils = require('./utils');
const supplyChainRoutes = require('./supplychainroutes');


// Start up the Express functions to listen on server side
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});
app.use(cors());

//  routes defined
app.use('/api', supplyChainRoutes);

app.get('/ping', (req, res) => {
    res.send('Response from Generic Supply Chain backend server');
});

async function main() {

    try {
        await utils.connectGatewayFromConfig (); // first config the gateway
        await utils.events(); // then connect to event hub
    } catch (error) {
        return console.log ('Error in connecting to Fabric network. ', error);
    }

    const port = process.env.PORT || 3000;
    app.listen(port, (error) => {
        if (error) {
            return console.log('Error: ' + err);
        }
        console.log(`Server listening on ${port}`)
    });
}


main();
