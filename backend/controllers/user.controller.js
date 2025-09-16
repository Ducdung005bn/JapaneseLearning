import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';


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
    // start with request body (may come from multipart/form-data via multer)
    const updates = { ...req.body };

    // If avatar was uploaded by multer/cloudinary, attach its path to personalInformation.avatar
    if (req.file && req.file.path) {
      // prefer dot-notation so findByIdAndUpdate can set the nested field
      updates['personalInformation.avatar'] = req.file.path;
    }

    function coerceBoolean(value, fieldName) {
      if (value === 'true' || value === true || value === '1' || value === 1) return true;
      if (value === 'false' || value === false || value === '0' || value === 0) return false;

      throw new Error(`Invalid value for ${fieldName}: ${value}`);
    }

    try {
      if ('notificationPrefs.emailAnnouncements' in updates) {
        updates['notificationPrefs.emailAnnouncements'] =
          coerceBoolean(updates['notificationPrefs.emailAnnouncements'], 'notificationPrefs.emailAnnouncements');
      }

      if ('notificationPrefs.emailAssignments' in updates) {
        updates['notificationPrefs.emailAssignments'] =
          coerceBoolean(updates['notificationPrefs.emailAssignments'], 'notificationPrefs.emailAssignments');
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (updates.notificationPrefs && typeof updates.notificationPrefs === 'object') {
        const np = updates.notificationPrefs;

        if ('emailAnnouncements' in np) {
          np.emailAnnouncements = coerceBoolean(np.emailAnnouncements, 'notificationPrefs.emailAnnouncements');
        }

        if ('emailAssignments' in np) {
          np.emailAssignments = coerceBoolean(np.emailAssignments, 'notificationPrefs.emailAssignments');
        }

        updates.notificationPrefs = np;
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }



    // if (updates.password) {
    //   if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(updates.password)) {
    //     throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    // }
    //   const salt = await bcrypt.genSalt(10);
    //   updates.password = await bcrypt.hash(updates.password, salt);
    // }

// Utility: get value from updates (dot-notation or object)
function getUpdateField(updates, path) {
  const dotValue = updates[path];
  if (dotValue !== undefined) return dotValue;

  // Nếu path = "personalInformation.fullName"
  const [root, key] = path.split('.');
  if (updates[root] && typeof updates[root] === 'object') {
    return updates[root][key];
  }

  return undefined;
}

// Utility: validate fields
function validatePersonalInformation(updates) {
  const fullName = getUpdateField(updates, 'personalInformation.fullName');
  if (typeof fullName === 'string' && fullName.trim() === '') {
    throw new Error('fullName is required and must be a non-empty string');
  }

  const gender = getUpdateField(updates, 'personalInformation.gender');
  if (gender !== undefined && !['male', 'female', 'other'].includes(gender)) {
    throw new Error('gender must be one of "male", "female", "other"');
  }

  const dob = getUpdateField(updates, 'personalInformation.dateOfBirth');
  if (dob !== undefined && isNaN(new Date(dob).getTime())) {
    throw new Error('dateOfBirth must be a valid date');
  }

  const jlpt = getUpdateField(updates, 'personalInformation.jlptLevel');
  if (jlpt !== undefined && ![0, 1, 2, 3, 4, 5].includes(Number(jlpt))) {
    throw new Error('jlptLevel must be a number between 0 and 5');
  }
}

// Sử dụng:
try {
  validatePersonalInformation(updates);
} catch (err) {
  return res.status(400).json({ error: err.message });
}

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    // For validation-like errors respond with 400
    const msg = error && error.message ? String(error.message) : 'Unknown error';
    if (/required|must|valid|invalid/i.test(msg)) {
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: msg });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    console.log(userId);
    console.log(oldPassword);
    console.log(newPassword);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required.' });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters and include uppercase, lowercase, and a number.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Old password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
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
