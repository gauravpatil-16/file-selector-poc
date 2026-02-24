import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TimeSlotList = ({ timeslots, service, onBookSlot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!timeslots || Object.keys(timeslots).length === 0) {
    return (
      <Card className="p-8 text-center">
        <ApperIcon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No availability set</h3>
        <p className="text-gray-500">This service doesn't have availability configured yet.</p>
      </Card>
    );
  }

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const hasAnySlots = Object.values(timeslots).some(daySlots => daySlots && daySlots.length > 0);

  if (!hasAnySlots) {
    return (
      <Card className="p-8 text-center">
        <ApperIcon name="CalendarX" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No available times</h3>
        <p className="text-gray-500">This service is not available during the selected week.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(timeslots)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, daySlots]) => {
          if (!daySlots || daySlots.length === 0) {
            return (
              <Card key={date} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{getDayName(date)}</h4>
                  <span className="text-sm text-gray-500">No availability</span>
                </div>
              </Card>
            );
          }

          return (
            <Card key={date} className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">{getDayName(date)}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {daySlots.map((slot, index) => (
                  <Button
                    key={`${date}-${slot.time}-${index}`}
                    variant={selectedSlot === `${date}-${slot.time}` ? "default" : "outline"}
                    size="sm"
                    className="justify-center"
                    onClick={() => {
                      setSelectedSlot(`${date}-${slot.time}`);
                      onBookSlot({
                        ...slot,
                        date,
                        displayTime: slot.time,
                        service: service
                      });
                    }}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </Card>
          );
        })}
    </div>
  );
};

export default TimeSlotList;