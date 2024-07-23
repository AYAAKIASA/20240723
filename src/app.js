import express from 'express'

const app = express();
const port = 3000;

app.get(path: '/', (req, res): Response<Any, Record<String
retrun res.json(body: 'hello');
});

app.listen{port, (): void => {
    console.log(message:'Server is listening on ${port}');
}};
