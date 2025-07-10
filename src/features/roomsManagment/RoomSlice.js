import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const getAuthHeaders = () => {
    const jwtLoginToken = localStorage.getItem('jwtLoginToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtLoginToken}`
    };
};

// CRUD Operations
export const createRoom = createAsyncThunk(
    'rooms/createRoom',
    async (roomData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/rooms/create-room`, roomData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to create room";
            return rejectWithValue({
                message,
                statusCode: error.response?.status || 500
            });
        }
    }
);

export const getAllRooms = createAsyncThunk(
    'rooms/getRooms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/rooms/get-rooms`, {
                headers: getAuthHeaders()
            });
            return response.data.roomsList;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch rooms';
            return rejectWithValue({ message });
        }
    }
);


export const updateRoom = createAsyncThunk(
    'rooms/updateRoom',
    async ({ id, roomData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/rooms/update-room/${id}`, roomData, {
                headers: getAuthHeaders()
            });

            return response.data.room; // Ensure the response contains the expected data
        } catch (error) {
            // Log the error to better understand the structure
            console.error('Error:', error);

            const message = error.response?.data?.message || 'Failed to update room';
            return rejectWithValue({ message });
        }
    }
);

export const deleteRoom = createAsyncThunk(
    'rooms/deleteRoom',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/rooms/delete-room/${id}`, {
                headers: getAuthHeaders()
            });
            return id;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete room';
            return rejectWithValue({ message });
        }
    }
);

const initialState = {
    room: {
        department: '',
        roomNumber: '',
        wardType: '',
        bedCount: 0,
        availableBeds: 0,
        equipment: [],
        floor: 0,
        assignedDoctor: '',
        features: [],
        charges: 0,
        beds: []  // Add beds array to initial state
    },
    rooms: [],
    isLoading: false,
    isError: false,
    error: null,
    success: false
};

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        resetRoom: (state) => {
            state.room = initialState.room;
            state.isLoading = false;
            state.isError = false;
            state.error = null;
            state.success = false;
        },
        updateRoomField: (state, action) => {
            const { field, value } = action.payload;
            if (field == 'beds') {
                state.room.beds = value
            } else {
                state.room[field] = value;
            }
        },
        resetSuccess: (state) => {
            state.success = false;
        },
        updateBedStatus: (state, action) => {
            const { roomId, bedNumber, status } = action.payload;
            const room = state.rooms.find(r => r._id === roomId);
            if (room) {
                const bed = room.beds.find(b => b.number === bedNumber);
                if (bed) {
                    bed.status = status;
                    // Recalculate available beds if needed
                    room.availableBeds = room.beds.filter(b => b.status === 'available').length;
                }
            }
        },
        addBedToRoom: (state, action) => {
            const { roomId } = action.payload;
            const room = state.rooms.find(r => r._id === roomId);
            if (room) {
                const newBedNumber = room.beds.length + 1;
                room.beds.push({
                    number: newBedNumber,
                    status: 'available',
                    otherInfo: ''
                });
                room.bedCount = room.beds.length;
                room.availableBeds++;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Room
            .addCase(createRoom.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.error = null;
                state.success = false;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rooms.push(action.payload);
                state.success = true;
                state.room = action.payload
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.message;
            })

            // Get All Rooms
            .addCase(getAllRooms.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(getAllRooms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rooms = action.payload || [];
            })
            .addCase(getAllRooms.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.message;
            })

            // Update Room
            .addCase(updateRoom.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.error = null;
                state.success = false;
            })
            .addCase(updateRoom.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedRoom = action.payload;
                // Find the index of the updated room in the rooms array
                const index = state.rooms.findIndex(room => room._id === updatedRoom._id);
                if (index !== -1) {
                    state.rooms[index] = updatedRoom;
                }
                state.room = updatedRoom;
                state.success = true;
            })
            .addCase(updateRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.message;
            })

            // Delete Room
            .addCase(deleteRoom.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.error = null;
            })
            .addCase(deleteRoom.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rooms = state.rooms.filter(room => room._id !== action.payload);
            })
            .addCase(deleteRoom.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.payload?.message;
            });
    }
});

// Export actions
export const { resetRoom, updateRoomField, resetSuccess } = roomSlice.actions;

// Selectors
export const selectCurrentRoom = (state) => state.room.room;
export const selectAllRooms = (state) => state.room.rooms;
export const selectRoomLoading = (state) => state.room.isLoading;
export const selectRoomError = (state) => state.room.error;
export const selectRoomSuccess = (state) => state.room.success;
// Get beds for a specific room
export const selectBedsByRoomId = (roomId) => (state) =>
    state.room.rooms.find(room => room._id === roomId)?.beds || [];

// Get available beds for a specific room
export const selectAvailableBedsByRoomId = (roomId) => (state) =>
    state.room.rooms.find(room => room._id === roomId)?.beds.filter(bed => bed.status === 'available') || [];

// Get bed by number in a room
export const selectBedByNumber = (roomId, bedNumber) => (state) =>
    state.room.rooms.find(room => room._id === roomId)?.beds.find(bed => bed.number === bedNumber);

export default roomSlice.reducer;