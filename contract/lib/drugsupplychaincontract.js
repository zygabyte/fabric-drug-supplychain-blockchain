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
     * @param {Context} ctx the transaction context
     * @param {string} drugId
     * @param {string} drugName
     * @param {float} price
     * @param {integer} quantity
     * @param {string} expiryDate
     * @param {string} prescription
     * @param {string} created
     * @param {string} manufacturerId
     * @param {string} distributorId
     * @param {string} wholesalerId
     * @param {string} retailerId
     * @param {string} timeStamp
     * @param {string} currentOwner
     * @param {string} transactionId
     * @param {boolean} isDeleted
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
        drug.created = drugDetails.created;
        drug.manufacturerId = userId;
        drug.setStateToDrugCreated();
        drug.currentOwner = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        console.info('============= manufacturerShipDrug ===========');

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
        const userId = await this.getCurrentUserId(ctx);
        
        // Change currentDrugState to MANUFACTURER_SHIPPED;
        drug.setStateToManufacturerShipped();
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.manufacturerId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        console.info('============= distributorReceiveDrug ===========');

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
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.distributorId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        const userId = await this.getCurrentUserId(ctx);
        
        // Change currentDrugState to DISTRIBUTOR_SHIPPED;
        drug.setStateToDistributorShipped();
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.distributorId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.wholesalerId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        const userId = await this.getCurrentUserId(ctx);
        
        // Change currentDrugState to WHOLESALER_SHIPPED;
        drug.setStateToWholesalerShipped();
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.wholesalerId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.retailerId = userId;
        drug.timeStamp = this.getCurrentDateTime();

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
        const userId = await this.getCurrentUserId(ctx);
        
        // Change currentDrugState to DRUG_SOLD;
        drug.setStateToDrugSold();
        // Track who exactly invoked this transaction
        drug.currentOwner = userId;
        drug.retailerId = userId;
        drug.timeStamp = this.getCurrentDateTime();

        // Update ledger
        await ctx.stub.putState(drugId, drug.toBuffer());

        // Must return a serialized drug to caller of smart contract
        return drug.toBuffer();
    }




    /**
     * queryDrug
     *
     * @param {Context} ctx the transaction context
     * @param {String}  drugId
     * Usage:  getDrug ('drug001')
     *
     */
    async queryDrug(ctx, drugId) {
        console.info('============= queryDrug ===========');

        if (!drugId || drugId.length < 1) {
            throw new Error('drugId is required as input')
        }

        // Access Control: This transaction should only be invoked by a designated retailer
        const userType = await this.getCurrentUserType(ctx);

        if (userType === supplyChainActors.consumer)
            throw new Error('Error Message from queryDrug: This consumer user cannot query drug');

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
    async queryDrugs(ctx) {
        console.info('============= queryDrugs ===========');

        const userType = await this.getCurrentUserType(ctx);

        if (userType === supplyChainActors.consumer)
            throw new Error('Error Message from queryDrugs: This consumer user cannot query drugs');

        const queryString = {
            'selector': {}  //  no filter;  return all drugs
        }

        console.log("Info Message from queryDrugs: queryString = ", queryString);

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        console.log("Info Message from queryDrugs: iterator = ", iterator);

        const allDrugs = [];

        while (true) {
            const drug = await iterator.next();

            if (drug.value && drug.value.value.toString()) {
                console.log(drug.value.value.toString('utf8'));

                let record;
                try {
                    record = JSON.parse(drug.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    record = drug.value.value.toString('utf8');
                }
                // allDrugs.push({ Key, record });
                allDrugs.push(record); // push to all drugs

                console.log("Info Message from getAllDrugs: record = ", record);
            }
            if (drug.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allDrugs);
                return JSON.stringify(allDrugs);
            }
        }
    }


    async queryDrugTransactionHistory(ctx, drugId) {
        console.info('============= queryDrugTransactionHistory ===========');
        if (drugId.length < 1) {
            throw new Error('drugId is required as input')
        }
        console.log("input, drugId = " + drugId);

        // Get list of transactions for drug
        const iterator = await ctx.stub.getHistoryForKey(drugId);
        const drugHistory = [];

        while (true) {
            const history = await iterator.next();

            if (history.value && history.value.value.toString()) {
                let record;
               
                try {
                    record = JSON.parse(history.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    record = history.value.value.toString('utf8');
                }
                
                record.transactionId = history.value.tx_id;
                record.isDeleted = history.value.is_delete.toString();

                // Add to array of transaction history on drug
                drugHistory.push(record);
            }

            if (history.done) {
                console.log('end of data');
                await iterator.close();
                console.info(drugHistory);
                return drugHistory;
            }
        } //  while (true)
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
        if (userid === supplyChainActors.admin)
            return userid;

        console.log('current user type is ', ctx.clientIdentity.getAttributeValue("usertype"));
        return ctx.clientIdentity.getAttributeValue("usertype");
    }

    /**
     * getCurrentUserId
     * To be called by application to get the id for a user who is logged in
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
    
    getCurrentDateTime() {
        return new Date().toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'});
    }
}