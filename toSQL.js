const fs = require('fs');
const mysql = require('mysql2/promise');

async function importData() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'csnation',
        //database: 'nutrition'
    });
    
    await conn.query('CREATE DATABASE IF NOT EXISTS nutrition');
	await conn.query('USE nutrition');

    const data = JSON.parse(fs.readFileSync('Data/Nutrition.json', 'utf8'));
    
    data.forEach(row => row.Channels = row.Channels.replaceAll('?','').replaceAll('Pancreas','PN').replaceAll('Adrenal','AD').replaceAll('Prostate','PS'));

    await conn.execute('CREATE TABLE IF NOT EXISTS nutrition (' +
        'id INT AUTO_INCREMENT PRIMARY KEY,' +
        'name VARCHAR(500),' +
        'temp VARCHAR(100),' +
        'type VARCHAR(100),' +
        'channels VARCHAR(200),' +
        'tonifies VARCHAR(200),' +
        'properties VARCHAR(200),' +
        'pacifies VARCHAR(200),' +
        'aggravates VARCHAR(200),' +
        'chakra VARCHAR(200),' +
        'notes TEXT' +
        ')  ');

    const rows = data.map(item => [
        item.Name, item.Temp, item.Type, item.Channels, item.Tonifies,
        item.Properties, item.Pacifies, item.Aggravates, item.Chakra, item.Notes
    ]);

    await conn.query(
        'INSERT INTO nutrition (name, temp, type, channels, tonifies, properties, pacifies,'+
        'aggravates, chakra, notes) VALUES ?',
        [rows]
    );

    console.log(`Inserted ${rows.length} rows.`);
    await conn.end();
}

importData();