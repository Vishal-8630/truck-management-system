import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDrivers } from "@/hooks/useDrivers";
import { useMessageStore } from "@/store/useMessageStore";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import FormInputImage from "@/components/ui/FormInputImage";
import Button from "@/components/Button";
import { User, Save, ArrowLeft, Phone, ShieldCheck, FileText, Activity, Image as ImageIcon } from "lucide-react";

const NewDriverEntry = () => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((s) => s.addMessage);
  const { useAddDriverMutation } = useDrivers();
  const addDriver = useAddDriverMutation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    dl: "",
    licence_expiry: "",
    adhaar_no: "",
    notes: "",
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (value: string, name: string) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addMessage({ type: "error", text: "Driver name is required." });
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("driver_img", image);
      await addDriver.mutateAsync(fd);
      addMessage({ type: "success", text: "Driver registered successfully!" });
      navigate("/journey/all-driver-entries");
    } catch {
      addMessage({ type: "error", text: "Failed to register driver. Please try again." });
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-24">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-sm font-semibold mb-2 w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <User className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Register <span className="text-blue-600">Driver</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Onboard a new driver to your fleet registry.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <FormSection title="Personal Profile" icon={<User size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormInput
                  type="input"
                  inputType="text"
                  label="Full Name"
                  name="name"
                  placeholder="e.g. Rajesh Kumar"
                  value={form.name}
                  onChange={handleChange}
                />
                <FormInput
                  type="input"
                  inputType="tel"
                  label="Mobile Number"
                  name="phone"
                  placeholder="e.g. +91 98XXX XXXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
                <FormInput
                  type="input"
                  inputType="text"
                  label="Adhaar Card No."
                  name="adhaar_no"
                  placeholder="XXXX-XXXX-XXXX"
                  value={form.adhaar_no}
                  onChange={handleChange}
                />
              </div>
              <div className="mt-4">
                <FormInput
                  type="textarea"
                  label="Permanent Address"
                  name="address"
                  placeholder="House no, street, city..."
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </FormSection>

            <FormSection title="Official Documents" icon={<ShieldCheck size={18} />}>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormInput
                  type="input"
                  inputType="text"
                  label="Driving Licence No."
                  name="dl"
                  placeholder="e.g. DL-XXXXXXXXXXXXX"
                  value={form.dl}
                  onChange={handleChange}
                />
                <FormInput
                  type="date"
                  label="Licence Expiry"
                  name="licence_expiry"
                  value={form.licence_expiry}
                  onChange={handleChange}
                />
              </div>
            </FormSection>

            <FormSection title="Additional Notes" icon={<Activity size={18} />}>
              <FormInput
                type="textarea"
                label="Experience & Notes"
                name="notes"
                placeholder="Years of experience, previous routes, etc..."
                value={form.notes}
                onChange={handleChange}
              />
            </FormSection>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <FormSection title="Driver Photo" icon={<ImageIcon size={18} />}>
              <FormInputImage
                id="driver_img"
                name="driver_img"
                label="Profile Picture"
                isEditMode={true}
                onFileSelect={(file) => setImage(file)}
              />
            </FormSection>

            <FormSection title="Confirm Entry" icon={<FileText size={18} />}>
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-500 font-medium">Please ensure the driver's phone number and licence details match their official documents.</p>
                <Button
                  type="submit"
                  isLoading={addDriver.isPending}
                  icon={<Save size={20} />}
                  className="py-5 shadow-blue-500/30 w-full"
                >
                  Register Driver
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/journey/all-driver-entries')}
                  className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel Entry
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewDriverEntry;
