const User = {
  name: String,
  email: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  bookings: [
    {
      type: {
        type: String,
        enum: ['flight', 'bus', 'trip']
      },
      bookingId: String,
      itemId: String,
      bookedAt: Date,
      status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'confirmed'
      },
      passengers: Number,
      totalPrice: Number
    }
  ]
};

export default User; 