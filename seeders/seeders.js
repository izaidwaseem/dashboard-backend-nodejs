const fs = require('fs');
const csv = require('csv-parser');
const path = require('path'); 
const Seeder = require('../models/seeders');

const csvFilePath = path.join(__dirname, '../text.csv');

exports.addToDatabase = async (req, res) => {
  // console.log("testing")
  try {
    const entries = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        const num = 'Number of employees'; // Column name with spaces
        entries.push({
          index: data.Index,                 // Assuming index is a number
          name: data.Name,
          website: data.Website,
          country: data.Country,
          description: data.Description,
          founded: data.Founded,
          industry: data.Industry,
          num_of_employees: data[num]
        });
      })
      .on('end', async () => {
        // Use bulkCreate to insert the entries into the database
        await Seeder.bulkCreate(entries);
        
        console.log('Entries added to the database');
        res.status(200).send('Entries added to the database');
      });
  } catch (error) {
    console.error('Error adding entries to the database:', error);
    res.status(500).send('An error occurred while adding entries to the database');
  }
};
