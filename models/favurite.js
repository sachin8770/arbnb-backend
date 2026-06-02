const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({

  houseId: {
    
    required: true,
    unique: true
  }
  
});


module.exports = mongoose.model('Favourite', favouriteSchema);