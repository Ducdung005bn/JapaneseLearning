import User from '../models/user.model.js';

//Chỉ admin mới được xem danh sách user nên gửi cả hashedPassword cũng được
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Không lộ hashedPassword cho chính người dùng đó, nên dùng -password
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(updates.password)) {
        throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    //If updates are dot notation (e.g., personalInformation.fullName), validate accordingly
    if (updates['personalInformation.fullName'] && updates['personalInformation.fullName'].trim() === '') {
        throw new Error('fullName is required and must be a non-empty string');
    }
    if (updates['personalInformation.gender'] && !['male','female','other'].includes(updates['personalInformation.gender'])) {
        throw new Error('gender must be one of "male", "female", "other"');
    }
    if (updates['personalInformation.dateOfBirth'] && isNaN(new Date(updates['personalInformation.dateOfBirth']).getTime())) {
        throw new Error('dateOfBirth must be a valid date');
    }
    if (updates['personalInformation.jlptLevel'] && ![0,1,2,3,4,5].includes(Number(updates['personalInformation.jlptLevel']))) {
        throw new Error('jlptLevel must be a number between 0 and 5');
    }

    // If updates are not dot notation
    if (updates.personalInformation) {
        const pi = updates.personalInformation;

        if ('fullName' in pi && (pi['fullName'].trim() === '')) {
            throw new Error('fullName is required and must be a non-empty string');
        }

        if ('gender' in pi && !['male','female','other'].includes(pi['gender'])) {
            throw new Error('gender must be one of "male", "female", "other"');
        }

        if ('dateOfBirth' in pi && isNaN(new Date(pi['dateOfBirth']).getTime())) {
            throw new Error('dateOfBirth must be a valid date');
        }

        if ('jlptLevel' in pi && ![0,1,2,3,4,5].includes(Number(pi['jlptLevel']))) {
            throw new Error('jlptLevel must be a number between 0 and 5');
        }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
