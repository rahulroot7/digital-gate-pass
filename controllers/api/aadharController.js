const controller = {};
const { User, Otp, UserAadharDetail} = require("../../models");
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const { aadharSendOtp, aadharVerifyOtp } = require('../../services/aadhaarApiService')
const path = require("path");
const fs = require("fs");
const { RekognitionClient, CompareFacesCommand } = require("@aws-sdk/client-rekognition");

controller.aadharVerification = async (req, res) => {
    try{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { aadharNumber } = req.body;
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
        const sendResult = await aadharSendOtp(aadharNumber);
        if (!sendResult.success) {
            res.status(500).json(new ApiError(500, "Failed to send OTP", [error.message]));
        }
        const existingOtp = await Otp.findOne({ where: { aadharNumber, type: 'aadhar' } });
        if (existingOtp) {
            await existingOtp.update({
                otp: '4321',
                expires_at: expiresAt,
            });
        } else {
            await Otp.create({
                aadharNumber,
                otp: '4321',
                type: 'aadhar',
                expires_at: expiresAt,
            });
        }
        return res.status(200).json(new ApiResponse(200, '4321', "OTP sent successfully"));
    } catch (error) {
        console.error("Aadhar verification Error:", error);
        res.status(500).json(new ApiError(500, "Something went wrong", [error.message]));
    }
};

controller.aadharVerify = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { aadharNumber, otp } = req.body;
        const otpEntry = await Otp.findOne({ where: { aadharNumber } });
        if (!otpEntry) {
            return res.status(400).json(new ApiError(400, null, "No OTP request found"));
        }
        if (otpEntry.expires_at < new Date()) {
            return res.status(400).json(new ApiError(400, null, "OTP expired"));
        }
        const aadharAlreadyVerify = await UserAadharDetail.findOne({ where: { user_id: req.user?.id } });
        if (aadharAlreadyVerify) {
            return res.status(400).json(new ApiError(400, null, "User aadhar already verified"));
        }
        const referenceId = otpEntry.otp;
        const sendResult = await aadharVerifyOtp(referenceId, otp);        
        if (!sendResult.success) {
            return res.status(400).json(new ApiError(400, "OTP verification failed", [sendResult.message]));
        }
        const data = sendResult.data;
        const imageBuffer = Buffer.from(data.image, 'base64');
        const filename = `aadhar_${aadharNumber}.jpg`;
        const filePath = path.join(__dirname, "../../uploads/aadhar/", filename);
        fs.writeFileSync(filePath, imageBuffer);
        const [aadharRecord, created] = await UserAadharDetail.findOrCreate({
          where: { aadhar_number: aadharNumber, user_id: req.user?.id },
          defaults: {
            user_id: req.user?.id,
            mode: 'online',
            name: data.name,
            gender: data.gender,
            dob: data.dob,
            mobile_number: data.mobile_number,
            address: data.address,
            aadhaar_zip: data.aadhaar_zip,
            share_code: data.share_code,
            image_path: `/uploads/aadhar/${filename}`
          }
        });
        if (!created) {
          await aadharRecord.update({
            name: data.name,
            gender: data.gender,
            dob: data.dob,
            mobile_number: data.mobile_number,
            address: data.address,
            aadhaar_zip: data.aadhaar_zip,
            share_code: data.share_code,
            image_path: `/uploads/aadhar/${filename}`
          });
        }
        await otpEntry.destroy();
        return res.status(200).json(new ApiResponse(200, { aadhar: aadharRecord }, "OTP verified Successfull"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Something went wrong", [error.message]));
    }
};

controller.aadharFaceVerify = async (req, res) => {
  try {
    const aadharImage = await UserAadharDetail.findOne({where: { user_id: req.user?.id },attributes: ['image_path']});
    if (!aadharImage || !aadharImage.image_path) {
      return res.status(404).json({ error: 'Aadhaar image not found' });
    }
    const aadhaarImagePath = path.join(__dirname, "../../uploads/aadhar/aadharone.png");
    // const aadhaarImagePath = path.join(__dirname, "../..",aadharImage.image_path);
    console.log(aadhaarImagePath);
    const liveImage = fs.readFileSync(req.file.path);
    const aadhaarImage = fs.readFileSync(aadhaarImagePath);

    const rekognition = new RekognitionClient({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: aadhaarImage },
      TargetImage: { Bytes: liveImage },
    });

    const response = await rekognition.send(command);
    fs.unlinkSync(req.file.path); // delete uploaded file

    const totalFacesDetected = response.FaceMatches.length + (response.UnmatchedFaces?.length || 0);
    if (totalFacesDetected > 1) {
      return res.status(400).json(new ApiResponse(400, {
        match: false,
        similarity: 0,
      }, "Please ensure only one person is visible in the camera."));
    }
    let match = false;
    let similarity = 0;
    let message = "Face does not match Aadhaar image.";
    if (response.FaceMatches.length > 0) {
      similarity = response.FaceMatches[0].Similarity;
      if (similarity >= 80) {
        match = true;
        message = `Match found: ${similarity.toFixed(2)}%`;
      } else {
        message = `Low similarity: ${similarity.toFixed(2)}% (below 80%)`;
      }
    }
    return res.status(200).json(new ApiResponse(200, {
      match,
      similarity: +similarity.toFixed(2),
    }, message));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong", [error.message]));
  }
};

controller.aadharOffline = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { name, dob, gender, address, state_id, city_id, pin_code, type_of_id } = req.body;
    const id_image = req.file ? req.file.filename : null;
    const userId = req.user?.id;
    const image_path = `/uploads/aadhar/${id_image}`;

    const payload = {
      user_id: userId,
      mode: "offline",
      name,
      dob,
      gender,
      address,
      state_id,
      city_id,
      pin_code,
      type_of_id,
      id_image: image_path,
    };
    const whereClause = { user_id: userId };
    let aadharRecord = await UserAadharDetail.findOne({ where: whereClause });
    if (aadharRecord) {
      await aadharRecord.update(payload);
    } else {
      aadharRecord = await UserAadharDetail.create(payload);
    }
    return res.status(200).json(new ApiResponse(200, { aadhar: aadharRecord }, "Aadhar details saved successfully"));

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Something went wrong", [error.message])
    );
  }
};

module.exports = controller