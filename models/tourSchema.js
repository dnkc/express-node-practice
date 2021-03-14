const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const userSchema = require('./userSchema');
// const { User } = userSchema;
// validation
// puts out errors for missing required values ("fat/thin model")

// sanitization
// removes unwanted characters inputted by users

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // a built-in validator: "required"
      unique: true, // not really a validator "unique"
      trim: true,
      maxlength: [40, 'A tour name must have 40 or less characters'], // specifies max length a string can have
      minlength: [10, 'A tour name must have 10 or more characters'],
      // validate: [validator.isAlpha, 'A tour name must only contain characters'], //isAlpha does not allow for spaces
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // only for strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: easy, medium or difficult',
      }, // only 3 values allowed for difficulty
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // min and max also work for days
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      // custom validators are possible
      type: Number,
      validate: {
        validator: function (val) {
          // has access to value user inputted
          return val < this.price; // returns true if discount value is less than the price of the tour
          // this only points to current value when creating a new document, not when you are updating
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, //trim only works for strings
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // WILL NEVER BE RETURNED FROM REQUESTS / HIDES FROM OUTPUT
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // mongodb supports geospatial data out of the box
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point', // can specify lines, polygons, etc
        enum: ['Point'],
      },
      coordinates: [Number], // an array of numbers (longitude, latitude, usually given as latitude and longtitude, esp on google maps)
      address: String,
      descripton: String,
    },
    locations: [
      // must be an array of objects to be able to be embedded in another document
      {
        type: {
          type: String,
          default: 'Point',
          enum: 'Point',
        },
        coordinates: [Number],
        address: String,
        descripton: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ], // embed by reference - use only id's
  },
  // options go here, can choose when to output virtual property
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties: i.e., conversions
// virtual properties are NOT stored on the database
// below: calculate how many weeks per tour
// regular functions get access to "this", arrow functions do not
// must explicitly declare you want the virtual properties in the output
// can not be used in query as it is not part of the DB
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// pre middleware runs before a specified event (on this one, runs on .save and .create but NOT .createMany, insert, findByID, etc )
// pre save middle ware has next available
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// //can have multiple pre middleware for same "hook" (i.e., "save")
// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// can also have post middleware
// has access to document saved to db as well as next
// processed after all other pre middleware has finished
// does not run for update
// tourSchema.post('save', async function (doc, next) {
//   console.log(doc);
//   // embeds document of a user provided as a guide into the tour
// embedded document does not update when user info is changed, i.e. from guide to lead-guide, etc. better to reference
//   // only works for save
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// QUERY MIDDLEWARE
// i.e., before a .find hook is run
// runs for find, but not for findOne or findById, so it requires the regex
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  // this is a query object
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   //runs after querty is executed
//   // has access to docs that were returned from query
//   console.log(docs);
//   // console.log(`Query took ${Date.now() - this.start} ms`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// i.e. excluding secret tours from aggregations
// easier to use middleware as opposed to repeating code in each aggregation function in controller
tourSchema.pre('aggregate', function (next) {
  //append $match to beginning of aggregate pipeline array
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('tours', tourSchema);

module.exports = {
  Tour,
};
