/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

const PRIVATE_DATA_COLLECTION1 = "assetPrivateCollection"

class AssetTransfer extends Contract {

    async InitPrivateData(ctx) {
        const assets = [
            {
                ID: 'asset101',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
                AppraisedValue: 300,
            },
            {
                ID: 'asset102',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
                AppraisedValue: 400,
            },
            {
                ID: 'asset103',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
                AppraisedValue: 500,
            },
            {
                ID: 'asset104',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
                AppraisedValue: 600,
            },
            {
                ID: 'asset105',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
                AppraisedValue: 700,
            },
            {
                ID: 'asset106',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
                AppraisedValue: 800,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putPrivateData(PRIVATE_DATA_COLLECTION1, asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }

    }

    // GetAllPrivateData returns all assets found in the private data collection
    async GetAllPrivateData(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const privateQueryResponse = await ctx.stub.getPrivateDataByRange(PRIVATE_DATA_COLLECTION1, '', '');
        const iterator = privateQueryResponse.iterator
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreatePrivateData(ctx) {
        const transientMap = ctx.stub.getTransient()

        const asset = {
            ID: transientMap.get('ID').toString(),
            Color: transientMap.get('Color').toString(),
            Size: transientMap.get('Size').toString(),
            Owner: transientMap.get('Owner').toString(),
            AppraisedValue: transientMap.get('AppraisedValue').toString(),
        };

        await ctx.stub.putPrivateData(PRIVATE_DATA_COLLECTION1, asset.ID, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);

    }

    // ReadPrivateData returns the asset stored in the private data with given id.
    async ReadPrivateData(ctx, id) {
        const assetJSON = await ctx.stub.getPrivateData(PRIVATE_DATA_COLLECTION1, id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdatePrivateData updates an existing asset in the private collection with provided parameters.
    async UpdatePrivateData(ctx) {
        const transientMap = ctx.stub.getTransient()
        const id = transientMap.get('ID').toString()

        const exists = await this.PrivateDataExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist in the private data collection`);
        }

        const updatedAsset = {
            ID: id,
            Color: transientMap.get('Color').toString(),
            Size: transientMap.get('Size').toString(),
            Owner: transientMap.get('Owner').toString(),
            AppraisedValue: transientMap.get('AppraisedValue').toString(),
        };

        return ctx.stub.putPrivateData(PRIVATE_DATA_COLLECTION1, id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // TransferPrivateData updates an existing asset in the private collection with provided owner name.
    async TransferPrivateData(ctx) {
        const transientMap = ctx.stub.getTransient()
        const id = transientMap.get('ID').toString()
        const newOwner = transientMap.get('Owner').toString()

        const exists = await this.PrivateDataExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist in the private data collection`);
        }

        const assetString = await this.ReadPrivateData(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;

        return ctx.stub.putPrivateData(PRIVATE_DATA_COLLECTION1, id, Buffer.from(JSON.stringify(asset)));
    }


    // PrivateDataExists returns true when asset with given ID exists in world state.
    async PrivateDataExists(ctx, id) {
        const assetJSON = await ctx.stub.getPrivateData(PRIVATE_DATA_COLLECTION1, id);
        return assetJSON && assetJSON.length > 0;
    }

    async InitLedger(ctx) {
        const assets = [
            {
                ID: 'asset1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
                AppraisedValue: 300,
            },
            {
                ID: 'asset2',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
                AppraisedValue: 400,
            },
            {
                ID: 'asset3',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
                AppraisedValue: 500,
            },
            {
                ID: 'asset4',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
                AppraisedValue: 600,
            },
            {
                ID: 'asset5',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
                AppraisedValue: 700,
            },
            {
                ID: 'asset6',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
                AppraisedValue: 800,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, color, size, owner, appraisedValue) {
        const asset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
