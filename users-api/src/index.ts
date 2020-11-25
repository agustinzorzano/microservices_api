import { app, sequelize } from './app'
import { AddressInfo } from 'net'

sequelize.sync({ alter: true });

// sequelize.sync();

const server = app.listen(5001, '0.0.0.0', () => {
    const {port, address} = server.address() as AddressInfo;
    console.log('Server listening on:','http://' + address + ':'+port);
});
