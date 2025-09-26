"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Therapist {
  therapist_id: number;
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  specialties: string;
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTherapist, setIsAddingTherapist] = useState(false);
  const [newTherapist, setNewTherapist] = useState({
    name: "",
    email: "",
    phone: "",
    qualifications: "",
    specialties: "",
  });

  useEffect(() => {
    fetchTherapists();
  }, []);

  async function fetchTherapists() {
    try {
      console.log('Frontend: Fetching therapists...');
      const response = await fetch("/api/therapists");
      console.log('Frontend: Response status:', response.status);
      const data = await response.json();
      console.log('Frontend: Received data:', data);
      if (response.ok) {
        setTherapists(data);
      } else {
        toast.error("বিশেষজ্ঞের তথ্য লোড করতে সমস্যা হয়েছে");
      }
    } catch (error) {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTherapist(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingTherapist(true);
    
    try {
      const response = await fetch("/api/therapists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTherapist),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("বিশেষজ্ঞ যোগ করা হয়েছে");
        fetchTherapists();
        setNewTherapist({
          name: "",
          email: "",
          phone: "",
          qualifications: "",
          specialties: "",
        });
      } else {
        toast.error(data.error || "বিশেষজ্ঞ যোগ করতে সমস্যা হয়েছে");
      }
    } catch (error) {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setIsAddingTherapist(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">বিশেষজ্ঞ তালিকা</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              নতুন বিশেষজ্ঞ যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন বিশেষজ্ঞ যোগ করুন</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTherapist} className="space-y-4">
              <Input
                placeholder="নাম"
                value={newTherapist.name}
                onChange={(e) =>
                  setNewTherapist({ ...newTherapist, name: e.target.value })
                }
                required
              />
              <Input
                type="email"
                placeholder="ইমেইল"
                value={newTherapist.email}
                onChange={(e) =>
                  setNewTherapist({ ...newTherapist, email: e.target.value })
                }
                required
              />
              <Input
                placeholder="ফোন"
                value={newTherapist.phone}
                onChange={(e) =>
                  setNewTherapist({ ...newTherapist, phone: e.target.value })
                }
                required
              />
              <Input
                placeholder="যোগ্যতা"
                value={newTherapist.qualifications}
                onChange={(e) =>
                  setNewTherapist({
                    ...newTherapist,
                    qualifications: e.target.value,
                  })
                }
                required
              />
              <Input
                placeholder="বিশেষজ্ঞতা"
                value={newTherapist.specialties}
                onChange={(e) =>
                  setNewTherapist({
                    ...newTherapist,
                    specialties: e.target.value,
                  })
                }
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isAddingTherapist}
              >
                {isAddingTherapist ? "যোগ করা হচ্ছে..." : "যোগ করুন"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => (
          <Card key={therapist.therapist_id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{therapist.name}</h3>
            <p className="text-gray-600 mb-1">{therapist.email}</p>
            <p className="text-gray-600 mb-1">{therapist.phone}</p>
            <p className="text-gray-600 mb-2">{therapist.qualifications}</p>
            {therapist.specialties && (
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.split(",").map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded"
                  >
                    {specialty.trim()}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
