const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const chai = require('chai');
chai.use(require('chai-json-schema-ajv'));

axios.defaults.baseURL = 'https://jsonplaceholder.typicode.com';

function readFile(path) {
    return fs.promises.readFile(path, 'utf8')
        .then((data) => JSON.parse(data));
}

describe('API Tests', () => {
    it('create user', async () => {
        let userData = await readFile('./schemas/post/rq.json');
        let jsonData = await readFile('./schemas/post/rs.schema')

        let postResponse = await axios.post('/users', userData)
            .then((response) => response);
        
        chai.expect(postResponse.data).to.be.jsonSchema(jsonData);
    })

    it('validate user data ', async () => {
        let schema = await readFile('./schemas/get/rs.schema');

        let userData = await axios.get('/users')
            .then((response) => response.data);

        chai.expect(userData).to.be.jsonSchema(schema);
    })

    it('create new user with missing data', async () => {
        let userData = await readFile('./schemas/post/rq.json');

        delete userData.name;
        delete userData.username;

        let postResponse = await axios.post('/users', userData)
            .then((response) => response);

        assert.strictEqual(postResponse.status, 201);

        chai.expect(postResponse.data).to.not.have.property("name");
        chai.expect(postResponse.data).to.not.have.property("username");
    })


    it('delete user', async () => {
        let userId = 10;
        let deleteResponse = await axios.delete(`/users/${userId}`, { data: { "id": userId } })
            .then((response) => response);
        assert.strictEqual(deleteResponse.status, 200);
        chai.expect(deleteResponse.data).to.be.validJsonSchema;
    })
})