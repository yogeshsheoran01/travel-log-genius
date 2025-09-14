import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Users, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Trip {
  trip_number: string;
  origin: string;
  destination: string;
  mode: string;
  start_time: string;
  end_time: string;
  companions: string;
}

interface TripFormProps {
  onTripSaved: () => void;
}

const transportModes = [
  "Walking", "Bicycle", "Motorcycle", "Car", "Bus", "Train", "Metro", "Auto Rickshaw", "Taxi", "Other"
];

export const TripForm = ({ onTripSaved }: TripFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trip, setTrip] = useState<Trip>({
    trip_number: "",
    origin: "",
    destination: "",
    mode: "",
    start_time: "",
    end_time: "",
    companions: ""
  });

  // Auto-detect location and time
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setTrip((prev) => ({
            ...prev,
            origin: prev.origin || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          }));
        },
        (error) => {
          // Could not get location
        }
      );
    }
    // Auto-fill start time if empty
    setTrip((prev) => ({
      ...prev,
      start_time: prev.start_time || new Date().toISOString().slice(0, 16)
    }));
  }, []);

  const handleInputChange = (field: keyof Trip, value: string) => {
    setTrip(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip.origin || !trip.destination || !trip.mode) {
      toast({
        title: "Missing Information",
        description: "Please fill in origin, destination, and mode of transport.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please login to save trips.",
          variant: "destructive"
        });
        return;
      }

      const tripData = {
        user_id: user.id,
        trip_number: trip.trip_number || null,
        origin: trip.origin,
        destination: trip.destination,
        mode: trip.mode,
        start_time: trip.start_time || null,
        end_time: trip.end_time || null,
        companions: trip.companions || null
      };

      const { error } = await supabase
        .from('trips')
        .insert([tripData]);

      if (error) {
        console.error('Trip save error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to save trip data.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Trip Saved Successfully",
        description: "Your trip data has been recorded for transportation research.",
        className: "bg-success text-success-foreground"
      });
      
      // Reset form
      setTrip({
        trip_number: "",
        origin: "",
        destination: "",
        mode: "",
        start_time: "",
        end_time: "",
        companions: ""
      });
      
      onTripSaved();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="w-5 h-5 text-primary" />
          <span>Record New Trip</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_number">Trip Number (Optional)</Label>
              <Input
                id="trip_number"
                value={trip.trip_number}
                onChange={(e) => handleInputChange("trip_number", e.target.value)}
                placeholder="e.g., T001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Origin *</span>
              </Label>
              <Input
                id="origin"
                value={trip.origin}
                onChange={(e) => handleInputChange("origin", e.target.value)}
                placeholder="Starting location"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Destination *</span>
              </Label>
              <Input
                id="destination"
                value={trip.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="End location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode of Transport *</Label>
            <Select value={trip.mode} onValueChange={(value) => handleInputChange("mode", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                {transportModes.map((mode) => (
                  <SelectItem key={mode} value={mode.toLowerCase()}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-success" />
                <span>Start Time</span>
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={trip.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-warning" />
                <span>End Time</span>
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={trip.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companions" className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-accent" />
              <span>Travel Companions</span>
            </Label>
            <Textarea
              id="companions"
              value={trip.companions}
              onChange={(e) => handleInputChange("companions", e.target.value)}
              placeholder="Number and details of accompanying travelers (optional)"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Trip"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};