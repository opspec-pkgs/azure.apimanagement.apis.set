const msRestAzure = require('ms-rest-azure');
const {URL} = require('url');
const axios = require('axios');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const jsYaml = require('js-yaml');

class ApiMgmtApi {
    async setApiSwagger(credentials, apiRef, apiContent) {
        const url = new URL(
            `https://${process.env.apiManagementServiceName}.management.azure-api.net/` +
            `apis/${apiRef.id}/` +
            `?api-version=2017-03-01` +
            '&import=true');
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        const headers = {};
        headers['Authorization'] = `${process.env.sasToken}`;
        headers['Content-Type'] = `${process.env.contentType}`;
        headers['If-Match'] = '*';
		
		let options = {
            method: 'PUT',
            url: url.href,
			headers,
            data: apiContent
        };


        const result = await axios(options)
        .catch(function (error) {
            throw new Error(`error applying swagger for api '${apiRef.name}'; error message: ${error.response.data.error.details[0].message}`);
        });

        console.log(`apply swagger for api '${apiRef.name}' successfully`);
    };

    async getIdByName(credentials, apiName) {
        const url = new URL(
            'https://management.azure.com/' +
            `subscriptions/${process.env.subscriptionId}/` +
            `resourceGroups/${process.env.resourceGroup}/` +
            'providers/Microsoft.ApiManagement/' +
            `service/${process.env.apiManagementServiceName}/` +
            `apis` +
            '?api-version=2017-03-01');

        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);

        let options = {
            method: 'GET',
            url: url.href,
        };

        const result = await azureServiceClient.sendRequest(options);

        if (result.error) {
            throw new Error(JSON.stringify(result.error));
        }

        let operationId;
        for (let i = 0; i < result.value.length; i++) {
            const item = result.value[i];
            if (item.properties.displayName === apiName) {
                operationId = item.name;
                break;
            }
        }
        return operationId;
    }

    async createApi(credentials, apiName, dirPath) {
        let newApiId = uuidv4().replace(/-/g, "").slice(8)
        let swaggerFile = jsYaml.safeLoad(fs.readFileSync(`${dirPath}/swagger.json`, 'utf8'))

        const url = new URL(
            `https://${process.env.apiManagementServiceName}.management.azure-api.net/` +
            `apis/${newApiId}/` +
            `?api-version=2017-03-01`);
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);
        const data = {
            "path": `${swaggerFile["x-basePath"]}`,
            "protocols": swaggerFile.schemes,
            "name": swaggerFile.info.title
        }
        const headers = {};
        headers['Authorization'] = `${process.env.sasToken}`;
        headers['Content-Type'] = `application/json`;
        
        let options = {
            method: 'PUT',
            url: url.href,
            headers,
            data: data
        };

        const result = await axios(options)
        .catch(function (error) {
            throw new Error(`error creating api '${apiName}'; error message: ${error.response.data.error.details[0].message}`);
        });

        let operationId;
        return operationId = result.data.id.substr(6);
    };

    async updateApiPath(credentials, apiRef, apiContent, dirPath) {
        let swaggerFile = jsYaml.safeLoad(apiContent)

        const url = new URL(
            `https://${process.env.apiManagementServiceName}.management.azure-api.net/` +
            `apis/${apiRef.id}/` +
            `?api-version=2017-03-01`);
        
        const azureServiceClient = new msRestAzure.AzureServiceClient(credentials);
        const data = {
            "path": `${swaggerFile["x-basePath"]}`
        }
        const headers = {};
        headers['Authorization'] = `${process.env.sasToken}`;
        headers['Content-Type'] = `application/json`;
        headers['If-Match'] = '*';
        
        let options = {
            method: 'PATCH',
            url: url.href,
            headers,
            data: data
        };

        const result = await axios(options)
        .catch(function (error) {
            throw new Error(`error updating url suffix(path) for api '${apiRef.name}'; error message: ${error.response.data.error.details[0].message}`);
        });

        console.log(`update url suffix(path) for api '${apiRef.name}' successfully`);
    };
}

// export singleton
module.exports = new ApiMgmtApi();