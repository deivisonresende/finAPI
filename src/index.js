const express = require('express');

const app = express();

app.use(express.json());


const port = 3333;
app.listen(port, () => console.log(`Server listening on port ${port}`));
