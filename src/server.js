const express = require('express');
const bodyParser = require('body-parser');
const programmer = require('./database/tables/programmer');

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

app.listen(port, () => {
    console.log(`Now listening on port: ${port}`);
});

app.get('/syncDatabase', async (req, res) => {
    const database = require('./database/db');

    try {
        await database.sync();
        res.send('Database synced');
    } catch (error) {
        res.send('Error syncing database');
    }
});

app.post('/createProgrammer', async (req, res) => {
    try{
        const params = req.body;
        const properties = ['name', 'python', 'javascript', 'java'];
        validateProperties(properties, params, 'every');

        const newProgrammer = await programmer.create({
            name: params.name,
            python: params.python,
            javascript: params.javascript,
            java: params.java
        });

        res.send(newProgrammer);
    } catch (error) {
        res.send(error);
    }
});

app.get ('/retrieveProgrammer', async (req, res) => {
    try {
        const params = req.body;

        if ('id' in params){
            const record = await programmer.findByPk(params.id);
            
            if (record){
                res.send(record);
            } else {
                res.send('No record found');
            }

            return;
        }

        const records = await programmer.findAll();

        res.send(records);
    } catch (error){
        res.send(error);
    }
});

app.get('/getProgrammer', async (req, res) => {
    try {
        const params = req.body;
        
        if ('id' in params){
            const record = await programmer.findByPk(params.id);
            if (record){
                res.send(record);
            } else {
                res.send('No record found');
            }

            return;
        }

        const records = await programmer.findAll();
        res.send(records);
    } catch (error) {
        res.send(error);
    }
});

app.put('/updateProgrammer', async (req, res) => {
    try {
        const params = req.body;

        const record = await validateID(params);

        const properties = ['name', 'python', 'javascript', 'java'];
        
        validateProperties(properties, params, 'some');

        record.name = params.name || record.name;
        record.python = params.python || record.python;
        record.javascript = params.javascript || record.javascript;
        record.java = params.java || record.java;

        await record.save();

        res.send(`${record.id} ${record.name} - Updated Successfully`);
    } catch (error){
        res.send(error);
    }
});

app.delete('/deleteProgrammer', async (req, res) => {
    try{
        const params = req.body;

        const record = await validateID(params);

        record.destroy();

        res.send(`${record.id} ${record.name} - Deleted Successfully`);
    } catch (error) {
        res.send(error);
    }
});

const validateID = async (params) => {
    try {
        if (!('id') in params){
            throw 'Missing id';
        }

        const record = await programmer.findByPk(params.id);
        if (record){
            throw 'No record found';
        }

        return record;
    } catch (error) {
        throw error;
    }
}

const validateProperties = (properties, params, fn) => {
    try {
        const check = properties[fn]((property) => {
            return property in params;
        });

        if (!check){
            throw `Missing properties: ${properties.join(', ')}`;
        }

        return true;
    } catch (error) {
        throw error;
    }
}