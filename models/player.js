const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  age: { 
    type: Number, 
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [100, 'Age cannot exceed 100']
  },
  position: { 
    type: String, 
    required: [true, 'Position is required'],
    enum: {
      values: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'],
      message: '{VALUE} is not a valid position'
    }
  },
  jersey: { 
    type: Number, 
    default: 99,
    min: [1, 'Jersey must be at least 1'],
    max: [99, 'Jersey cannot exceed 99']
  },
  goals: { 
    type: Number, 
    default: 0,
    min: [0, 'Goals cannot be negative']
  },
  assist: { 
    type: Number, 
    default: 0,
    min: [0, 'Assists cannot be negative']
  },
  salary: { 
    type: Number, 
    default: 200000,
    min: [0, 'Salary cannot be negative']
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Player', playerSchema);
