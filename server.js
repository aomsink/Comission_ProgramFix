const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

require('./app/routes/commission.routes')(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});