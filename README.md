Express Middleware to Validate Requests

### Usage Example

```javascript
const express = require('express');
const app = express();
const arbitrate = require('./lib/arbitrate.js');
const _ = require('lodash');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/',
    arbitrate.validateRequest({
        info: {
            type: arbitrate.type.CustomObject({
                name: {
                    type: arbitrate.type.String,
                    required: true
                },
                age: {
                    type: arbitrate.type.Integer,
                    required: true
                },
                kids: {
                    type: arbitrate.type.ArrayOf(
                        arbitrate.type.ArrayOf(arbitrate.type.Integer)
                    ),
                    required: true
                }
            }),
            location: arbitrate.location.Body,
            required: true
        }
    }),
    (req, res) => {
        return res.status(200).send({message: 'Success!'});
    }
);

app.listen(2525, () => {
    console.log('App listening on port: 2525');
});

```