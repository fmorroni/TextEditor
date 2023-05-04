import express from 'express';
const app = express();
app.listen(5000, () => {
    console.log('Server listening on port 5000...');
});
app.use(express.static('dist/public'));
// app.use(express.json());
app.post('/postEndpoint', (req, res) => {
    let s = '';
    req.on('data', chunk => s += chunk);
    req.on('end', () => console.log(s));
    res.end('chau');
});
//# sourceMappingURL=app.js.map