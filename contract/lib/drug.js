/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate drug state values
const drugState = {
    DRUG_CREATED: 1,    // manufacturer
    MANUFACTURER_SHIPPED: 2,    // manufacturer
    DISTRIBUTOR_RECEIVED: 3,   // distributor
    DISTRIBUTOR_SHIPPED: 4,   // distributor
    WHOLESALER_RECEIVED: 5,  // wholesaler
    WHOLESALER_SHIPPED: 6,  // wholesaler
    RETAILER_RECEIVED: 7,  // retailer
    DRUG_SOLD: 8 // consumer
};

/**
 * Drug class extends State class
 * Class will be used by application and smart contract to define a Drug
 */

class Drug extends State {

    constructor(obj) {
        super(Drug.getClass(), [obj.drugId]);
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
     {Date} manufacturerShipped
     {Date} distributorReceived
     {Date} distributorShipped
     {Date} wholesalerReceived
     {Date} wholesalerShipped
     {Date} retailerReceived
     {Date} sold
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
    setStateToDrugCreated() {
        this.currentState = drugState.DRUG_CREATED;
    }
    
    setStateToManufacturerShipped() {
        this.currentState = drugState.MANUFACTURER_SHIPPED;
    }
    
    setStateToDistributorReceived() {
        this.currentState = drugState.DISTRIBUTOR_RECEIVED;
    }
    
    setStateToDistributorShipped() {
        this.currentState = drugState.DISTRIBUTOR_SHIPPED;
    }
    
    setStateToWholesalerReceived() {
        this.currentState = drugState.WHOLESALER_RECEIVED;
    }

    
    setStateToWholesalerShipped() {
        this.currentState = drugState.WHOLESALER_SHIPPED;
    }
    
    setStateToRetailerReceived() {
        this.currentState = drugState.RETAILER_RECEIVED;
    }

    
    setStateToDrugSold() {
        this.currentState = drugState.DRUG_SOLD;
    }

    getCurrentState(){
        return this.currentState;
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
        return 'org.drugsupplychainnet.drug';
    }
}

module.exports = Drug;
module.exports.drugStates = drugState;