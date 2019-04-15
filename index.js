const msRestAzure = require('ms-rest-azure');
const fs = require('fs');
const apiMgmtApi = require('./apiMgmtApi');
const path = require('path');

const API_FILENAME = 'swagger.json';


/******* log in **********/
const login = async () => {
    console.log('logging in');

    const loginType = process.env.loginType;
    const loginId = process.env.loginId;
    const loginSecret = process.env.loginSecret;

    let response;
    if (loginType === 'sp') {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/lib/login.js#L414
        response = await msRestAzure.loginWithServicePrincipalSecret(loginId, loginSecret, process.env.loginTenantId);
    } else {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/index.d.ts#L376
        response = await msRestAzure.loginWithUsernamePassword(loginId, loginSecret, {domain: process.env.loginTenantId});
    }

    console.log('login successful');

    return response;
};
/******* log in **********/

/**
 * Processes the /apiDir/apis dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApisDir = async (credentials, dirPath) => {
    const promises = [];
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;
        const itemStat = fs.statSync(itemAbsPath);

        if (itemStat.isDirectory()) {
            promises.push(
                processApiDir(credentials, itemAbsPath)
            );
        }
    });
    return Promise.all(promises);
};

/**
 * Processes a /resources/apis/{api-name} dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApiDir = async (credentials, dirPath) => {
    const items = fs.readdirSync(dirPath);

    if (items.length > 0) {
        const apiName = path.basename(dirPath);
        let opId = await apiMgmtApi.getIdByName(credentials, apiName);
        if(!opId) {
            opId = await apiMgmtApi.createApi(apiName, dirPath)
        }
        const apiRef = {
            id: opId,
            name: apiName,
        };

        items.forEach(async item => {
            const itemAbsPath = `${dirPath}/${item}`;

            if (item === API_FILENAME) {
                await apiMgmtApi.setApiSwagger(apiRef, fs.readFileSync(itemAbsPath, 'utf8'));
                await apiMgmtApi.updateApiPath(apiRef, fs.readFileSync(itemAbsPath, 'utf8'));
            }
        });
    }
};


/**
 * Sets apisDir by walking the /resources dir tree
 * @param credentials
 * @returns {Promise.<*>}
 */
const setApis = async (credentials) => {
    const promises = [];
    const dirPath = '/resources';
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;

        if (item === 'apis') {
            promises.push(processApisDir(credentials, itemAbsPath));
        }
    });
    return Promise.all(promises);
};

login()
    .then(credentials => setApis(credentials))
    .catch(error => {
        console.log(error);
        process.exit(1)
    });