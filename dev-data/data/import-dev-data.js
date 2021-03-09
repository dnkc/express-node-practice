const express = require('express');
const fs = require('fs');
const tourSchema = require('../../models/tourSchema');
const { Tour } = tourSchema;
require('dotenv').config({ path: (__dirname, './config.env') });

const db = require('../../db');
const { connectDB } = db;
connectDB();

// read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data into db

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from collection
const deleteDate = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteDate();
}

console.log(process.argv);
