import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Modal, Button, Select, Input, Textarea, Badge, Checkbox } from './ui'; // Assume these are custom UI components

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [filter, setFilter] = useState({
    category: 'all',
    priority: 'all',
    completed: false
  });

  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: '10:00',
    priority: 'medium',
    category: 'work',
    completed: false
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: 'Team Meeting',
        description: 'Weekly team sync',
        start: '2023-06-15T09:00:00',
        end: '2023-06-15T10:00:00',
        priority: 'high',
        category: 'work',
        completed: false
      },
      // ... more sample events
    ];
    setEvents(sampleEvents);
  }, []);

  const onDateClick = day => {
    setSelectedDate(day);
    setEventForm(prev => ({
      ...prev,
      startDate: format(day, 'yyyy-MM-dd'),
      endDate: format(day, 'yyyy-MM-dd')
    }));
  };

  const renderHeader = () => {
    const dateFormat = 'MMMM yyyy';
    return (
      <div className="flex items-center justify-between py-4 px-6 bg-primary-600 text-white rounded-t-lg">
        <Button 
          onClick={() => setCurrentDate(addDays(currentDate, -1))}
          className="p-2 rounded-full hover:bg-primary-700"
        >
          ◀
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, dateFormat)}
        </h2>
        <Button 
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2 rounded-full hover:bg-primary-700"
        >
          ▶
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="w-full text-center p-2 font-medium" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 bg-primary-100">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = events.filter(event => 
          isSameDay(parseISO(event.start), cloneDay)
        );

        days.push(
          <div
            className={`min-h-24 p-2 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-100 text-gray-400' : ''
            } ${isSameDay(day, selectedDate) ? 'bg-primary-50' : ''}`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex justify-between">
              <span className={`text-sm ${
                isSameDay(day, new Date()) ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {formattedDate}
              </span>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentEvent(null);
                  setEventForm({
                    ...eventForm,
                    startDate: format(cloneDay, 'yyyy-MM-dd'),
                    endDate: format(cloneDay, 'yyyy-MM-dd')
                  });
                  setShowEventModal(true);
                }}
                className="text-xs p-1"
              >
                +
              </Button>
            </div>
            <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  className={`text-xs p-1 rounded truncate cursor-pointer ${
                    event.completed ? 'line-through opacity-70' : ''
                  } ${
                    event.priority === 'high' ? 'bg-red-100 border-l-4 border-red-500' :
                    event.priority === 'medium' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                    'bg-green-100 border-l-4 border-green-500'
                  }`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  const handleEventClick = (event) => {
    setCurrentEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      startDate: format(parseISO(event.start), 'yyyy-MM-dd'),
      startTime: format(parseISO(event.start), 'HH:mm'),
      endDate: format(parseISO(event.end), 'yyyy-MM-dd'),
      endTime: format(parseISO(event.end), 'HH:mm'),
      priority: event.priority,
      category: event.category,
      completed: event.completed
    });
    setShowEventModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: currentEvent ? currentEvent.id : Date.now(),
      title: eventForm.title,
      description: eventForm.description,
      start: `${eventForm.startDate}T${eventForm.startTime}:00`,
      end: `${eventForm.endDate}T${eventForm.endTime}:00`,
      priority: eventForm.priority,
      category: eventForm.category,
      completed: eventForm.completed
    };

    if (currentEvent) {
      setEvents(events.map(event => 
        event.id === currentEvent.id ? newEvent : event
      ));
    } else {
      setEvents([...events, newEvent]);
    }

    setShowEventModal(false);
  };

  const handleDelete = () => {
    setEvents(events.filter(event => event.id !== currentEvent.id));
    setShowEventModal(false);
  };

  const filteredEvents = events.filter(event => {
    return (
      (filter.category === 'all' || event.category === filter.category) &&
      (filter.priority === 'all' || event.priority === filter.priority) &&
      (!filter.completed || event.completed === filter.completed)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Event List Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-primary-600 text-white">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <Select
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              options={[
                {value: 'all', label: 'All Categories'},
                {value: 'work', label: 'Work'},
                {value: 'personal', label: 'Personal'},
                {value: 'family', label: 'Family'}
              ]}
            />
            <Select
              value={filter.priority}
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
              options={[
                {value: 'all', label: 'All Priorities'},
                {value: 'high', label: 'High'},
                {value: 'medium', label: 'Medium'},
                {value: 'low', label: 'Low'}
              ]}
            />
            <Checkbox
              label="Show completed"
              checked={filter.completed}
              onChange={(e) => setFilter({...filter, completed: e.target.checked})}
            />
          </div>
        </div>
        <div className="p-4">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500">No events found</p>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    event.completed ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${
                      event.completed ? 'line-through text-gray-500' : ''
                    }`}>
                      {event.title}
                    </h3>
                    <Badge 
                      variant={
                        event.priority === 'high' ? 'danger' :
                        event.priority === 'medium' ? 'warning' : 'success'
                      }
                    >
                      {event.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>
                      {format(parseISO(event.start), 'MMM d, yyyy h:mm a')} -{' '}
                      {format(parseISO(event.end), 'h:mm a')}
                    </span>
                    <span className="ml-4 capitalize">{event.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={currentEvent ? 'Edit Event' : 'Add New Event'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
              required
            />
            <Textarea
              label="Description"
              value={eventForm.description}
              onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                required
              />
              <Input
                type="time"
                label="Start Time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="End Date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
                required
              />
              <Input
                type="time"
                label="End Time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={eventForm.priority}
                onChange={(e) => setEventForm({...eventForm, priority: e.target.value})}
                options={[
                  {value: 'high', label: 'High'},
                  {value: 'medium', label: 'Medium'},
                  {value: 'low', label: 'Low'}
                ]}
              />
              <Select
                label="Category"
                value={eventForm.category}
                onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                options={[
                  {value: 'work', label: 'Work'},
                  {value: 'personal', label: 'Personal'},
                  {value: 'family', label: 'Family'},
                  {value: 'other', label: 'Other'}
                ]}
              />
            </div>
            <Checkbox
              label="Completed"
              checked={eventForm.completed}
              onChange={(e) => setEventForm({...eventForm, completed: e.target.checked})}
            />
          </div>
          <div className="flex justify-between mt-6">
            <div>
              {currentEvent && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentEvent ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Calendar;