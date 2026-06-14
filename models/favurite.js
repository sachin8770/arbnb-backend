import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema({

  houseId: {
    
    required: true,
    unique: true
  }
  
});


const Favourite = mongoose.model('Favourite', favouriteSchema);
export default Favourite;