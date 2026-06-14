import mongoose from 'mongoose';

const loginschema = new mongoose.Schema({
 email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  }
  
});
const Login = mongoose.model('login',loginschema);
export default Login;