import Captain from "../models/captain.models.js";

export const createCaptain = async ({
  firstname,
  lastname,
  email,
  password,
  vehicle,
}) => {
  if (
    !firstname ||
    !email ||
    !password ||
    !vehicle.color ||
    !vehicle.plate ||
    !vehicle.capacity ||
    !vehicle.vehicleType
  ) {
    throw new Error("All fields are required");
  } else {
    const hashedPassword = await Captain.hashPassword(password);
    const captain = await Captain.create({
      fullname: {
        firstname,
        lastname,
      },
      email,
      password: hashedPassword,
      vehicle: {
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
      },
    });
    return captain;
  }
};
