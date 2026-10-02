// Load-test credentials only — matches scripts/seed-load-test-users.js.
const POOL_SIZE = 50;
const PASSWORD = "loadtest123!";

function pickUser(context, events, done) {
    context.vars.username = `loadtest${Math.floor(Math.random() * POOL_SIZE)}`;
    return done();
}

function setBasicAuthHeader(requestParams, context, events, done) {
    const credentials = Buffer.from(`${context.vars.username}:${PASSWORD}`).toString("base64");
    requestParams.headers = { ...requestParams.headers, Authorization: `Basic ${credentials}` };
    return done();
}

module.exports = { pickUser, setBasicAuthHeader };
