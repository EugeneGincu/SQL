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
        'id INT AUTO_INCREMENT PRIMARY KEY,' +
        'name VARCHAR(500),' +
        'temp VARCHAR(100),' +
        'type VARCHAR(100)' +
		')  ');
        //'channels VARCHAR(200),' +
        //'tonifies VARCHAR(200),' +
        //'properties VARCHAR(200),' +
        //'pacifies VARCHAR(200),' +
        //'aggravates VARCHAR(200),' +
        //'chakra VARCHAR(200),' +
        //'notes TEXT' +
        
		
	let index = 0;
	
    const nutritionRows = data.map(item => [
        item.Name, item.Temp, item.Type, 
		//item.Channels, item.Tonifies,item.Properties, item.Pacifies, item.Aggravates, item.Chakra, item.Notes
    ]);

	const fullRows = data.map((item,i) => [
		i+1, item.Channels, item.Tonifies, item.Properties
	]);
   

    console.log(`Inserted ${nutritionRows.length} rows.`);
	
	//Tables
	const propertyRows = [];
	const tonifiesRows = [];
	const channelRows = [];
	
	
	fullRows.forEach(row =>{ 
    if (row[3] && row[3].trim()) {
        row[3].split(',').forEach(prop => {
            propertyRows.push([row[0], prop.trim()]);
        });
    }
	
	if (row[2] && row[2].trim()) {
		row[2].split(',').forEach(prop => {
			tonifiesRows.push([row[0], prop.trim()]);
		});
	}
	
	if (row[1] && row[1].trim()) {
		row[1].split(',').forEach(prop => {
			channelRows.push([row[0], prop.trim()]);
		});
	}
	
	});
	
	
	 await conn.query(
        'INSERT INTO nutrition (name, temp, type ) VALUES ?',
        [nutritionRows]
    );
		//channels, tonifies, properties, pacifies,aggravates, chakra, notes
		
	
	await createPropertiesTable(conn, propertyRows);
	await createTonifiesTable(conn, tonifiesRows);
	await createChannelsTable(conn, channelRows);


//fs.writeFileSync('Data/Properties.json', JSON.stringify(propertyRows, null, 2));
//console.log(`Generated ${propertyRows.length} property rows.`);
	
    await conn.end();
}
//Property table creation and insertion
async function createPropertiesTable(conn, propertyRows) {
	
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

//Tonifies table creation and insertion
async function createTonifiesTable(conn, tonifiesRows) {
	
	await conn.execute('CREATE TABLE tonifies (' +
		'ind INT AUTO_INCREMENT,' +
		'id INT,' +
		'tonifies VARCHAR(10),' +
		'CONSTRAINT pk_tonifies_ind PRIMARY KEY (ind),' +
		'CONSTRAINT fk_tonifies_id FOREIGN KEY (id)' +
		'REFERENCES nutrition (id)' +
		')'
	);
	
	await conn.query(
		'INSERT INTO tonifies' +
		'(id, tonifies)' +
		'VALUES ?',
		[tonifiesRows]
	);
	
	console.log(`Inserted ${tonifiesRows.length} rows`);	
}

//Channel table creation and insertion
async function createChannelsTable(conn, channelRows) {
	
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