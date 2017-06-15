    // Get dependencies
    const express = require('express');
    const path = require('path');
    const http = require('http');
    const bodyParser = require('body-parser');
    const firebase = require('firebase-admin');
    const indico = require('indico.io')


    // Get API routes from api file in routes folder
    const api = require('./server/routes/api');

    const app = express();

    const negativeBill = [];
    const negativeLogin = [];
    const negativeUsagePlan = [];
    const negativeNativeDevice =[];
    const positive = [];

    // Parsers for POST data
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Point static path to dist so compiled files moved to dist folder on app build
    app.use(express.static(path.join(__dirname, 'dist')));

    // Set our api routes
    app.use('/api', api);

    // Catch all other routes and return the index file; invalid urls redirected to homepage
    app.get('*', (req, res) => {

        res.sendFile(path.join(__dirname, 'dist/index.html'));
    });

    /**
     * Get port from environment and store in Express.
     */
    const port = process.env.PORT || '3000';
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app);



    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port, () => console.log(`API running on localhost:${port}`));

    var settings = {"api_key": "70fa9c87529dc0cd4e5dc150938f744e"};

    var batchInput = [
        "This app is not that great. Billing crashes sometimes",
        "Telus does listen, the issue from previous release was quickly fixed.",
        "I can't pay my bill",
        "I can't login since new update",
        "Keeps crashing everytime I try to pay bills",
        "Great app! Best out of most telecoms",
        "keeps showing an error on offers page",
        "bill expensive crash android"
    ];

    const appSectionsDict = [
        "bill", "billing", "login", "usage", "data",
        "top-up", "android", "site", "mobile", "offers",
        "iphone", "travelpass", "travel", "plan", "plans",
        "device", "overage", "surcharge", "overcharged",
    ];

    const negativeKeywordsDict = [
        "expensive", "crash", "crashes", "crashed", "crashing",
        "pricey", "fuck", "shit", "error", "bugs",
        "bug", "outages", "outage", "slow", "glitchy"
    ]

    var sentimentResponse = function(res) {

        for (var i = 0; i < res.length; i++) {

            console.log(res[i]);

            if (res[i] > 0.7) {
                console.log("positive")
                // write to json with positive sentiment tag
            }
            else if (res[i] > 0.4 && res[i] < 0.7) {
                console.log("neutral")
                // write to json with neutral sentiment tag
            }
            else {
                console.log("negative")
                // write to json with negative sentiment tag
            }
        }
    }

    var keywordsResponse = function (res) {
        for (var i = 0; i < res.length; i++) {
            let keys = Object.keys(res[i]);
            for (var j = 0 ; j < keys.length; j++) {
                let key = keys[j];
                if (negativeKeywordsDict.indexOf(key.toString()) > -1) {
                   // console.log("keyword found: " + key);
                    // write to json with negative keyword tag
                }
                 //filter by app sections
                if (appSectionsDict.indexOf(key.toString()) > -1) {
                   // console.log("section found: " + key)
                    // put NEGATIVE stuff into right department array
                    if(key == "bill" || key == "billing" || key == "overcharged" || key == "surcharge")
                    {
                        negativeBill.push(batchInput[i]);
                    }
                    else if(key == "login" )
                    {
                        negativeLogin.push(batchInput[i]);
                    }
                    else if(key == "usage" || key == "data" || key == "plan" || key == "plans" || key == "overage" 
                        || key == "offers" || key == "top-up" || key == "travel" || key == "travelpass" )
                    {
                        negativeUsagePlan.push(batchInput[i]);
                    }
                    else if(key == "android" || key == "iphone" || key == "device")
                    {
                        negativeNativeDevice.push(batchInput[i]);
                    }

                }
            }
        }
    }

    var superResponse = function(res) {

        for (var i = 0; i < res.length; i++) {

           // console.log(res[i]);

            if (res[i] < 0.4) {

                //console.log(batchInput[i]);
               // console.log("negative");
                // write to json with positive sentiment tag

                // get keywords
                console.log("less than 0.4");
                indico.keywords(batchInput, settings)
                     .then(keywordsResponse);

            }
            else if (res[i] > 0.4 && res[i] < 0.7) {
                //console.log(batchInput[i]);

                //console.log("neutral");

                // write to json with neutral sentiment tag

                // get keywords
                console.log("greater than 0.4");
                indico.keywords(batchInput, settings)
                     .then(keywordsResponse);
            }
            else {

                //console.log(batchInput[i]);
                //console.log("positive");
                positive.push(batchInput[i]);
               // console.log(positive);
            
            }
        }

        console.log("Negative feedbacks for billing: " + negativeBill);
        console.log("Negative feedbacks for login: " + negativeLogin);
        console.log("Negative feedbacks for usage or plans: " + negativeUsagePlan);
        console.log("Negative feedbacks for native devices: " + negativeNativeDevice);
        console.log("Postive feedbacks: " + positive);


    }
                

    var logError = function(err) {
        console.log(err);
    }

     indico.sentiment(batchInput, settings)
         .then(superResponse)
         .catch(logError);

    // indico.emotion(batchInput, settings)
    //     .then(emotionResponse)
    //     .catch(logError);

    // indico.keywords(batchInput, settings)
    //     .then(keywordsResponse)
    //     .catch(logError);

