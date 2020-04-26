/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate drug state values
const drugState = {
    MANUFACTURER_SHIPPED: 1,    // manufacturer
    DISTRIBUTOR_RECEIVED: 2,   // distributor
    DISTRIBUTOR_SHIPPED: 3,   // distributor
    WHOLESALER_RECEIVED: 4,  // wholesaler
    WHOLESALER_SHIPPED: 5,  // wholesaler
    RETAILER_RECEIVED: 6,  // retailer
    DRUG_SOLD: 7 // sold
};

/**
 * Drug class extends State class
 * Class will be used by application and smart contract to define a Drug
 */

class Drug extends State {

    constructor(obj) {
        super(Drug.getClass(), [obj.orderId]);
        Object.assign(this, obj);
    }

    /*
   Definition:  Class Drug:
     {String}  drugId
     {String} drugName
     {float}   price
     {Integer} quantity
     {Date} expiryDate
     {String} prescription
     {String} manufacturerId
     {String} distributorId
     {String} wholesalerId
     {String} retailerId
     {Enumerated drugStates} currentDrugState
     {Date} created
     {Date} modified
     {String} currentOwner
   */

    /**
     * Basic getters and setters
     */
    getId() {
        return this.drugId;
    }
    /*  //  should never be called explicitly;
        //  id is set at the time of constructor call.
        setId(newId) {
            this.id = newId;
        }
    */

    /**
     * Useful methods to encapsulate  Order states
     */
    setStateToManufacturerShipped() {
        this.currentDrugState = drugState.MANUFACTURER_SHIPPED;
    }
    
    setStateToDistributorReceived() {
        this.currentDrugState = drugState.DISTRIBUTOR_RECEIVED;
    }
    
    setStateToDistributorShipped() {
        this.currentDrugState = drugState.DISTRIBUTOR_SHIPPED;
    }
    
    setStateToWholesalerReceived() {
        this.currentDrugState = drugState.WHOLESALER_RECEIVED;
    }

    
    setStateToWholesalerShipped() {
        this.currentDrugState = drugState.WHOLESALER_SHIPPED;
    }
    
    setStateToRetailerReceived() {
        this.currentDrugState = drugState.RETAILER_RECEIVED;
    }

    
    setStateToDrugSold() {
        this.currentDrugState = drugState.DRUG_SOLD;
    }

    static fromBuffer(buffer) {
        return Drug.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }


    /**
     * Deserialize a state data to Drug
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Drug);
    }

    /**
     * Factory method to create a drug object
     */
    static createInstance(drugId) {
        return new Drug({drugId});
    }

    static getClass() {
        return 'org.supplychainnet.drug';
    }
}

module.exports = Drug;
module.exports.drugStates = drugState;