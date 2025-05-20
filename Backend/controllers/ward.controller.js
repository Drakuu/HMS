const hospitalModel = require("../models/index.model");


// Ensure correct import




// Create a new ward and assign it to a department (using department name instead of ID)
exports.createWard = async (req, res) => {
    const { name, department_Name, wardNumber, bedCount, rooms, nurseAssignments } = req.body;

    try {
        // Step 1: Generate bed objects for the ward
        const beds = [];
        for (let i = 1; i <= bedCount; i++) {
            beds.push({
                bedNumber: `B${wardNumber}-${i}`,  // Generate unique bed numbers like B101-1, B101-2
                occupied: false,  // Initialize all beds as not occupied
            });
        }

        // Step 2: Create the ward with the beds and rooms array
        const newWard = await hospitalModel.ward.create({
            name,
            wardNumber,
            bedCount,
            department_Name,
            rooms,  // Add the rooms array to the ward
            beds,   // Add the beds array to the ward
            nurses: nurseAssignments, // Add nurse assignments to the ward
        });

        // Step 3: Find the department by name
        const department = await hospitalModel.departments.findOne({
            name: { $regex: new RegExp(`^${department_Name}$`, 'i') }, // Case-insensitive search
        });

        if (!department) {
            // If the department is not found, remove the created ward
            await hospitalModel.ward.findByIdAndDelete(newWard._id);
            return res.status(404).json({
                success: false,
                message: 'Department not found',
            });
        }

        // Step 4: Assign the ward to the department by adding the ward's _id
        department.ward.push(newWard._id);  // Add the ward's ID to the department's wards array

        // Save the department with the updated list of wards
        await department.save();

        res.status(201).json({
            success: true,
            message: 'Ward created and assigned successfully',
            ward: newWard,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// Add beds to a ward


// Simple controller to get all wards
exports.getAllWards = async (req, res) => {
    try {
        // Fetch all wards from the database
        const wards = await hospitalModel.ward.find();

        // Return the wards array
        res.status(200).json({
            success: true,
            count: wards.length,
            data: wards
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: "Failed to fetch wards",
            error: error.message
        });
    }
};

// Update Ward by ID//
exports.updateWardById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate the ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ward ID format"
            });
        }

        // Check if ward exists
        const existingWard = await hospitalModel.ward.findById(id);
        if (!existingWard) {
            return res.status(404).json({
                success: false,
                message: "Ward not found"
            });
        }

        // Prevent changing certain fields if needed
        if (updates._id) {
            return res.status(400).json({
                success: false,
                message: "Cannot change ward ID"
            });
        }

        // Update the ward
        const updatedWard = await hospitalModel.ward.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Ward updated successfully",
            data: updatedWard
        });

    } catch (error) {
        console.error("Error updating ward:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update ward",
            error: error.message
        });
    }
};



// wardController.js
exports.getWardsByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        // 1. Find the department (corrected findById usage)
        const department = await hospitalModel.departments.findById({ _id: departmentId });
        console.log(department)
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // 2. Get ward IDs from department (note: field name is 'ward' not 'wards')
        const wardIds = department.ward; // Use the correct field name from your schema
        console.log(wardIds);
        // 3. Convert string IDs to ObjectIds if needed

        // 4. Find wards using correct model reference (assuming model name is 'Ward')
        const wards = await hospitalModel.ward.find({
            _id: wardIds
        });


        res.status(200).json(wards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Fetch all wards in a department by department name

