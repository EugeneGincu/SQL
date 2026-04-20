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

    const data = JSON.parse(fs.readFileSync('./Data/Nutrition.json', 'utf8'));
    
    data.forEach(row => {
			row.Channels = row.Channels.replaceAll('?','').replaceAll('Pancreas','PN').replaceAll('Adrenal','AD').replaceAll('Uterus','PS').replaceAll(', others','');
			row.Name = row.Name.split('-')[0].split('(')[0].trim();
		}
	);

    await conn.execute('CREATE TABLE IF NOT EXISTS nutrition (' +
        'id INT PRIMARY KEY,' +
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
		
	let index = 0;
	
    const nutritionRows = data.map(item => [
        index++, item.Name, item.Temp, item.Type, item.Channels, item.Tonifies,
        item.Properties, item.Pacifies, item.Aggravates, item.Chakra, item.Notes
    ]);

    await conn.query(
        'INSERT INTO nutrition (id, name, temp, type, channels, tonifies, properties, pacifies,'+
        'aggravates, chakra, notes) VALUES ?',
        [nutritionRows]
    );

    console.log(`Inserted ${nutritionRows.length} rows.`);
	
	//Tables
	const propertyRows = [];
	const channelRows = [];
	
	
	nutritionRows.forEach(row =>{ 
    if (row[6] && row[6].trim()) {
        row[6].split(',').forEach(prop => {
            propertyRows.push([row[0], prop.trim()]);
        });
    }
	
	if (row[4] && row[4].trim()) {
		row[4].split(',').forEach(prop => {
			channelRows.push([row[0], prop.trim()]);
		});
	}
	
	});
	
	await createPropertiesTable(conn, propertyRows);
	await createChannelsTable(conn, channelRows);


//fs.writeFileSync('Data/Properties.json', JSON.stringify(propertyRows, null, 2));
//console.log(`Generated ${propertyRows.length} property rows.`);
	
    await conn.end();
}

async function createPropertiesTable(conn, propertyRows) {
	//Property table creation and insertion
	await conn.execute('CREATE TABLE properties (' +
		'ind INT AUTO_INCREMENT,' +
		'id INT,' +
		'property VARCHAR(100),' +
		'CONSTRAINT pk_properties_ind PRIMARY KEY (ind),' +
		'CONSTRAINT fk_properties_id FOREIGN KEY (id)' +
		'REFERENCES nutrition (id)' +
		')'
	);
	
	await conn.query(
		'INSERT INTO properties' +
		'(id, property)' +
		'VALUES ?',
		[propertyRows]
	);
	
	console.log(`Inserted ${propertyRows.length} rows`);

	
		
}

async function createChannelsTable(conn, channelRows) {
	//Channel table creation and insertion
	await conn.execute('CREATE TABLE channels (' +
		'ind INT AUTO_INCREMENT,' +
		'id INT,' +
		'channel ENUM("LU", "ST", "SP", "HT", "SI", "LI", "UB", "KD", "LV", "GB", "PC", "SJ", "PN", "AD", "PS"),' +
		'CONSTRAINT pk_channels_ind PRIMARY KEY (ind),' +
		'CONSTRAINT fk_channels_id FOREIGN KEY (id)' +
		'REFERENCES nutrition (id)' +
		')'
	);
	
	await conn.query(
		'INSERT INTO channels' +
		'(id, channel)' +
		'VALUES ?',
		[channelRows]
	);
	
	console.log(`Inserted ${channelRows.length} rows`);
}


importData();