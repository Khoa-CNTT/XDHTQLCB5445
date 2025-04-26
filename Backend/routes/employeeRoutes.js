import express from 'express';
<<<<<<< HEAD
import {addEmployee,updateEmployee,deleteEmployee,getAllEmployees} from '../controllers/employeeController.js';
=======
import {addEmployee,updateEmployee,deleteEmployee,getAllEmployees, getEmployeeBookings} from '../controllers/employeeController.js';
>>>>>>> c1949cc (Bao cao lan 3)

const emplyeeRouter = express.Router();

emplyeeRouter.post('/add',addEmployee);
emplyeeRouter.put('/update/:id',updateEmployee);
emplyeeRouter.delete('/delete/:id',deleteEmployee);
emplyeeRouter.get('/list',getAllEmployees);
<<<<<<< HEAD
=======
emplyeeRouter.get('/:id/bookings', getEmployeeBookings);
>>>>>>> c1949cc (Bao cao lan 3)

export default emplyeeRouter;