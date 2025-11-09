const app = require('./app');

// app.listen(3000);
// console.log('Server is running on port 3000');

app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor escuchando en el puerto 3000');
});