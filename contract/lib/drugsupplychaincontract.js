/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// drug supplychainnet specific classes
const Drug = require('./drug');
const DrugStates = require('./drug').drugStates;
const supplyChainActors = require('./supplychainactors');

//  EVENT
const EVENT_TYPE = "bcpocevent";

//  Error codes
const DUPLICATE_DRUG_ID = 101;
const DRUG_ID_NOT_FOUND = 102;

/**
 * A custom context provides easy access to list of all products
 */
class SupplychainContext extends Context {
    constructor() {
        super();
    }
}

/**
 * Define product smart contract by extending Fabric Contract class
 */
class SupplychainContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.supplychainnet.contract');
    }

    /**
     * Define a custom context for drug
     */
    createContext() {
        return new SupplychainContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async init(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }
    

    /**
     * createDrug
     * To be used by a manufacturer after they have created a drug and just prior to shipping 
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * @param {String} drugName
     * @param {float}  price
     * @param {Integer} quantity
     * @param {Date} expiryDate
     * @param {String} prescription
     * @param {String} manufacturerId
     * @param {String} distributorId
     * @param {String} wholesalerId
     * @param {String} retailerId
     * @param {Enumerated drugStates} currentDrugState
     * @param {Date} created
     * @param {Date} manufacturerShipped
     * @param {Date} distributorReceived
     * @param {Date} distributorShipped
     * @param {Date} wholesalerReceived
     * @param {Date} wholesalerShipped
     * @param {Date} retailerReceived
     * @param {Date} sold
     * @param {String} currentOwner
     * Usage: submitTransaction ('orderProduct', 'Order001', 'mango', 100.00, 100, 'farm1', 'walmart')
     * Usage: ["Order100", "mango", "10.00", "102", "farm1", "walmart"]
     */
    async createDrug(ctx, args) {
        // Access Control: This transaction should only be invoked by a Manufacturer
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.manufacturer))
            throw new Error('Error Message from createDrug: This user does not have access to manufacture a drug');

        const drugDetails = JSON.parse(args);
        const drugId = drugDetails.drugId;

        console.log("incoming asset fields: " + JSON.stringify(drugDetails));

        // Check if a drug already exists with id=drugId
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (drugAsBytes && drugAsBytes.length > 0) {
            throw new Error(`Error Message from createDrug: Drug with drugId = ${drugId} already exists.`);
        }

        // Create a new Order object
        let drug = Drug.createInstance(drugId);
        drug.drugName = drugDetails.drugName;
        drug.price = drugDetails.price.toString();
        drug.quantity = drugDetails.quantity.toString();
        drug.expiryDate = drugDetails.expiryDate;
        drug.prescription = drugDetails.prescription;
        drug.manufacturerId = drugDetails.manufacturerId;
        drug.distributorId = drugDetails.distributorId;
        drug.wholesalerId = drugDetails.wholesalerId;
        drug.retailerId = drugDetails.retailerId;
        drug.currentDrugState = DrugStates.DRUG_CREATED;
        drug.created = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        drug.currentOwner = await this.getCurrentUserId(ctx);
        drug.manufacturerShipped = '';
        drug.distributorReceived = '';
        drug.distributorShipped = '';
        drug.wholesalerReceived = '';
        drug.wholesalerShipped = '';
        drug.retailerReceived = '';
        drug.sold = '';

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Define and set event
        const event_obj = drug;
        event_obj.event_type = "createDrug";   //  add the field "event_type" for the event to be processed

        try {
            await ctx.stub.setEvent(EVENT_TYPE, event_obj.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }
        finally {
            console.log("Attempted to send event = ", drug);
        }

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }


    /**
     * manufacturerShipDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  manufacturerShipDrug ('drug001')
     */
    async manufacturerShipDrug(ctx, drugId) {
        console.info('============= manufacturer ship drug ===========');

        //  The manufacturer ships the drug after the production of the drug 

        // Access Control: This transaction should only be invoked by a designated manufacturer
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.manufacturer))
            throw new Error(`Error Message from manufacturerShipDrug: This user does not have access to ship drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from manufacturerShipDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from manufacturerShipDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to MANUFACTURER_SHIPPED;
        drug.setStateToManufacturerShipped();
        // update the date and time it was shipped
        drug.manufacturerShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }

    
    

    //____________________________________________________________________________DISTRIBUTOR____________________________________________________________________________
    /**
     * distributorReceiveDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  distributorReceiveDrug ('drug001')
     */
    async distributorReceiveDrug(ctx, drugId) {
        console.info('============= distributor receive drug ===========');

        //  The distributor receives the drug after it arrives from the manufacturer

        // Access Control: This transaction should only be invoked by a designated distributor
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.distributor))
            throw new Error(`Error Message from distributorReceiveDrug: This user does not have access to receive drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from distributorReceiveDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from distributorReceiveDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to DISTRIBUTOR_RECEIVED;
        drug.setStateToDistributorReceived();
        // update the date and time it was received
        drug.distributorReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }

    /**
     * distributorShipDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  distributorShipDrug ('drug001')
     */
    async distributorShipDrug(ctx, drugId) {
        console.info('============= distributor ship drug ===========');

        //  The distributor ships the drug when he's ready to transfer it to the next supply chain actor 

        // Access Control: This transaction should only be invoked by a designated distributor
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.distributor))
            throw new Error(`Error Message from distributorShipDrug: This user does not have access to ship drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from distributorShipDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from distributorShipDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to DISTRIBUTOR_SHIPPED;
        drug.setStateToDistributorShipped();
        // update the date and time it was shipped
        drug.distributorShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }
    

    //____________________________________________________________________________WHOLESALER____________________________________________________________________________
    /**
     * wholesalerReceiveDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  wholesalerReceiveDrug ('drug001')
     */
    async wholesalerReceiveDrug(ctx, drugId) {
        console.info('============= wholesaler receive drug ===========');

        //  The wholesaler receives the drug after it arrives from the distributor

        // Access Control: This transaction should only be invoked by a designated wholesaler
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.wholesaler))
            throw new Error(`Error Message from wholesalerReceiveDrug: This user does not have access to receive drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from wholesalerReceiveDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from wholesalerReceiveDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to WHOLESALER_RECEIVED;
        drug.setStateToWholesalerReceived();
        // update the date and time it was received
        drug.wholesalerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }

    /**
     * wholesalerShipDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  wholesalerShipDrug ('drug001')
     */
    async wholesalerShipDrug(ctx, drugId) {
        console.info('============= wholesaler ship drug ===========');

        //  The wholesaler ships the drug when he's ready to transfer it to the next supply chain actor 

        // Access Control: This transaction should only be invoked by a designated wholesaler
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.wholesaler))
            throw new Error(`Error Message from wholesalerShipDrug: This user does not have access to ship drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from wholesalerShipDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from wholesalerShipDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to WHOLESALER_SHIPPED;
        drug.setStateToWholesalerShipped();
        // update the date and time it was shipped
        drug.wholesalerShipped = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }
    

    //____________________________________________________________________________RETAILER____________________________________________________________________________
    /**
     * retailerReceiveDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  retailerReceiveDrug ('drug001')
     */
    async retailerReceiveDrug(ctx, drugId) {
        console.info('============= retailer receive drug ===========');

        //  The retailer receives the drug after it arrives from the wholesaler

        // Access Control: This transaction should only be invoked by a designated retailer
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.retailer))
            throw new Error(`Error Message from retailerReceiveDrug: This user does not have access to receive drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from retailerReceiveDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from retailerReceiveDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to RETAILER_RECEIVED;
        drug.setStateToRetailerReceived();
        // update the date and time it was received
        drug.retailerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }

    /**
     * retailerSellDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  retailerSellDrug ('drug001')
     */
    async retailerSellDrug(ctx, drugId) {
        console.info('============= retailer sell drug ===========');

        //  The retailer sells the drug to customers 

        // Access Control: This transaction should only be invoked by a designated retailer
        const userType = await this.getCurrentUserType(ctx);

        if ((userType !== supplyChainActors.admin) && // admin only has access as a precaution.
            (userType !== supplyChainActors.retailer))
            throw new Error(`Error Message from retailerSellDrug: This user does not have access to sell drug of id ${drugId}`);

        if (!drugId || drugId.length < 1) {
            throw new Error('Error Message from retailerSellDrug: drugId is required as input')
        }

        // Retrieve the current drug using key provided
        const drugAsBytes = await ctx.stub.getState(drugId);
        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from retailerSellDrug: Drug with drugId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Change currentDrugState to DRUG_SOLD;
        drug.setStateToDrugSold();
        // update the date and time it was sold
        drug.sold = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = await this.getCurrentUserId(ctx);

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }








    //____________________________________________________________________________UTILITIES____________________________________________________________________________
    /**
     * getCurrentUserType
     * To be called by application to get the type for a user who is logged in
     *
     * @param {Context} ctx the transaction context
     * Usage:  getCurrentUserType ()
     */
    async getCurrentUserType(ctx) {
        let userid = await this.getCurrentUserId(ctx);

        //  check user id;  if admin, return type = admin;
        //  else return value set for attribute "type" in certificate;
        if (userid === "admin") {
            console.log('user id ' + userid);
            return userid;
        }

        console.log('current user type is ', ctx.clientIdentity.getAttributeValue("usertype"));
        return ctx.clientIdentity.getAttributeValue("usertype");
    }

    /**
     * getCurrentUserId
     * To be called by application to get the type for a user who is logged in
     *
     * @param {Context} ctx the transaction context
     * Usage:  getCurrentUserId ()
     */
    async getCurrentUserId(ctx) {
        let id = [];
        id.push(ctx.clientIdentity.getID());
        const begin = id[0].indexOf("/CN=");
        const end = id[0].lastIndexOf("::/C=");
        
        return id[0].substring(begin + 4, end);
    }
}