const fs = require('fs');
// import file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

// route handlers
getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; // the *1 converts it to an integer
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign(
    {
      id: newId,
    },
    req.body
  );
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const checkID = (req, res, next, val) => {
  console.log(`Tour ID ${val} is valid`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

const confirmCreateTourFields = (req, res, next) => {
  if (req.body.name && req.body.price) {
    next();
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'Name and price of tour required',
    });
  }
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  checkID,
  confirmCreateTourFields,
};
