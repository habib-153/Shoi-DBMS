"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User,
  Stethoscope,
  Brain,
  Syringe,
  Mail,
  Phone,
  FileUp,
  School,
  BadgeCheck,
  PencilLine,
  ClipboardList,
  Calendar,
  Sparkles,
  Heart,
} from "lucide-react";

type Role = "user" | "specialist";
type SpecialistType = "psychologist" | "psychiatrist";

export default function RegisterPage() {
  const router = useRouter();

  // top-level role
  const [role, setRole] = useState<Role>("user");
  const [specType, setSpecType] = useState<SpecialistType>("psychologist");

  // user/patient
  const [uAnon, setUAnon] = useState(false);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uDateOfBirth, setUDateOfBirth] = useState("");
  const [uGender, setUGender] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uHobby, setUHobby] = useState("");
  const [uFree, setUFree] = useState("");
  const [uAssessment, setUAssessment] = useState("");

  // specialist – common
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sInterested, setSInterested] = useState("");

  // psychologist
  const [pUni, setPUni] = useState("");
  const [pCertLink, setPCertLink] = useState(""); // Google Drive link

  // psychiatrist
  const [qMed, setQMed] = useState("");
  const [qLicense, setQLicense] = useState("");
  const [qCertLink, setQCertLink] = useState(""); // Google Drive link

  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let payload;

    if (role === "user") {
      if (!uAnon && !uName)
        return toast.error("Enter a Name or Select Anonymous.");
      if (!uEmail) return toast.error("Enter E-mail");
      if (!uPassword) return toast.error("Enter a password");
      if (!uDateOfBirth) return toast.error("Enter your date of birth");

      payload = {
        role,
        name: uAnon ? "Anonymous" : uName,
        email: uEmail,
        gender: uGender || null,
        phone: uPhone || null,
        date_of_birth: uDateOfBirth,
        password: uPassword,
        hobby: uHobby || null,
        profession: uFree || null,
        free_text: uAssessment || null
      };
    } else {
      // specialist validation
      if (!sName || !sEmail || !sPassword) return toast.error("Enter Your Name, E-mail and Password.");

      if (specType === "psychologist") {
        if (!pUni) return toast.error("Name the University");
        if (!pCertLink) return toast.error("Enter Course Certificate Google Drive Link");
        
        payload = {
          name: sName,
          email: sEmail,
          password: sPassword,
          university: pUni, // will be stored in educational_info
          certificate: pCertLink, // Google Drive link will be stored in image column
          interested: sInterested || null // will be stored in interested_field
        };
      } else {
        if (!qMed) return toast.error("Enter Medical College Name");
        if (!qLicense) return toast.error("Enter the License Number.");
        if (!qCertLink) return toast.error("Enter Certification Documents Google Drive Link");

        payload = {
          name: sName,
          email: sEmail,
          password: sPassword,
          university: qMed, // will be stored in educational_info
          certificate: qCertLink, // Google Drive link will be stored in image column
          license_no: qLicense,
          interested: sInterested || null // will be stored in interested_field
        };
      }
    }

    setLoading(true);
    try {
      let response;
      if (role === "user") {
        // User registration using auth/register API
        response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Specialist registration using therapists API
        response = await fetch("/api/therapists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Successfully Registered!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-white" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20, scale: isVisible ? 1 : 0.95 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-5xl"
      >
        <Card className="relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-2 border-[#2596be]/20 shadow-2xl shadow-[#2596be]/10 rounded-3xl overflow-hidden">
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-[#2596be]/5 pointer-events-none" />
          
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center mb-4"
          >
            <img src="/4F43E8E1-1786-4A37-93AF-2E381EE3B968.png" alt="সই Logo" className="h-20 w-auto" />
          </motion.div>
        
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2596be] flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-[#2596be]" />
              </motion.div>
              সই — Registration
            </h2>
            <a href="/login" className="text-sm text-[#2596be] hover:underline font-medium">
              Already Have an Account? Login
            </a>
          </motion.div>

          {/* role tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Tab
              active={role === "user"}
              onClick={() => setRole("user")}
              icon={<User className="w-4 h-4" />}
              label="User / Patient"
            />
            <Tab
              active={role === "specialist"}
              onClick={() => setRole("specialist")}
              icon={<Stethoscope className="w-4 h-4" />}
              label="Specialist"
            />
          </motion.div>

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-8">
          {/* LEFT — Illustration */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-cyan-50 grid place-items-center p-6">
              <img
                src="/login.ico"
                className="w-80 h-80 object-contain drop-shadow"
                alt="illustration"
              />
            </div>
          </div>

          {/* RIGHT — Dynamic form */}
          <div className="space-y-6">
            {role === "user" ? (
              <>
                <Section
                  title="Introduction"
                  icon={<User className="w-4 h-4 text-[#2596be]" />}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        className="accent-[#2596be]"
                        checked={uAnon}
                        onChange={(e) => {
                          setUAnon(e.target.checked);
                          if (e.target.checked) {
                            setUName(""); // Clear name when anonymous is selected
                          }
                        }}
                      />
                      Anonymous User
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    {!uAnon && (
                      <Field label="Name">
                        <Input
                          placeholder="Your Name"
                          value={uName}
                          onChange={(e) => setUName(e.target.value)}
                        />
                      </Field>
                    )}
                    <Field label="E-Mail">
                      <Input
                        type="email"
                        placeholder="name@email.com"
                        value={uEmail}
                        onChange={(e) => setUEmail(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Password">
                      <Input
                        type="password"
                        placeholder="Enter Password"
                        value={uPassword}
                        onChange={(e) => setUPassword(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Date of Birth">
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          className="pl-9"
                          type="date"
                          value={uDateOfBirth}
                          onChange={(e) => setUDateOfBirth(e.target.value)}
                          required
                        />
                      </div>
                    </Field>
                    <Field label="Phone">
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          className="pl-9"
                          placeholder="+8801XXXXXXXXX"
                          value={uPhone}
                          onChange={(e) => setUPhone(e.target.value)}
                        />
                      </div>
                    </Field>
                    <Field label="Gender">
                      <div className="relative">
                        {!uGender && <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />}
                        <select
                          className={`w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2596be] appearance-none text-gray-500 ${!uGender ? 'pl-9' : 'pl-3'} py-2`}
                          value={uGender}
                          onChange={(e) => setUGender(e.target.value)}
                        >
                          <option value="" disabled hidden className="text-gray-500">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </Field>
                  </div>
                </Section>

                <Section
                  title="Hobby & Note"
                  icon={<PencilLine className="w-4 h-4 text-[#2596be]" />}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Your Hobby (Optional)">
                      <Input
                        placeholder="Gaming, Music..."
                        value={uHobby}
                        onChange={(e) => setUHobby(e.target.value)}
                      />
                    </Field>
                    <Field label="Profession (Optional)">
                      <Input
                        placeholder="Student, Engineer..."
                        value={uFree}
                        onChange={(e) => setUFree(e.target.value)}
                      />
                    </Field>
                  </div>
                </Section>

                <Section
                  title="Additional Information (Optional)"
                  icon={<ClipboardList className="w-4 h-4 text-[#2596be]" />}
                >
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                    placeholder="How are you feeling? What kind of support are you looking for?"
                    value={uAssessment}
                    onChange={(e) => setUAssessment(e.target.value)}
                  />
                </Section>
              </>
            ) : (
              <>
                {/* Specialist type toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <SmallTab
                    active={specType === "psychologist"}
                    onClick={() => setSpecType("psychologist")}
                    icon={<Brain className="w-4 h-4" />}
                    label="Psychologist"
                  />
                  <SmallTab
                    active={specType === "psychiatrist"}
                    onClick={() => setSpecType("psychiatrist")}
                    icon={<Syringe className="w-4 h-4" />}
                    label="Psychiatrist"
                  />
                </div>

                {/* Specialist common */}
                <Section
                  title="General Information"
                  icon={<Stethoscope className="w-4 h-4 text-[#2596be]" />}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <Input
                        placeholder="Your Name"
                        value={sName}
                        onChange={(e) => setSName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="E-Mail">
                      <Input
                        type="email"
                        placeholder="name@email.com"
                        value={sEmail}
                        onChange={(e) => setSEmail(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Password">
                      <Input
                        type="password"
                        placeholder="Enter secure password"
                        value={sPassword}
                        onChange={(e) => setSPassword(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        placeholder="+8801XXXXXXXXX"
                        value={sPhone}
                        onChange={(e) => setSPhone(e.target.value)}
                      />
                    </Field>
                    <Field label="Interested In">
                      <Input
                        placeholder="Depression, Anxiety..."
                        value={sInterested}
                        onChange={(e) => setSInterested(e.target.value)}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Psychologist */}
                {specType === "psychologist" && (
                  <Section
                    title="Psychologist — Educational Information"
                    icon={<School className="w-4 h-4 text-[#2596be]" />}
                  >
                    <div className="space-y-4">
                      <Field label="University">
                        <Input
                          placeholder="University Name"
                          value={pUni}
                          onChange={(e) => setPUni(e.target.value)}
                          required
                        />
                      </Field>
                      <Field label="Course Certificate (Google Drive Link)">
                        <div className="relative">
                          <FileUp className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <Input
                            className="pl-9"
                            type="text"
                            placeholder="Paste Google Drive link here"
                            value={pCertLink}
                            onChange={(e) => setPCertLink(e.target.value)}
                            required
                          />
                        </div>
                      </Field>
                    </div>
                  </Section>
                )}

                {/* Psychiatrist */}
                {specType === "psychiatrist" && (
                  <Section
                    title="Psychiatrist — Degrees and Licenses"
                    icon={<BadgeCheck className="w-4 h-4 text-[#2596be]" />}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Medical College">
                        <Input
                          placeholder="Medical College Name"
                          value={qMed}
                          onChange={(e) => setQMed(e.target.value)}
                          required
                        />
                      </Field>
                      <Field label="License Number">
                        <Input
                          placeholder="BMDC Registration Number"
                          value={qLicense}
                          onChange={(e) => setQLicense(e.target.value)}
                          required
                        />
                      </Field>
                      <Field label="Certification Documents (Google Drive Link)" className="col-span-2">
                        <div className="relative">
                          <FileUp className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <Input
                            className="pl-9"
                            type="text"
                            placeholder="Paste Google Drive link here"
                            value={qCertLink}
                            onChange={(e) => setQCertLink(e.target.value)}
                            required
                          />
                        </div>
                      </Field>
                    </div>
                  </Section>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? "Registering..." : "Complete the Registration"}
            </Button>
          </div>
        </form>
      </Card>
      </motion.div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden
      ${
        active
          ? "bg-[#2596be] text-white border-[#2596be] shadow-lg shadow-[#2596be]/30"
          : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2596be]/50"
      }`}
    >
      {active && (
        <motion.div
          className="absolute inset-0 bg-[#2596be]"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon} {label}
      </span>
    </motion.button>
  );
}

function SmallTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-lg border px-3 py-2 text-sm flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden
      ${
        active
          ? "bg-[#2596be] text-white border-[#2596be] shadow-md shadow-[#2596be]/30"
          : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2596be]/50"
      }`}
    >
      {active && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon} {label}
      </span>
    </motion.button>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-[#2596be]/20 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
    >
      <h3 className="font-semibold flex items-center gap-2 mb-2 text-[#2596be]">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm mb-1">{label}</span>
      {children}
    </label>
  );
}