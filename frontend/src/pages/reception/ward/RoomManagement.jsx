import React from 'react';

const RoomManagement = ({ rooms, onRoomChange, departmentNurses }) => {
  const [localRooms, setLocalRooms] = React.useState(rooms || []);

  React.useEffect(() => {
    setLocalRooms(rooms || []);
  }, [rooms]);

  const handleAddRoom = () => {
    const newRoom = {
      roomNumber: '',
      capacity: 0,
      nurses: []
    };
    const updatedRooms = [...localRooms, newRoom];
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = [...localRooms];
    updatedRooms.splice(index, 1);
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...localRooms];
    updatedRooms[index][field] = value;
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  const handleAddNurseToRoom = (roomIndex) => {
    const updatedRooms = [...localRooms];
    updatedRooms[roomIndex].nurses.push({
      nurseId: '',
      role: ''
    });
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  const handleRemoveNurseFromRoom = (roomIndex, nurseIndex) => {
    const updatedRooms = [...localRooms];
    updatedRooms[roomIndex].nurses.splice(nurseIndex, 1);
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  const handleNurseChange = (roomIndex, nurseIndex, field, value) => {
    const updatedRooms = [...localRooms];
    updatedRooms[roomIndex].nurses[nurseIndex][field] = value;
    setLocalRooms(updatedRooms);
    onRoomChange(updatedRooms);
  };

  return (
    <div className="mb-6 border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Room Management</h3>
        <button
          type="button"
          onClick={handleAddRoom}
          className="bg-primary-500 hover:bg-primary-600 text-white py-1 px-3 rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Room
        </button>
      </div>

      {localRooms.map((room, roomIndex) => (
        <div key={roomIndex} className="border rounded-lg p-4 mb-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Room {roomIndex + 1}</h4>
            <button
              type="button"
              onClick={() => handleRemoveRoom(roomIndex)}
              className="text-red-500 hover:text-red-700 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Room Number</label>
              <input
                type="text"
                value={room.roomNumber}
                onChange={(e) => handleRoomChange(roomIndex, 'roomNumber', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
              <input
                type="number"
                value={room.capacity}
                onChange={(e) => handleRoomChange(roomIndex, 'capacity', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-medium text-gray-600">Nurses</h5>
              <button
                type="button"
                onClick={() => handleAddNurseToRoom(roomIndex)}
                className="text-primary-500 hover:text-primary-700 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Nurse
              </button>
            </div>

            {room.nurses.map((nurse, nurseIndex) => (
              <div key={nurseIndex} className="grid grid-cols-3 gap-4 mt-3 items-center">
                <div>
                  <select
                    value={nurse.nurseId}
                    onChange={(e) => handleNurseChange(roomIndex, nurseIndex, 'nurseId', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select Nurse</option>
                    {departmentNurses.map((n) => (
                      <option key={n._id} value={n._id}>
                        {n.firstName} {n.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Role"
                    value={nurse.role}
                    onChange={(e) => handleNurseChange(roomIndex, nurseIndex, 'role', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNurseFromRoom(roomIndex, nurseIndex)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomManagement;