import UserSchema from "../models/User.js";
import HandlePostNotification from "../utils/Notify.js";
import autoMailer from "../utils/AutoMailer.js";
import HandleAddPoints from "../utils/PointsHandler.js";
import Notifications from "../models/Notifications.js";
import { v2 as cloudinary } from "cloudinary";

const HandleUserRegister = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone_number, address, country, dateofbirth } = req.body;

        const checkuser = await UserSchema.findOne({ email: email });

        if (checkuser) {
            return res.status(400).json({ message: "User Already exists!" });
        }
        const findName = await UserSchema.findOne({ name: name });
        if (findName) {
            return res.status(400).json({ message: "Name Already Taken by another User" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password and confirm password do not match" });
        }
        else {
            const create_user = UserSchema({
                name: name,
                email: email,
                password: password,
                phone_number: phone_number,
                address: address,
                country: country,
                dateofbirth: dateofbirth,
                role: ["User"],
                status: ["Active"]
            });

            const user_save = await create_user.save();
            const AddPoint = HandleAddPoints({
                points: 10,
                type: "add",
                userId: user_save._id,
            })
            const Notification = HandlePostNotification({
                userId: user_save._id,
                message: `${user_save.name} Has Registered Successfully`,
                notiftype: "Auth"
            })
            res.status(200).json({ message: "You have Registered Successfully", user_save, Notification });

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error!" });
    }
};
const handleLoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await UserSchema.findOne({ email: email })
        if (!findUser) {
            return res.status(404).json({ message: "Invalid Email or Password" })
        }
        if (findUser.status[0] === "Blocked") {
            return res.status(401).json({ message: "Your account has been blocked contact Admin!" })
        }
        if (findUser.email.toString() === email && findUser.password === password.toString()) {

            res.status(200).json({ message: "Logged In Successfully", cookie: findUser });

        } else {
            res.status(400).json({ message: "Invalid Email or Password" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const findUser = await UserSchema.findOne({ email: email });
        if (!findUser) {
            return res.status(404).json({ message: "Sorry, Account with this email doesn't exist" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExp = Date.now() + 600000;

        findUser.OtpCode = otpCode;
        findUser.OtpExp = otpExp;

        await findUser.save();

        autoMailer({
            to: findUser.email,
            subject: 'OTP Verification Code',
            message: `<h3>Your OTP Verification Code Is:</h3>
                      <h3>${otpCode}</h3>`
        });

        console.log(otpCode);

        res.status(200).json({ message: "OTP Sent to Your Email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const handleVerifyOtp = async (req, res) => {
    try {
        const { email, OtpCode } = req.body;
        const findUser = await UserSchema.findOne({ email });
        if (!findUser) {
            return res.status(404).json({ message: "Sorry, We couldn't send your OTP Verification Code" });
        }
        if (OtpCode === "") {
            return res.status(404).json({ message: "OTP Field Is Required" })
        }
        if (findUser.OtpCode !== OtpCode) {
            return res.status(404).json({ message: "Invalid OTP Verification Code" })
        }
        if (findUser.OtpExp && findUser.OtpExp > new Date()) {
            return res.status(200).json({ message: "OTP Verified Successfully" })
        } else {
            return res.status(404).json({ message: "OTP has expired or is invalid" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

const handleResetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const findUser = await UserSchema.findOne({ email });
        if (!findUser) {
            return res.status(404).json({ message: "Sorry, Some Error Occured While Resetting Password" })
        }
        if (password !== confirmPassword) {
            return res.status(404).json({ message: "Passwords Must Be Same" });
        }
        findUser.password = password || findUser.password
        await findUser.save();
        res.status(200).json({ message: "Password Reset Successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
};

const handleResendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const userExists = await UserSchema.findOne({ email });
        if (!userExists) {
            return res.status(404).json({ message: "This Email Doesn't Exist" });
        }

        const otpCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const getOtpCode = otpCode;
        const getOtpExpire = Date.now() + 600000;

        console.log(getOtpCode)

        userExists.OtpCode = getOtpCode || userExists.OtpCode
        userExists.OtpExp = getOtpExpire || userExists.OtpExp

        await userExists.save();

        autoMailer(
            {
                to: userExists.email,
                subject: 'OTP VERIFICATION CODE',
                message: `<h3>Your OTP Verification Code Is: </h3>
                <h3> ${userExists.OtpCode}</h4>`
            }
        );

        res.status(200).json({ message: "OTP Re-Sent Successfully To Your Email" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

const update_User_profile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { name, email, password, phone_number, address, dateofbirth } = req.body;

        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            return res.status(404).json({ message: "User Not found!" });
        }
        if (email || name) {
            const existingUser = await UserSchema.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ message: "This email is already in use by another user!" });
            }
            const checkNamesAvalaibilty = await UserSchema.findOne({ name })
            if (checkNamesAvalaibilty && checkNamesAvalaibilty._id.toString() !== userId) {
                return res.status(400).json({ message: "This Name is already in use by another user!" });
            }
        }
        const imgUrl = req?.files?.imageURL;
        const uploadResult = imgUrl ? await cloudinary.uploader.upload(imgUrl.tempFilePath, {
            resource_type: 'image',
            folder: "user-profiles",
        }) : {};

        // Update user details
        findUser.name = name || findUser.name;
        findUser.email = email || findUser.email;
        findUser.phone_number = phone_number || findUser.phone_number;
        findUser.address = address || findUser.address;
        findUser.password = password || findUser.password;
        findUser.dateofbirth = dateofbirth || findUser.dateofbirth;
        findUser.profileImg = uploadResult.secure_url || findUser.profileImg;

        // Save the updated user
        await findUser.save();

        // Respond with success
        res.status(200).json({ message: "Profile Edited Successfully", findUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

const get_user_profile = async (req, res) => {
    try {
        const { userId } = req.params;

        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            return res.status.json({ message: "User Not Found!" })
        } else {
            return res.status(200).json(findUser);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" })
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const findUser = await UserSchema.findById(userId)
        if (!findUser) {
            return res.status(400).json({ message: "User Not Found!" })
        } else {
            const deleteNotification = await Notifications.deleteMany({ userId });
            const deleteUser = await UserSchema.findByIdAndDelete(userId);
            return res.status(200).json({ message: "User Deleted Succesfully!" })
        }

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const get_all_users = async (req, res) => {
    try {
        const { adminId } = req.params;

        // Find the admin by ID
        const checkAdmin = await UserSchema.findById(adminId);

        // Check if the user is an admin
        if (!checkAdmin || !checkAdmin.role.includes("Admin")) {
            return res.status(403).json({ message: "You are not authorized to view this information" });
        }

        // Find all users with the role "User"
        const allusers = await UserSchema.find({ role: "User" }).select("-password");

        // Return the list of all users
        return res.status(200).json({ message: "All users retrieved successfully", allusers });
    } catch (error) {
        // Handle any errors that occur
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};


const get_single_user = async (req, res) => {
    try {
        const { userId } = req.params;

        const User = await UserSchema.findById(userId);
        return res.status(200).json({ message: "single Users", User })
    } catch (error) {
        console.log(object)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const Admin_Status_change = async (req, res) => {
    try {
        const { adminId, userId } = req.params;
        const { status } = req.body;

        // Find the admin by ID
        const checkAdmin = await UserSchema.findById(adminId);
        const checkUser = await UserSchema.findById(userId);

        // Check if the user is an admin
        if (!checkAdmin || !checkAdmin.role.includes("Admin")) {
            return res.status(403).json({ message: "You are not authorized to view this information" });
        } else {
            if (!checkUser) {
                return res.status(404).json({ message: "User Not Found!" })
            } else {

                checkUser.status = status || checkUser.status;
                // Save the updated user
                await checkUser.save();
                // Respond with success
                res.status(200).json({ message: "Profile Status Updated Successfully", checkUser });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error!" })
    }
}

const search_users = async (req, res) => {
    try {
        const { userID } = req.params;
        const { keyword } = req.query;
        // const { page = 1, limit = 10 } = req.query;
        if (!keyword || keyword === "") {
            const SearchUsers = await UserSchema.find({
                _id: { $ne: userID },
                role: ['User']
            });
            // pagination
            // const totalPages = await UserSchema.countDocuments({ _id: { $ne: userID } }).exec();
            // return res.status(200).json({
            //     products: products,
            //     totalPages: Math.ceil(totalPages / limit),
            //     currentPage: Number(page),
            // })
            return res.status(200).json({ message: "Users", SearchUsers })
        } else {
            const SearchUsers = await UserSchema.find({ name: { $regex: keyword, $options: 'i' }, _id: { $ne: userID }, role: ['User'] });
            return res.status(200).json({ message: "Users", SearchUsers })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const TaggedPostPrivateOrPublic = async (req, res) => {
    try {
        const { taggedRealtimeSetting } = req.body;
        const { userId } = req.params;
        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            findUser.taggedRealtimeSetting = taggedRealtimeSetting || findUser.taggedRealtimeSetting;

            findUser.save();
            return res.status(200).json({ message: "Tagged Posts are only visible for you!" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}


export {
    HandleUserRegister,
    handleLoginUser,
    handleForgotPassword,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    update_User_profile,
    get_user_profile,
    deleteUser,
    get_all_users,
    get_single_user,
    Admin_Status_change,
    search_users,
    TaggedPostPrivateOrPublic
};