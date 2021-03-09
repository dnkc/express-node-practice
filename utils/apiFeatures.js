class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) FILTERING BY QUERY
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // {difficulty: 'easy', duration: {$gte: 5}}
    // 2) ADVANCED FILTERING - greater than equal to, greater than, lesser than or equal to, lesser than
    // convert query object to string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    // 3) ADVANCED FILTERING - SORTING BY PRICE
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
      // if two docs have same price, can use:
      // sort('price ratingsAverage')
    } else {
      // default sorting
      this.query = this.query.sort('-createdAt'); // sort by newest first
    }
    return this;
  }
  limitFields() {
    // 4) ADVANCED FILTERING - FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // default in case user does not specify fields
      this.query = this.query.select('-__v'); // excludes the field __v
    }
    return this;
  }
  paginate() {
    // 5) PAGINATION using API
    const page = this.queryString.page * 1 || 1; // convert string to number by *1 , default page 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // localhost:8000/api/v1/tours?page=2&limit=10
    // 1-10 for page 1, 11-20 for page 2, etc...
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
}

module.exports = {
  APIFeatures,
};
