const express = require('express');

const router = express.Router();
const tourController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { signUp, login, forgotPassword, resetPassword } = authController;

// NON - REST ROUTES
// sign up is post only - REST architecture not required
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router
  .route('/')
  .get(tourController.getAllUsers)
  .post(tourController.createUser);

router
  .route('/:id')
  .get(tourController.getUser)
  .patch(tourController.updateUser)
  .delete(tourController.deleteUser);

module.exports = router;
