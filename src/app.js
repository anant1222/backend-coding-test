'use strict';
const express = require('express');
const app = express();
app.use(express.json());
const logger = require('../utils/logger').logs
module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));
    app.post('/rides', (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                logger.error("app.js::Time:" + moment().format('YYYY/MM/DD HH:MM:SS') + ", API:" + req.originalUrl + 'request:::' + JSON.stringify(req.body) + "::Message:ERROR::::" + err);
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    logger.error("app.js::Time:" + moment().format('YYYY/MM/DD HH:MM:SS') + ", API:" + req.originalUrl + 'request:::' + JSON.stringify(req.body) + "::Message:ERROR::::" + err);
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    app.get('/rides', async (req, res) => {
        const {start,limit}= await pagination(req)
        db.all(`SELECT * FROM Rides LIMIT ${limit} OFFSET ${start}`, function (err, rows) {
            if (err) {
                logger.error("app.js::Time:" + moment().format('YYYY/MM/DD HH:MM:SS') + ", API:" + req.originalUrl + 'request:::' + JSON.stringify(req.query) + "::Message:ERROR::::" + err);
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                logger.error("app.js::Time:" + moment().format('YYYY/MM/DD HH:MM:SS') + ", API:" + req.originalUrl + 'request:::' + JSON.stringify(req.params) + "::Message:ERROR::::" + err);
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};



async function pagination(req){
    try {
    const limit = req.query.length ||  10;
    let start =  0
    if((req.query.page) &&  (req.query.page != 0 && req.query.page != 1)){
        req.query.page--
        start = req.query.page * limit + 1
    }
    console.log('start:::::',start)
    console.log('limit:::::',limit)
    return {start,limit}
} catch (error) {
    logger.error("app.js::Time:" + moment().format('YYYY/MM/DD HH:MM:SS') + ", API:" + req.originalUrl + 'request:::' + JSON.stringify(req.query) + "::Message:ERROR::::" + error);
}
}