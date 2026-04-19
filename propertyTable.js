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

    const data = JSON.parse(fs.readFileSync('Data/Properties.json', 'utf8'));
    //data.map(row => row = [row.Name.split('-')[0].split('(')[0], row.Properties]);
    //data.map(row => [row.Name.split('-')[0].split('(')[0], row.Properties]);
	
	await conn.execute('CREATE TABLE properties (' +
		'ind INT AUTO_INCREMENT,' +
		'id INT,' +
		'property VARCHAR(100),' +
		'CONSTRAINT pk_id PRIMARY KEY (ind),' +
		'CONSTRAINT fk_id FOREIGN KEY (id)' +
		'REFERENCES nutrition (id)' +
		')'
	);
	
	const rows = data.map(row => [row.nutrition_id, row.property]);
	
	await conn.query(
		'INSERT INTO properties' +
		'(id, property)' +
		'VALUES ?',
		[rows]
	);
	
	console.log(`Inserted ${rows.length} rows`);
	await conn.end();
 }
 
 importData();
	