import { v2 as cloudinary } from "cloudinary";
import HandleAddPoints from "../utils/PointsHandler.js";
import HandlePostNotification from "../utils/Notify.js";
import UserSchema from "../models/User.js"
import LocationsSchema from "../models/Locations.js";
import Realtime from "../models/Realtime.js";
import ActivitySchema from "../models/Activity.js";
import RealTimeSchema from "../models/Realtime.js";

const Create_Locations = async (req, res) => {
    try {
        const { userId, RealtimeId } = req.params;
        const { location_name, description, type, Budget, latitude, longitude } = req.body;

        const checkuser = await UserSchema.findById(userId);
        if (!checkuser) {
            return res.status(400).json({ message: "User Not Found!" });
        }

        if (!checkuser.role.includes("User")) {
            return res.status(400).json({ message: "Unauthorized user!" });
        }
        if(location_name.length >= 30){
            return res.status(400).json({message:"The location name must be less than 30 characters!"})
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


                if (checkuser.no_locations <= 0) {
                    return res.status(400).json({ message: "You don't have enough locations left. Please upgrade your subscription!" });
                }

                checkuser.no_locations -= 1;
                await checkuser.save();

                const coordinates = {
                    latitude: latitude,
                    longitude: longitude
                };
               

                const create_location = new LocationsSchema({
                    userId,
                    RealtimeId,
                    location_name,
                    coordinates: coordinates,
                    Budget,
                    description,
                    featuredImage: uploadResult.secure_url,
                    galleryImages: imageUrls,
                    type: [type]
                });

                const location_save = await create_location.save();
                res.status(200).json({ message: `You have created ${location_name} successfully`, location_save });

                await HandleAddPoints({
                    points: 5,
                    type: "add",
                    userId: checkuser._id,
                });
            }
        } else if (type === "travelogue") {
            if (checkuser.no_locations <= 0) {
                return res.status(400).json({ message: "You don't have enough locations entries left. Please upgrade your subscription!" });
            }

            checkuser.no_locations -= 1;
            await checkuser.save();

            const coordinates = {
                latitude: latitude,
                longitude: longitude
            };

            const create_location = new LocationsSchema({
                userId,
                RealtimeId,
                location_name,
                coordinates: coordinates,
                Budget,
                description,
                type: [type]
            });

            const location_save = await create_location.save();
            res.status(200).json({ message: `You have created ${location_name} successfully`, location_save });

            await HandleAddPoints({
                points: 5,
                type: "add",
                userId: checkuser._id,
            });
        } else {
            res.status(404).json({ message: "Incorrect Type" })
        }

        await HandlePostNotification({
            userId: checkuser._id,
            message: `You have created ${location_name} successfully`,
            notiftype: 'locations'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};

const delete_locations = async (req, res) => {
    try {
        const { userId, realTimeId, locationId } = req.params;
        console.log({ userId, realTimeId, locationId })
        // Check if the user exists
        const checkUser = await UserSchema.findById(userId);
        if (!checkUser) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        // Check if the real-time entry exists
        const findRealTime = await RealTimeSchema.findById(realTimeId);
        if (!findRealTime) {
            return res.status(404).json({ message: "Realtime Not Found!" });
        }

        // Ensure the user is authorized to delete the real-time entry
        if (userId !== findRealTime.userId.toString()) {
            return res.status(400).json({ message: "Unauthorized User to delete this realtime!" });
        }

        // Check if the location exists
        const findLocation = await LocationsSchema.findById(locationId);
        if (!findLocation) {
            return res.status(404).json({ message: "Location Not Found!" });
        }


        // Ensure the user is the owner of the location
        if (findLocation.userId.toString() !== checkUser._id.toString()) {
            return res.status(400).json({ message: "You are not the Owner of this Location!" });
        }

        await ActivitySchema.deleteMany({ locationId: findLocation._id })

        // Delete the location
        const delete_location = await LocationsSchema.findByIdAndDelete(locationId);

        // Notification
        await HandlePostNotification({
            userId: checkUser._id,
            message: `You have deleted ${findLocation.location_name} successfully`,
            notiftype: 'locations'
        });

        return res.status(200).json({ message: `${findLocation.location_name} deleted successfully!`, delete_location });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const get_Locations = async (req, res) => {
    try {
        const { userId, type, realTimeId } = req.params;

        const checkUser = await UserSchema.findById(userId);
        const checkRealTime = await Realtime.findById(realTimeId);

        if (!checkUser) {
            return res.status(404).json({ message: "User Not Found!" })
        } else {
            if (!checkRealTime) {
                return res.status(404).json({ message: "RealTime Not Found!" })
            } else {
                if (type === "all") {
                    const allLocations = await LocationsSchema.find({ userId: userId })
                    return res.status(200).json({ message: "All Locations!", allLocations })
                } else {
                    if (type === "pins") {
                        const allLocations = await LocationsSchema.find({ userId: userId, type: type, RealtimeId: checkRealTime._id })
                        return res.status(200).json({ message: "All pins Locations data!", allLocations })
                    } else {
                        if (type === "travelogue") {
                            const allLocations = await LocationsSchema.find({ userId: userId, type: type, RealtimeId: checkRealTime._id })
                            return res.status(200).json({ message: "all travelogue locations data", allLocations })
                        }
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};

const getSingleLocation = async (req, res) => {
    try {
        const { userId, locationID } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const findLocation = await LocationsSchema.findById(locationID)
            .populate({
                path: "RealtimeId",
                model: "realtime",
                select: "-password",
                populate: {
                    path: "collaboratorsId",
                    model: "user",
                    select: "-password"
                }
            });
        if (!findLocation) {
            return res.status(404).json({ message: "Location Not Found" });
        }
        const findActivities = await ActivitySchema.find({ locationId: findLocation?._id.toString() })

        res.status(200).json({ message: "Single location", findLocation: findLocation, findActivities: findActivities })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};

const getLocationLength = async (req, res) => {
    try {
        const { userId } = req.params;

        const findUser = await UserSchema.findById(userId);

        if (!findUser) {
            return res.status(404).json({ message: "User Not Found!" });
        } else {
            const findUsedLocations = await LocationsSchema.find({ userId: userId })
            const Total = findUsedLocations.length + findUser.no_locations;
            const UsedLocations = findUsedLocations.length;

            return res.status(200).json({ message: "Locations Length", Total, UsedLocations })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" })
    }
};

const UpdateLocation = async (req, res) => {
    try {
        const { userId, LocationId } = req.params;
        const { location_name, description, type, Budget, latitude, longitude } = req.body;

        // Check if the user exists
        const checkuser = await UserSchema.findById(userId);
        if (!checkuser) {
            return res.status(400).json({ message: "User Not Found!" });
        }

        // Check if the user has the right role
        if (!checkuser.role.includes("User")) {
            return res.status(400).json({ message: "Unauthorized user!" });
        }

        // Check if the location exists
        const findLocation = await LocationsSchema.findById(LocationId);
        if (!findLocation) {
            return res.status(404).json({ message: "Location Not Found!" });
        }

        // Update featured image if provided
        const featuredImgFile = req?.files?.featuredImage;
        let uploadedFeaturedImage = findLocation.featuredImage; 

        if (featuredImgFile) {
            const uploadResult = await cloudinary.uploader.upload(featuredImgFile.tempFilePath, {
                resource_type: 'image',
                folder: "user-profiles",
            });
            uploadedFeaturedImage = uploadResult.secure_url;
        }

        // Update gallery images if provided
        const galleryImgFiles = req?.files?.galleryImages;
        let uploadedGalleryImages = findLocation.galleryImages || []; 

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

        // Update location fields if provided
        findLocation.location_name = location_name || findLocation.location_name;
        findLocation.description = description || findLocation.description;
        findLocation.type = type || findLocation.type;
        findLocation.Budget = Budget || findLocation.Budget;
        findLocation.coordinates.latitude = latitude || findLocation.coordinates.latitude;
        findLocation.coordinates.longitude = longitude || findLocation.coordinates.longitude;
        findLocation.featuredImage = uploadedFeaturedImage; 
        findLocation.galleryImages = uploadedGalleryImages; 

        // Save the updated location
        await findLocation.save();

        // Respond with success
        return res.status(200).json({ message: "Location Edited Successfully", location: findLocation });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};


export {
    Create_Locations,
    delete_locations,
    get_Locations,
    getSingleLocation,
    getLocationLength,
    UpdateLocation
}
