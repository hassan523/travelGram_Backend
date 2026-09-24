import Activity from "../models/Activity.js";
import LocationsSchema from "../models/Locations.js";
import RealTimeSchema from "../models/Realtime.js";
import UserSchema from "../models/User.js";
import HandlePostNotification from "../utils/Notify.js";
import HandleAddPoints from "../utils/PointsHandler.js";
import { v2 as cloudinary } from "cloudinary";


const HandleCreateRealtime = async (req, res) => {
    try {
        const { realtime_name, description, type } = req.body;
        const { userId } = req.params;

        const checkuser = await UserSchema.findById(userId);

        if (!checkuser) {
            return res.status(400).json({ message: "User Not Found!" });
        }

        if (!checkuser.role.includes("User")) {
            return res.status(400).json({ message: "Unauthorized user!" });
        }

        if (type === "pins") {

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

            if (!imgUrl && !galleryImages) {
                return res.status(400).json({ message: "Featured Image and Images Are Compulsory!" })
            } else {
                if (checkuser.no_Pins <= 0) {
                    return res.status(400).json({ message: "You don't have enough pins left. Please upgrade your subscription!" });
                } else {

                    checkuser.no_Pins -= 1;
                    await checkuser.save();

                    const create_realtime = new RealTimeSchema({
                        userId,
                        realtime_name,
                        description,
                        featuredImage: uploadResult.secure_url,
                        galleryImages: imageUrls,
                        type: [type]
                    });

                    const realtime_save = await create_realtime.save();
                    res.status(200).json({ message: `You have created ${type} successfully`, realtime_save });

                    await HandleAddPoints({
                        points: 5,
                        type: "add",
                        userId: checkuser._id,
                    });
                }
            }
        } else if (type === "travelogue") {
            if (checkuser.no_travelogue <= 0) {
                return res.status(400).json({ message: "You don't have enough travelogue entries left. Please upgrade your subscription!" });
            }

            checkuser.no_travelogue -= 1;
            await checkuser.save();

            const create_realtime = new RealTimeSchema({
                userId,
                realtime_name,
                description,
                type: [type]
            });

            const realtime_save = await create_realtime.save();
            res.status(200).json({ message: `You have created ${type} successfully`, realtime_save });

            await HandleAddPoints({
                points: 3,
                type: "add",
                userId: checkuser._id,
            });
        } else {
            res.status(404).json({ message: "Incorrect Type" })
        }

        await HandlePostNotification({
            userId: checkuser._id,
            message: `You have created ${type} successfully`,
            notiftype: "realtime"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

const handledeleteRealTime = async (req, res) => {
    try {
        const { userId, realTimeId } = req.params;
        const checkUser = await UserSchema.findById(userId);

        if (!checkUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const findRealTime = await RealTimeSchema.findById(realTimeId);
        if (!findRealTime) {
            return res.status(404).json({ message: "Realtime not found!" });
        }

        if (userId !== findRealTime.userId.toString()) {
            return res.status(400).json({ message: "Unauthorized user to delete this realtime!" });
        }

        const findLocation = await LocationsSchema.find({ RealtimeId: findRealTime._id });
        const extractLocationIds = findLocation.map(item => item._id.toString());
        await LocationsSchema.deleteMany({ _id: { $in: extractLocationIds } });

        const findActivities = await Activity.find({ RealtimeId: findRealTime._id });
        const extractActivityIds = findActivities.map(item => item._id.toString());
        await Activity.deleteMany({ _id: { $in: extractActivityIds } });

        await RealTimeSchema.findByIdAndDelete(realTimeId);

        await HandlePostNotification({
            userId: checkUser._id,
            message: `You have deleted ${findRealTime.realtime_name} successfully`,
            notiftype: "realtime"
        });

        return res.status(200).json({ message: `${findRealTime.realtime_name} deleted successfully!` });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getRealTime = async (req, res) => {
    try {
        const { userId, type } = req.params;
        const checkUser = await UserSchema.findById(userId);
        if (!checkUser.role.includes("User")) {
            return res.status(404).json({ message: "User Not found!" })
        } else {
            if (type === "allusers") {
                const getUserRealtime = await RealTimeSchema.find().populate({
                    path: 'Likes.userID',
                    model: 'user',
                    select: '-password'
                }).populate({
                    path: 'collaboratorsId',
                    model: 'user',
                    select: '-password'
                }).populate({
                    path: 'userId',
                    model: 'user',
                    select: '-password'
                }).sort({ createdAt: -1 });
                const mapped = getUserRealtime.map(async (realtime) => {
                    const findLocations = await LocationsSchema.find({ RealtimeId: realtime._id })
                    return {
                        ...realtime.toObject(),
                        locations: findLocations
                    }
                })
                const result = await Promise.all(mapped)
                return res.status(200).json({ message: "All Realtimes and Travelogue of all user's", getUserRealtime: result });
            }
            if (type === "all") {
                const getUserRealtime = await RealTimeSchema.find({ userId: userId }).populate({
                    path: 'Likes.userID',
                    model: 'user',
                    select: '-password'
                }).populate({
                    path: 'collaboratorsId',
                    model: 'user',
                    select: '-password'
                }).populate({
                    path: 'userId',
                    model: 'user',
                    select: '-password'
                }).sort({ createdAt: -1 });
                const mapped = getUserRealtime.map(async (realtime) => {
                    const findLocations = await LocationsSchema.find({ RealtimeId: realtime._id })
                    return {
                        ...realtime.toObject(),
                        locations: findLocations
                    }
                })
                const result = await Promise.all(mapped)

                return res.status(200).json({ message: "All", getUserRealtime: result });
            } else {
                if (type === "pins") {
                    const getUserRealtime = await RealTimeSchema.find({ userId: userId, type: type }).populate({
                        path: 'Likes.userID',
                        model: 'user',
                        select: '-password'
                    }).populate({
                        path: 'collaboratorsId',
                        model: 'user',
                        select: '-password'
                    }).populate({
                        path: 'userId',
                        model: 'user',
                        select: '-password'
                    }).sort({ createdAt: -1 });
                    const mapped = getUserRealtime.map(async (realtime) => {
                        const findLocations = await LocationsSchema.find({ RealtimeId: realtime._id })
                        return {
                            ...realtime.toObject(),
                            locations: findLocations
                        }
                    })
                    const result = await Promise.all(mapped);
                    return res.status(200).json({ message: "All pins", getUserRealtime: result });
                } else {
                    if (type === "travelogue") {
                        const getUserRealtime = await RealTimeSchema.find({ userId: userId, type: type }).populate({
                            path: 'Likes.userID',
                            model: 'user',
                            select: '-password'
                        }).populate({
                            path: 'collaboratorsId',
                            model: 'user',
                            select: '-password'
                        }).populate({
                            path: 'userId',
                            model: 'user',
                            select: '-password'
                        }).sort({ createdAt: -1 })
                        const mapped = getUserRealtime.map(async (realtime) => {
                            const findLocations = await LocationsSchema.find({ RealtimeId: realtime._id })
                            return {
                                ...realtime.toObject(),
                                locations: findLocations
                            }
                        })
                        const result = await Promise.all(mapped);
                        return res.status(200).json({ message: "All travelogue", getUserRealtime: result })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
};

const GetSingleRealtime = async (req, res) => {
    try {
        const { userId, RealTimeId } = req.params;

        const findUser = await UserSchema.findById(userId);
        if (!findUser) {
            return res.status(404).json({ message: "User Not Found" });

        } else {
            const findRealtime = await RealTimeSchema.findById(RealTimeId);
            const findLocation = await LocationsSchema.find({ RealtimeId: findRealtime?._id });
            const extractLocationIds = findLocation.map((item) => item?._id.toString());
            const findActivities = await Activity.find({ locationId: { $in: extractLocationIds } })

            const realtimeData = {
                realtime: findRealtime,
                location: findLocation,
                activities: findActivities
            }

            return res.status(200).json({ message: "single realtime", realtimeData });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};

const LikeRealtime = async (req, res) => {
    try {
        const { userId, RealTimeId } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const findRealtime = await RealTimeSchema.findById(RealTimeId);

        if (!findRealtime) {
            return res.status(404).json({ message: "Real Time Not Found" });
        }

        const userExists = findUser._id;

        const userIndex = findRealtime.Likes.findIndex((like) =>
            like.userID.equals(userExists)
        );

        if (userIndex !== -1) {
            findRealtime.Likes.splice(userIndex, 1);
        } else {
            findRealtime.Likes.push({
                userID: userExists._id,
            });
        }
        const saveRes = await findRealtime.save();
        res.status(200).json({ message: "Liked", likes: saveRes.Likes });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};


const getRealtimeLength = async (req, res) => {
    try {
        const { type, userId } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            if (type === "pins") {
                const findAllUserPins = await RealTimeSchema.find({
                    type: type,
                    userId: userId,
                })
                const Total = findAllUserPins.length + findUser.no_Pins;
                const UsedPins = findAllUserPins.length;
                return res.status(200).json({ message: "Pins Lenght!", Total, UsedPins })
            } else {
                if (type === "travelogue") {
                    const findAllUserTravelogue = await RealTimeSchema.find({
                        type: type,
                        userId: userId
                    })
                    const Total = findAllUserTravelogue.length + findUser.no_travelogue;
                    const UsedTravelogue = findAllUserTravelogue.length;
                    return res.status(200).json({ message: "Pins Lenght!", Total, UsedTravelogue })
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
}

const updateRealtime = async (req, res) => {
    try {
        const { realtime_name, description } = req.body;
        const { userId, RealTimeId } = req.params;

        const checkuser = await UserSchema.findById(userId);
        const realtime = await RealTimeSchema.findById(RealTimeId);

        if (!checkuser) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        if (!checkuser.role.includes("User")) {
            return res.status(400).json({ message: "Unauthorized user!" });
        }
        if (!realtime) {
            return res.status(404).json({ message: "Realtime Not Found!" })
        } else {
            if (realtime.userId.toString() !== userId) {
                return res.status(400).json({ message: "You are not the owner of this realtime!" })
            } else {
                // Update featured image if provided
                const featuredImgFile = req?.files?.featuredImage;
                let uploadedFeaturedImage = realtime.featuredImage;

                if (featuredImgFile) {
                    const uploadResult = await cloudinary.uploader.upload(featuredImgFile.tempFilePath, {
                        resource_type: 'image',
                        folder: "user-profiles",
                    });
                    uploadedFeaturedImage = uploadResult.secure_url;
                }

                // Update gallery images if provided
                const galleryImgFiles = req?.files?.galleryImages;
                let uploadedGalleryImages = realtime.galleryImages || [];

                if (galleryImgFiles) {
                    const imageUrls = [];
                    if (Array.isArray(galleryImgFiles)) {
                        for (const image of galleryImgFiles) {
                            const uploadResult = await cloudinary.uploader.upload(image.tempFilePath);
                            imageUrls.push(uploadResult.secure_url);
                        }
                    } else {
                        const uploadResult = await cloudinary.uploader.upload(galleryImgFiles.tempFilePath);
                        imageUrls.push(uploadResult.secure_url);
                    }
                    uploadedGalleryImages = imageUrls;
                }

                realtime.realtime_name = realtime_name || realtime.realtime_name;
                realtime.description = description || realtime.description;
                realtime.featuredImage = uploadedFeaturedImage;
                realtime.galleryImages = uploadedGalleryImages;

                await realtime.save();
                return res.status(200).json({ message: "Realtime Edited Successfully", realtime: realtime });

            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error!" })
    }
}


export {
    HandleCreateRealtime,
    handledeleteRealTime,
    getRealTime,
    GetSingleRealtime,
    LikeRealtime,
    getRealtimeLength,
    updateRealtime,
};