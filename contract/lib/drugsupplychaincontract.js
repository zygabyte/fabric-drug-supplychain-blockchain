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
class DrugSupplyChainContext extends Context {
    constructor() {
        super();
    }
}

/**
 * Define product smart contract by extending Fabric Contract class
 */
class DrugSupplyChainContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.drugsupplychainnet.contract');
    }

    /**
     * Define a custom context for drug
     */
    createContext() {
        return new DrugSupplyChainContext();
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
        
        const userId = await this.getCurrentUserId(ctx);

        // Create a new Order object
        let drug = Drug.createInstance(drugId);
        drug.drugName = drugDetails.drugName;
        drug.price = drugDetails.price;
        drug.quantity = drugDetails.quantity;
        drug.expiryDate = drugDetails.expiryDate;
        drug.prescription = drugDetails.prescription;
        drug.manufacturerId = userId;
        drug.distributorId = '';
        drug.wholesalerId = '';
        drug.retailerId = '';
        drug.setStateToDrugCreated();
        drug.created = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        drug.currentOwner = userId;
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

        const userId = await this.getCurrentUserId(ctx);

        // Change currentDrugState to DISTRIBUTOR_RECEIVED;
        drug.setStateToDistributorReceived();
        // update the date and time it was received
        drug.distributorReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.distributorId = userId;

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

        const userId = await this.getCurrentUserId(ctx);

        // Change currentDrugState to WHOLESALER_RECEIVED;
        drug.setStateToWholesalerReceived();
        // update the date and time it was received
        drug.wholesalerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.wholesalerId = userId;

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
        const userId = await this.getCurrentUserId(ctx);

        // Change currentDrugState to RETAILER_RECEIVED;
        drug.setStateToRetailerReceived();
        // update the date and time it was received
        drug.retailerReceived = new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.retailerId = userId;

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




    /**
     * getDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  getDrug ('drug001')
     *
     */
    async getDrug(ctx, drugId) {
        console.info('============= get drug ===========');

        //  This is called for query a particular drug by the Id, but note that drugs that do not have the state of RETAILER_RECEIVED (i.e. currently in the hands of the retailer) cannot be returned

        if (!drugId || drugId.length < 1) {
            throw new Error('drugId is required as input')
        }

        const drugAsBytes = await ctx.stub.getState(drugId);

        //  Set an event (irrespective of whether the order existed or not)
        // define and set EVENT_TYPE
        let queryEvent = {
            type: EVENT_TYPE,
            orderId: drugId,
            desc: "Query Order was executed for " + drugId
        };
        await ctx.stub.setEvent(EVENT_TYPE, Buffer.from(JSON.stringify(queryEvent)));

        if (!drugAsBytes || drugAsBytes.length === 0) {
            throw new Error(`Error Message from queryOrder: Order with orderId = ${drugId} does not exist.`);
        }

        // Convert drug so we can modify fields
        const drug = Drug.deserialize(drugAsBytes);

        // Access Control: This transaction should only be invoked by a designated retailer
        const userType = await this.getCurrentUserType(ctx);

        if (userType === supplyChainActors.consumer && drug.getCurrentState() !== DrugStates.RETAILER_RECEIVED)
            throw new Error('Error Message from getDrug: This consumer user cannot query this drug as it does not yet belong to the retailer');

        // Return a serialized order to caller of smart contract
        return drug.toBuffer();
    }


    /**
     * getDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  getDrug ('drug001')
     *
     */
    async getAllDrugs(ctx) {
        console.info('============= get all drugs ===========');

        //  This is called for query all drugs

        const userType = await this.getCurrentUserType(ctx);

        let queryString = {
            'selector': {}  //  no filter;  return all all drugs -> for admins
        }
        
        if (userType === supplyChainActors.consumer){
            queryString = {
                'selector': {'currentState': DrugStates.RETAILER_RECEIVED} // for customers, they can see only drugs that currently is in the hands of the retailer (i.e. yet to be sold)
            }
        }

        console.log("Info Message from getAllDrugs: queryString = ", queryString);

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        console.log("Info Message from getAllDrugs: iterator = ", iterator);

        const allDrugs = [];

        while (true) {
            const drug = await iterator.next();

            if (drug.value && drug.value.value.toString()) {
                console.log(drug.value.value.toString('utf8'));

                // const Key = drug.value.key;
                let Record;
                try {
                    Record = JSON.parse(drug.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = drug.value.value.toString('utf8');
                }
                // allDrugs.push({ Key, Record });
                allDrugs.push(Record); // push to all drugs

                console.log("Info Message from getAllDrugs: Record = ", Record);
            }
            if (drug.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allDrugs);
                return JSON.stringify(allDrugs);
            }
        }
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
        if (userid === supplyChainActors.admin) {
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