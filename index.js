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
 * Processes a /apiDir/apis/{api-name} dir
 * @param credentials
 * @param dirPath
 * @returns {Promise.<*>}
 */
const processApiDir = async (credentials, dirPath) => {
    const promises = [];

    const items = fs.readdirSync(dirPath);

    if (items.length > 0) {
        const apiName = path.basename(dirPath);
        let opId = await apiMgmtApi.getIdByName(credentials, apiName);
        if(!opId) {
            opId = await apiMgmtApi.createApi(credentials, apiName, dirPath)
        }
        const apiRef = {
            id: opId,
            name: apiName,
        };

        items.forEach(item => {
            const itemAbsPath = `${dirPath}/${item}`;
            const itemStat = fs.statSync(itemAbsPath);

            if (item === API_FILENAME) {
                promises.push(
                    apiMgmtApi.setApi(
                        credentials,
                        apiRef,
                        fs.readFileSync(itemAbsPath, 'utf8')
                    )
                );
            }
        });
    }

    return Promise.all(promises);
};


/**
 * Sets apiDir by walking the apiDir dir tree, conventionally applying discovered policy.xml files
 * @param credentials
 * @returns {Promise.<*>}
 */
const setApis = async (credentials) => {
    const promises = [];
    const dirPath = '/apis';
    fs.readdirSync(dirPath).forEach(item => {
        const itemAbsPath = `${dirPath}/${item}`;

        switch (item) {
            case 'apis':
                promises.push(processApisDir(credentials, itemAbsPath));
                break;
            case API_FILENAME:
                promises.push(apiMgmt.setApi(credentials, fs.readFileSync(itemAbsPath, 'utf8')));
                break;
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