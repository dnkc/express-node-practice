const express = require('express');

const router = express.Router();
const tourController = require('../controllers/userController');
const authController = require('../controllers/authController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  isAuthenticated,
  restrictTo,
} = authController;
const userController = require('../controllers/userController');

// NON - REST ROUTES
// sign up is post only - REST architecture not required
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
// PROTECTS ALL ROUTES BELOW IT WITH isAuthenticated AFTER LINE 24
router.use(isAuthenticated);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get(
  '/me',
  isAuthenticated,
  userController.getMe,
  userController.getUser
);
// BELOW ARE RESTRICTED TO isAuthenticated as well as ADMIN
router.use(restrictTo('admin'));
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
