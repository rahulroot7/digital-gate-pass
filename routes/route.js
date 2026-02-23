const express = require("express");
const multer = require("multer");
const { protect, adminAuth, masterAdmin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const UserController = require('../controllers/api/userController')
const AadharController = require('../controllers/api/aadharController');
const MasterController = require('../controllers/master/masterController');
const PageController = require('../controllers/master/pageController');
const AppointmentController = require('../controllers/api/appointmentController');
const AddressController = require('../controllers/master/addressController');
const AdminAuthController = require('../controllers/admin/authController');
const AdminDashboardController = require('../controllers/admin/dashboardController');
const AdminAppointmentController = require('../controllers/admin/appointmentController');
const { profileUpdate, login, forgotPassword, resetPassword, createAdminValidator } = require('../utils/validator/auth.validation');
const { aadharverification, aadharVerify, aadharOffline } = require('../utils/validator/aadhar.validation');
const { createAppointment } = require('../utils/validator/appointment.validation');
const { pageCreate } = require('../utils/validator/page.validation');
const { organizationStore, departmentStore, designationsStore, visitingOfficersStore } = require('../utils/validator/master.validation');
const { route } = require("./auth");
const fs = require('fs');

const router = express.Router();

// Multer storage setup (for single and multiple uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";
    // Decide folder based on field name
    if (file.fieldname === "profilePic") {
      folder += "profiles";
    } else if (file.fieldname === "aadhar" || file.fieldname === "id_image") {
      folder += "aadhar";
    } else if (file.fieldname === "live_image") {
      folder += "aadhar/live";
    } else {
      folder += "images";
    }
    // Ensure the folder exists
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadSingle = multer({ storage });
const uploadMulti = multer({ storage }).array("files", 10); 
// Dashboard Route
router.get("/profile", protect, UserController.userDashboard);
router.post("/profile-update", protect, uploadSingle.single('profilePic'), profileUpdate, UserController.profileUpdate);
router.post('/consent-log', protect, UserController.consentLog)
router.get('/consent-log', protect, UserController.getUserConsents)
// Aadhar Route
router.post("/aadhar-verification", protect, aadharverification, AadharController.aadharVerification);
router.post("/aadhar-verify", protect, aadharVerify, AadharController.aadharVerify);
router.post("/aadhar/face/verify", protect, uploadSingle.single('live_image'), AadharController.aadharFaceVerify)
router.post("/aadhar-offline", protect, uploadSingle.single('id_image'), aadharOffline, AadharController.aadharOffline);
// Appointment
router.post("/appointment/create", protect, createAppointment, AppointmentController.appointment);
router.get('/appointment/list', protect, AppointmentController.appointmentList);
router.get('/appointment/view/:id', protect, AppointmentController.viewAppointment);
router.put("/appointment/status-update", protect, AppointmentController.updateStatus);
router.get("/appointment/qr-scan/:reference_id", protect, AppointmentController.qrScaneAppointment);
router.get("/appointment/search", protect, AppointmentController.searchAppointments);
router.post("/fcm-notify", protect, UserController.sendFcmToUsers);
// Approver route
router.get('/approver/appointments', protect, adminAuth, AdminAppointmentController.appointmentList);
router.get('/approver/appointments/:id', protect, adminAuth, AdminAppointmentController.viewAppointment);
// Admin Panel Routes
/* Admin Auth */
router.post("/admin/login", login, AdminAuthController.login)
router.post("/admin-forgot-password", forgotPassword, AdminAuthController.adminForgotPassword);
router.post("/admin-reset-password", resetPassword, AdminAuthController.adminResetPassword);

router.post("/admin/user", protect, masterAdmin, uploadSingle.single('profilePic'), createAdminValidator, AdminAuthController.createAdmin);
router.put("/admin/user/:id", protect, masterAdmin, uploadSingle.single('profilePic'), createAdminValidator, AdminAuthController.updateAdmin);
router.get("/admins", protect, masterAdmin, AdminAuthController.adminList);
router.get("/admins/:id", protect, masterAdmin, AdminAuthController.viewAdmin);
router.delete("/admins/:id", protect, masterAdmin, AdminAuthController.deleteAdmin);

router.get("/admin/dashboard", protect, adminAuth, AdminDashboardController.dashboard);
router.get('/admin/appointments', protect, adminAuth, AdminAppointmentController.appointmentList);
// master Route
router.get("/roles", protect, MasterController.roles);
router.post("/roles", protect, masterAdmin, MasterController.createRole)
router.put("/roles/:id", protect, masterAdmin, MasterController.updateRole);
router.delete("/roles/:id", protect, masterAdmin, MasterController.deleteRole);
router.get("/master/organizations", protect, MasterController.organizationList);
router.post("/master/organization-store", protect, masterAdmin, organizationStore, MasterController.storeOrganization);
router.put("/master/organization/:id", protect, masterAdmin, organizationStore, MasterController.updateOrganization);
router.get("/master/organization/:id", protect, MasterController.viewOrganization);
router.delete("/master/organization/:id", protect, masterAdmin, MasterController.deleteOrganization);
router.get("/master/departments", protect, MasterController.departmentList);
router.get("/master/departments/by-organization/:organization_id", protect, MasterController.departmentsByOrganization);
router.post("/master/department-store", protect, masterAdmin, departmentStore, MasterController.storeDepartment);
router.put("/master/department/:id", protect, masterAdmin, departmentStore, MasterController.updateDepartment);
router.get("/master/department/:id", protect, MasterController.viewDepartment);
router.delete("/master/department/:id", protect, masterAdmin, MasterController.deleteDepartment);
router.get("/master/designations", protect, MasterController.designationsList);
router.post("/master/designation-store", protect,masterAdmin, designationsStore, MasterController.storeDesignation);
router.put("/master/designation-update/:id", protect, masterAdmin, designationsStore, MasterController.updateDesignation);
router.get("/master/designation-view/:id", protect, MasterController.viewDesignation);
router.delete("/master/designation-delete/:id", protect, masterAdmin, MasterController.deleteDesignation);
router.get("/master/designations/by-department/:department_id", protect, MasterController.designationsByDepartmentId);
router.get("/master/visiting-officers", protect, MasterController.visitingOfficersList);
router.post("/master/visiting-officers-store", protect, masterAdmin, visitingOfficersStore, MasterController.visitingOfficersStore);
router.put("/master/visiting-officers-update/:id", protect, masterAdmin, visitingOfficersStore, MasterController.updateVisitingOfficer);
router.get("/master/visiting-officers/:id", protect, MasterController.viewVisitingOfficer);
router.delete("/master/visiting-officers/:id", protect, masterAdmin, MasterController.deleteVisitingOfficer);
router.get("/master/visiting-officers/by-designation/:designation_id", protect, MasterController.visitingOfficersByDesignationId);
router.get("/states", protect, AddressController.getStates);
router.get("/cities/:state_id", protect, AddressController.getCities);
// pages routes
router.post("/page/create", uploadSingle.single('banner_image'), protect, masterAdmin, pageCreate, PageController.pageCreate);
router.put("/page/:slug", uploadSingle.single('banner_image'), protect, masterAdmin, pageCreate, PageController.updatePage);
router.get("/page/:slug", PageController.pageDetail);
router.delete("/page/:slug", protect, masterAdmin, PageController.deletePage);
router.patch("/page/restore/:slug", protect, masterAdmin, PageController.restorePage);

module.exports = router;