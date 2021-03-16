const express = require('express');
const fs = require('fs');
const tourSchema = require('../../models/tourSchema');
const { Tour } = tourSchema;
const userSchema = require('../../models/userSchema');
const { User } = userSchema;
const Review = require('../../models/reviewSchema');

require('dotenv').config({ path: (__dirname, './config.env') });

const db = require('../../db');
const { connectDB } = db;
connectDB();

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// import data into db

const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
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
    await Review.deleteMany();
    await User.deleteMany();
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
