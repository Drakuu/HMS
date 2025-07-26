import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiSave } from 'react-icons/fi';

const NotesAndDiagnostics = () => {
    const [activeTab, setActiveTab] = useState('notes');
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState([
        {
            id: 1,
            title: 'Patient Follow-up',
            content: 'Patient reported reduced symptoms after medication adjustment. Schedule follow-up in 2 weeks.',
            date: '2023-06-15',
            patient: 'John Doe',
            tags: ['follow-up', 'improvement']
        },
        {
            id: 2,
            title: 'Allergy Note',
            content: 'Patient has severe allergy to penicillin. Confirm with patient about other antibiotic allergies.',
            date: '2023-06-10',
            patient: 'Sarah Johnson',
            tags: ['allergy', 'warning']
        }
    ]);

    const [diagnostics, setDiagnostics] = useState([
        {
            id: 1,
            testName: 'Complete Blood Count',
            result: 'WBC: 6.5, RBC: 4.7, HGB: 14.2',
            date: '2023-06-12',
            patient: 'John Doe',
            status: 'normal',
            interpretation: 'All values within normal range'
        },
        {
            id: 2,
            testName: 'Lipid Panel',
            result: 'Cholesterol: 210, LDL: 130, HDL: 45',
            date: '2023-06-08',
            patient: 'Sarah Johnson',
            status: 'elevated',
            interpretation: 'Elevated LDL cholesterol noted. Recommend dietary changes.'
        }
    ]);

    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        patient: '',
        tags: []
    });

    const [newDiagnostic, setNewDiagnostic] = useState({
        testName: '',
        result: '',
        patient: '',
        interpretation: ''
    });

    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingDiagnostic, setIsAddingDiagnostic] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    const handleAddNote = () => {
        setNotes([...notes, {
            ...newNote,
            id: notes.length + 1,
            date: new Date().toISOString().split('T')[0],
            tags: newNote.tags
        }]);
        setNewNote({ title: '', content: '', patient: '', tags: [] });
        setIsAddingNote(false);
    };

    const handleAddDiagnostic = () => {
        setDiagnostics([...diagnostics, {
            ...newDiagnostic,
            id: diagnostics.length + 1,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        }]);
        setNewDiagnostic({ testName: '', result: '', patient: '', interpretation: '' });
        setIsAddingDiagnostic(false);
    };

    const addTag = () => {
        if (currentTag.trim() && !newNote.tags.includes(currentTag.trim())) {
            setNewNote({
                ...newNote,
                tags: [...newNote.tags, currentTag.trim()]
            });
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setNewNote({
            ...newNote,
            tags: newNote.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredDiagnostics = diagnostics.filter(diag =>
        diag.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diag.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diag.result.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Clinical Notes & Diagnostics</h1>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`py-2 px-4 font-medium flex items-center ${activeTab === 'notes' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                >
                    Clinical Notes
                    <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {notes.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('diagnostics')}
                    className={`py-2 px-4 font-medium flex items-center ${activeTab === 'diagnostics' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                >
                    Diagnostics
                    <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {diagnostics.length}
                    </span>
                </button>
            </div>

            {/* Search and Add Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => activeTab === 'notes' ? setIsAddingNote(true) : setIsAddingDiagnostic(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="mr-2" />
                    Add {activeTab === 'notes' ? 'Note' : 'Diagnostic'}
                </button>
            </div>

            {/* Add Note Form */}
            <AnimatePresence>
                {isAddingNote && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-4">Add New Clinical Note</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newNote.patient}
                                    onChange={(e) => setNewNote({ ...newNote, patient: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add tag and press Enter"
                                />
                                <button
                                    onClick={addTag}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap mt-2">
                                {newNote.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-primary-800 bg-primary-100 rounded-full"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 text-primary-600 hover:text-primary-800"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsAddingNote(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.title || !newNote.content}
                                className={`px-4 py-2 rounded-md flex items-center ${!newNote.title || !newNote.content ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                <FiSave className="mr-2" />
                                Save Note
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Diagnostic Form */}
            <AnimatePresence>
                {isAddingDiagnostic && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-4">Add New Diagnostic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newDiagnostic.testName}
                                    onChange={(e) => setNewDiagnostic({ ...newDiagnostic, testName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newDiagnostic.patient}
                                    onChange={(e) => setNewDiagnostic({ ...newDiagnostic, patient: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newDiagnostic.result}
                                    onChange={(e) => setNewDiagnostic({ ...newDiagnostic, result: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={newDiagnostic.interpretation}
                                    onChange={(e) => setNewDiagnostic({ ...newDiagnostic, interpretation: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsAddingDiagnostic(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddDiagnostic}
                                disabled={!newDiagnostic.testName || !newDiagnostic.result}
                                className={`px-4 py-2 rounded-md flex items-center ${!newDiagnostic.testName || !newDiagnostic.result ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                <FiSave className="mr-2" />
                                Save Diagnostic
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Tab Content */}
            {activeTab === 'notes' && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {filteredNotes.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">No clinical notes found. Create your first note!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredNotes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                                            <span className="text-xs text-gray-500">{note.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{note.content}</p>
                                        <p className="text-sm font-medium text-primary-600 mb-3">Patient: {note.patient}</p>
                                        <div className="flex flex-wrap">
                                            {note.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-1 mr-2 mb-2 text-xs font-medium text-primary-800 bg-primary-100 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2">
                                        <button className="p-1 text-gray-500 hover:text-primary-600 transition-colors">
                                            <FiEdit2 />
                                        </button>
                                        <button className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Diagnostics Tab Content */}
            {activeTab === 'diagnostics' && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {filteredDiagnostics.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">No diagnostic results found. Add your first diagnostic!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDiagnostics.map((diag) => (
                                        <motion.tr
                                            key={diag.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{diag.testName}</div>
                                                <div className="text-sm text-gray-500 mt-1">{diag.result}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {diag.patient}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {diag.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${diag.status === 'normal' ? 'bg-green-100 text-green-800' :
                                                        diag.status === 'elevated' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {diag.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-primary-600 hover:text-primary-900 mr-3">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default NotesAndDiagnostics;