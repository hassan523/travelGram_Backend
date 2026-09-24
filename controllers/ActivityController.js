import { v2 as cloudinary } from "cloudinary";
import HandleAddPoints from "../utils/PointsHandler.js";
import HandlePostNotification from "../utils/Notify.js";
import UserSchema from "../models/User.js"
import LocationsSchema from "../models/Locations.js";
import ActivitySchema from "../models/Activity.js";

const Create_Activity = async (req, res) => {
    try {
        const { userId, RealtimeId, locationId } = req.params;

        const { Activity_name, description, type, Budget } = req.body;

        const checkuser = await UserSchema.findById(userId);
        if (!checkuser) {
            return res.status(400).json({ message: "User Not Found!" });
        }

        if (!checkuser.role.includes("User")) {
            return res.status(400).json({ message: "Unauthorized user!" });
        }

        const checkLocation = await LocationsSchema.findById(locationId);

        if (!checkLocation) {
            return res.status(404).json({ message: "Location Not Found!" })
        }
        if (type === "pins") {
            if (checkuser.no_Activity <= 0) {
                return res.status(400).json({ message: "You don't have enough activity left. Please upgrade your subscription!" });
            }

            checkuser.no_Activity -= 1;
            await checkuser.save();

            // Featured image block
            const imgUrl = req?.files?.featuredImage;
            const uploadResult = imgUrl ? await cloudinary.uploader.upload(imgUrl.tempFilePath, {
                resource_type: 'image',
                folder: "user-profiles",
            }) : {};

            // Gallery images block
            const galleryImages = req?.files?.galleryImages;
            const imageUrls = [];
            if (Array.isArray(galleryImages)) {
                for (const image of galleryImages) {
                    const uploadResult_gallery = await cloudinary.uploader.upload(image.tempFilePath);
                    imageUrls.push(uploadResult_gallery.secure_url);
                }
            } else if (galleryImages) {
                const uploadResult_gallery = await cloudinary.uploader.upload(galleryImages.tempFilePath);
                imageUrls.push(uploadResult_gallery.secure_url);
            }

            const create_Activity = new ActivitySchema({
                userId,
                RealtimeId,
                locationId,
                Activity_name,
                Budget,
                description,
                featuredImage: uploadResult.secure_url,
                galleryImages: imageUrls,
                type: [type]
            });

            const activity_save = await create_Activity.save();
            res.status(200).json({ message: `You have created ${Activity_name} successfully`, activity_save });

            await HandleAddPoints({
                points: 15,
                type: "add",
                userId: checkuser._id,
            });

        } else if (type === "travelogue") {
            if (checkuser.no_Activity <= 0) {
                return res.status(400).json({ message: "You don't have enough locations entries left. Please upgrade your subscription!" });
            }

            checkuser.no_Activity -= 1;
            await checkuser.save();

            const create_Activity = new ActivitySchema({
                userId,
                RealtimeId,
                locationId,
                Activity_name,
                Budget,
                description,
                type: [type]
            });

            const activity_save = await create_Activity.save();
            res.status(200).json({ message: `You have created ${Activity_name} successfully`, activity_save });

            await HandleAddPoints({
                points: 15,
                type: "add",
                userId: checkuser._id,
            });
        } else {
            res.status(404).json({ message: "Incorrect Type" })
        }

        await HandlePostNotification({
            userId: checkuser._id,
            message: `You have created ${Activity_name} successfully`,
            notiftype: 'activity'
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const delete_Activity = async (req, res) => {
    try {
        const { userId, ActivityId } = req.params;

        // Check if the user exists
        const checkUser = await UserSchema.findById(userId);
        if (!checkUser) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        // Check if the real-time entry exists
        const findActivity = await ActivitySchema.findById(ActivityId);
        if (!findActivity) {
            return res.status(404).json({ message: "Activity Not Found!" });
        }

        // Ensure the user is authorized to delete the real-time entry
        if (userId !== findActivity.userId.toString()) {
            return res.status(400).json({ message: "Unauthorized User to delete this activity!" });
        }

        // Ensure the user is the owner of the activity
        if (findActivity.userId.toString() !== checkUser._id.toString()) {
            return res.status(400).json({ message: "You are not the Owner of this Activity!" });
        }

        // Delete the activity
        const delete_activity = await ActivitySchema.findByIdAndDelete(ActivityId);

        // Notification
        await HandlePostNotification({
            userId: checkUser._id,
            message: `You have deleted ${findActivity.Activity_name} successfully`,
            notiftype: 'activity'
        });

        return res.status(200).json({ message: `${findActivity.Activity_name} deleted successfully!`, delete_activity });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const get_Activity = async (req, res) => {
    try {
        const { userId, type, locationId } = req.params;

        const checkUser = await UserSchema.findById(userId);
        const checkLocation = await LocationsSchema.findById(locationId);

        if (!checkUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            if (!checkLocation) {
                return res.status(404).json({ message: "Location Not Found!" })
            } else {
                if (type === "all") {
                    const activity = await ActivitySchema.find
                    return res.status(200).json({ message: "All Activity!", activity })
                } else {
                    if (type === "pins") {
                        const activity = await ActivitySchema.find({ userId: userId, type: type })
                        return res.status(200).json({ message: "all locations pins activity data!", activity });
                    } else {
                        if (type === "travelogue") {
                            const activity = await ActivitySchema.find({ userId: userId, type: type })
                            return res.status(200).json({ message: "all locations travelogue activity data", activity })
                        }
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const getSingleActivity = async (req, res) => {
    try {
        const { userId, ActivityId } = req.params;

        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            const findActivity = await ActivitySchema.findById(ActivityId).populate({
                path: "RealtimeId",
                model: "realtime",
                select: "-password",
                populate: {
                    path: "collaboratorsId",
                    model: "user",
                    select: "-password"
                }
            });
            if (!findActivity) {
                return res.status(404).json({ message: "Activity Not Found!" })
            } else {
                return res.status(200).json({ message: "Single Activity", findActivity })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}



const getActivityLength = async (req, res) => {

    try {
        const { userId } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" });
        } else {
            const findUsedActivity = await LocationsSchema.find({ userId: userId })
            const Total = findUsedActivity.length + findUser.no_Activity;
            const UsedActivities = findUsedActivity.length;

            return res.status(200).json({ message: "Activities Length", Total, UsedActivities })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const UpdateActivity = async (req, res) => {
    try {
        const { userId, activityId } = req.params;
        const { Activity_name, Budget, description } = req.body;

        // Check if user exists
        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        // Check if activity exists
        const findActivity = await ActivitySchema.findById(activityId);
        if (!findActivity) {
            return res.status(404).json({ message: "Activity Not Found!" });
        }

        // Check for ownership
        if (findActivity.userId.toString() !== userId) {
            return res.status(400).json({ message: "You are not the owner of this activity!" });
        }

        // Handle featured image upload if provided
        let featuredImageUrl = findActivity.featuredImage;
        if (req?.files?.featuredImage) {
            const imgUrl = req.files.featuredImage;
            const uploadResult = await cloudinary.uploader.upload(imgUrl.tempFilePath, {
                resource_type: 'image',
                folder: "user-profiles",
            });
            featuredImageUrl = uploadResult.secure_url;
        }

        // Handle gallery images upload if provided
        let galleryImageUrls = findActivity.galleryImages || [];
        if (req?.files?.galleryImages) {
            const galleryImages = req.files.galleryImages;
            galleryImageUrls = []; // Reset to replace existing images

            if (Array.isArray(galleryImages)) {
                for (const image of galleryImages) {
                    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
                        resource_type: 'image',
                        folder: "user-galleries",
                    });
                    galleryImageUrls.push(uploadResult.secure_url);
                }
            } else {
                const uploadResult = await cloudinary.uploader.upload(galleryImages.tempFilePath, {
                    resource_type: 'image',
                    folder: "user-galleries",
                });
                galleryImageUrls.push(uploadResult.secure_url);
            }
        }

        // Update the activity details
        findActivity.Activity_name = Activity_name || findActivity.Activity_name;
        findActivity.Budget = Budget || findActivity.Budget;
        findActivity.description = description || findActivity.description;
        findActivity.featuredImage = featuredImageUrl;
        findActivity.galleryImages = galleryImageUrls;

        // Save updated activity
        await findActivity.save();

        return res.status(200).json({ message: "Activity updated successfully!", activity: findActivity });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error!" });
    }
};


export {
    Create_Activity,
    delete_Activity,
    get_Activity,
    getSingleActivity,
    getActivityLength,
    UpdateActivity
}