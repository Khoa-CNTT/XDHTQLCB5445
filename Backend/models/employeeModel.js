import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
<<<<<<< HEAD
  BranchID: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
=======
    BranchID: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
>>>>>>> c1949cc (Bao cao lan 3)
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Position: { type: String, required: true },
    Status: { type: String, required: true },
}, { timestamps: true });

const EmployeeModel = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

<<<<<<< HEAD
export default EmployeeModel;
=======
export default EmployeeModel;
>>>>>>> c1949cc (Bao cao lan 3)
