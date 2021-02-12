const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'fljota colored sharing token and smart sharing contract API',
        version: '0.1.0',
        description:
            'Interact with HTS, IOTA, ETH2, DB and Local Backend via RestAPI',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
            name: 'Adam A. Siwy',
            url: 'https://fljota.network',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'localhost API',
        },
        {
            url: 'http://api.fljota.network:3000',
            description: 'Nightly API',
        },
    ],
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-access-token',
            }
        }
    },
    security: {
        ApiKeyAuth: []
    }
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const fs = require('fs');
const jwt = require("jsonwebtoken");
const path = require("path");
const { AccountCreateTransaction, TokenMintTransaction, Client, TransferTransaction, Hbar, PublicKey, PrivateKey, AccountBalanceQuery, TokenId, TokenCreateTransaction, AccountId, TokenAssociateTransaction } = require("@hashgraph/sdk");

const readJWT = fs.readFileSync('./jwt.key', 'utf-8');
const SECRET = '1234567890';

const TEASER = `
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLJJFoooaaaaoootFJJLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLJtoaaaaaaaaaaaaaaaaaaaoFJLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLJoaaaaaaaaaaaaaaaaaaaaaaaaaaaFJLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLFaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaoJLLLLLLLLL
LLLLLLLLLLLLLLLLLLFaaaaaaaaaaaaotFJJJJJJFFoaaaaaaaaaaaaoJLLLLLLL
LLLLLLLLLLLLLLLLJoaaaaaaaaaatJLLLLLLLLLLLLLLJJoaaaaaaaaaaFLLLLLL
LLLLLLLLLLLLLLLLaaaaaaaaaoJLLLLLLLLLLLLLLLLLLLLLoaaaaaaaaaoLLLLL
LLLLLLLLLLLLLLJaaaaaaaaaJLLLLLLLLLLLLLLLLLLLLLLLLLoaaaaaaaaoLLLL
LLLLLLLLLLLLLLoaaaaaaaoJLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaoooJLLL
LLLLLLLLLLLLLJaaaaaaaaJLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJJLLLLLLLLLL
LLLLLLLLLLLLLoaaaaaaaFLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLaaaaaaaaJLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJJLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJoooaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLJaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LJoaaaaaaaaaaaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJJJJJJJJLL
JaaaaaaaaaaaaaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
JaaaaaaaaaaaaaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LJoaaaaaaaaaaaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
LLLLLLLLLLLJJaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJtttttttFLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaaaaaaaLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLaaoootFJLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLFaaaaaaaoLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLoaaaaaaaoLL
LLLLLLLLLLLLLLLLJJJJFJLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJaaaaaaaaFLL
LLLLLLLLLLLLLJaaaaaaaaJLLLLLLLLLLLLLLLLLLLLLLLLLLLLLoaaaaaaaaJLL
LLLLLLLLLLLLLLoaaaaaaaaJLLLLLLLLLLLLLLLLLLLLLLLLLLLtaaaaaaaaFLLL
LLLLLLLLLLLLLLLoaaaaaaaaFLLLLLLLLLLLLLLLLLLLLLLLLJoaaaaaaaaoLLLL
LLLLLLLLLLLLLLLLoaaaaaaaaaFJLLLLLLLLLLLLLLLLLLLJoaaaaaaaaaFLLLLL
LLLLLLLLLLLLLLLLLoaaaaaaaaaaoFJLLLLLLLLLLLLLJFoaaaaaaaaaaJLLLLLL
LLLLLLLLLLLLLLLLLLJoaaaaaaaaaaaaotFFJJFFFooaaaaaaaaaaaatLLLLLLLL
LLLLLLLLLLLLLLLLLLLLJoaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaatJLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLJtaaaaaaaaaaaaaaaaaaaaaaaaaaoJLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLJFoaaaaaaaaaaaaaaaaaaooJLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLJJFtoooooootFJJLLLLLLLLLLLLLLLLLLL

fljota.network B2B backend 0.1.0
`
// app.use(cors());
console.log("CORS Activated");

app.use(cors({
    origin: ['http://localhost:4000', 'https://localhost:4001']
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/assets/index.html'));
})

app.listen(port, () => {
    console.log(`${TEASER} \n-> fljota.network B2B Hedera Token Service Backend at http://localhost:${port} \n-> XS2A dokumentation at http://localhost:${port}/doc/\n`)
})

//swaggerDocument
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 *  tags:
 *      name: Account
 *      description: Routes to interact with the fljota.network accounts in HTS
 */

/**
 * @swagger
 * /newAccount:
 *   get:
 *     summary: Generates new Hedera Account via fljota.network HTS .
 *     description: Generates new Account Credentials and returns JWT signed with SECRET
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: Balance in account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/newAccount', async (req, res) => {

    if (!readJWT) {
        // TODO Reads JWT from Server node root 
        return res.send("no JWT from server FS...");
    }
    else {

        try {
            jwt.verify(readJWT, SECRET, (err, account) => {
                console.debug("JWT Credentials are beeing generated:")

                newaccountsfortoken(account).then(

                    jwttoken => res.json({ 'jwt': jwttoken })
                );
                // return res.json();

            });
        }
        catch (err) {
            res.json({ 'error': err })
            console.debug(err);
            console.log('JWT could not be verified - Invalid signature or wront Secret')

        }
    }

})

async function newaccountsfortoken(account) {

    const privateKey = await PrivateKey.generate();
    const publicKey = privateKey.publicKey;

    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(account.ACCOUNT_ID), PrivateKey.fromString(account.PRIVATE_KEY));
    // client.setOperator(AccountId.fromString(readJWT.ACCOUNT_ID), PrivateKey.fromString(readJWT.PRIVATE_KEY));

    //Create the transaction
    const transaction = new AccountCreateTransaction()
        .setKey(privateKey.publicKey);


    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the account ID
    const newAccountId = receipt.accountId;

    let accountcredentials = {
        "ACCOUNT_ID": newAccountId.toString(),
        "PUBLIC_KEY": publicKey.toString(),
        "PRIVATE_KEY": privateKey.toString()
    }
    let jwtaccount = jwt.sign(accountcredentials, SECRET)
    console.log(jwtaccount);

    // FOR DEMO Purposes also generate .key files on server. Do not use in Production!!!
    fs.writeFile('jwt.' + newAccountId.toString() + '.key', jwtaccount, function (err) {
        if (err) return console.log(err);
    });

    return jwtaccount
};

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getAccount:
 *   get:
 *     summary: Checkes Balance of the provided Account.
 *     description: Returns the accout's balance of hbar and tokens for the provided JWT Credentaial.
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: Balance in account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/getAccount', (req, res) => {

    const xs2aJWT = req.headers["x-access-token"];
    console.debug("verified JWT from Header, but not checked")

    if (!xs2aJWT) {
        // TODO Header should be validated if provided JWT Data is walid bevor checking 
        return res.send("no JWT");
    }
    else {

        try {
            jwt.verify(xs2aJWT, SECRET, (err, account) => {
                console.debug("checking balance of account:" + account.ACCOUNT_ID)
                const abalance = getAccount(account).then(
                    balance => res.json({ balance })
                );
            });
        }
        catch (err) {
            res.json({ 'error': 'JWT could not be verified - Invalid signature or wront Secret' })
            console.log('JWT could not be verified - Invalid signature or wront Secret')
        }
    }

})

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getTokens:
 *   get:
 *     summary: Returns hbar and colored tokens in provided Account.
 *     description: Returns the account's balance of hbar and tokens for the provided JWT Credentaial.
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getTokens', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 *  tags:
 *      name: Configuration
 *      description: Routes for tokenizing fljota items accounts in HTS
 */

/**
 * @swagger
 * /getConfig:
 *   get:
 *     summary: Mocked Backend Types.
 *     description: Returns JSON with 0 - 4 mocked Backend Types.
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getConfig', (req, res) => {

    try {
        const status = {
            "status": "ok",
            0: 'local',
            1: 'database',
            2: 'HTS',
            3: 'WASP',
            4: 'ETH2',
        }
        res.json(status)
    }
    catch (err) {
        res.json({ 'error': err })
    }

})

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 *  tags:
 *      name: Item-Tokens
 *      description: Routes for tokenizing fljota items accounts in HTS
 */


/**
 * @swagger
 * /newToken:
 *   get:
 *     summary: Creates new Token from given item.
 *     description: Creates new Token from item with details.
 *     tags: [Item-Tokens]
 *     responses:
 *       200:
 *         description: newToken.
 */
app.get('/newToken', (req, res) => {


    const xs2aJWT = req.headers["x-access-token"];
    console.debug("verified JWT from Header, but not checked")

    if (!xs2aJWT) {
        // TODO Header should be validated if provided JWT Data is walid bevor checking 
        return res.send("no JWT");
    }
    else {
        try {

            jwt.verify(xs2aJWT, SECRET, (err, account) => {

                const jwt = fljotatoken2account(account).then(
                    value => res.send(value)
                );

            });
        }
        catch (err) {
            res.json({ 'error': err })
        }

    }
});

async function getAccount(account) {

    const client = Client.forTestnet();

    client.setOperator(AccountId.fromString(account.ACCOUNT_ID), PrivateKey.fromString(account.PRIVATE_KEY));

    const query = new AccountBalanceQuery()
        .setAccountId(account.ACCOUNT_ID);

    const accountBalance = await query.execute(client);

    return {
        "coloredtoken": JSON.parse(accountBalance.tokens.toString())
    }

}

async function createToken(account) {

    const client = Client.forTestnet();

    client.setOperator(AccountId.fromString(account.ACCOUNT_ID), PrivateKey.fromString(account.PRIVATE_KEY));

    const transaction = await new TokenCreateTransaction()
        .setTokenName("FLJOTA ITEM")
        .setTokenSymbol("FLJ")
        .setTreasuryAccountId(account.ACCOUNT_ID)
        .setSupplyKey(PrivateKey.fromString(account.PRIVATE_KEY))
        .setInitialSupply(1000)
        .execute(client);

    const receipt = await transaction.getReceipt(client);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);

}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getDepositToken:
 *   get:
 *     summary: Deposits a Token for Item
 *     description: DEMO
 *     tags: [Item-Tokens]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getDepositToken', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /returnDepositToken:
 *   get:
 *     summary: Returns Deposit in standard sharing.
 *     description: DEMO
 *     tags: [Item-Tokens]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/returnDepositToken', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /refundDepositToken:
 *   get:
 *     summary: Refund Deposit in broke sharing.
 *     description: DEMO
 *     tags: [Item-Tokens]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/refundDepositToken', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /postInitialShare:
 *   post:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Sharing]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/postInitialShare', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /postSharingContract:
 *   post:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Sharing]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/postSharingContract', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /postReSharing:
 *   post:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Sharing]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/postReSharing', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getSharingTypes:
 *   get:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Sharing]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getSharingTypes', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getQualityCheck:
 *   get:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Sharing]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getQualityCheck', (req, res) => {
    res.json({
        'demo':'demo'
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /postSharingHandshake:
 *   post:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Handshake]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/postSharingHandshake', (req, res) => {
    res.json({
        'demo':'demo'
    });
});
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /getHandshakeInfo:
 *   get:
 *     summary: DEMO
 *     description: DEMO
 *     tags: [Handshake]
 *     responses:
 *       200:
 *         description: Balance in account.
 */
app.get('/getHandshakeInfo', (req, res) => {
    res.json({
        'demo':'demo'
    });
});







